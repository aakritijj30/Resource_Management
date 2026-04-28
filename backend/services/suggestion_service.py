from datetime import datetime, timedelta, time
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.resource import Resource
from models.resource_policy import ResourcePolicy
from models.user import User, RoleEnum
from services.conflict_service import check_booking_conflict, check_capacity, check_maintenance_block
from services.policy_service import enforce_policy, get_policy
from utils.resource_rules import is_shared_capacity_resource
from utils.timezone import now_local_naive, to_local_naive


SUGGESTION_SCAN_DAYS = 7
SUGGESTION_STEP_MINUTES = 30
SUGGESTION_LIMIT = 3


def _resource_visible_to_user(resource: Resource, user: User) -> bool:
    if user.role == RoleEnum.admin:
        return True
    return resource.department_id is None or resource.department_id == user.department_id


def _resource_allowed_by_policy(policy: Optional[ResourcePolicy], user: User) -> bool:
    if not policy or not policy.allowed_department_ids:
        return True
    if user.role == RoleEnum.admin:
        return True
    return user.department_id in policy.allowed_department_ids


def _resource_is_eligible(db: Session, resource: Resource, user: User, attendees: int) -> bool:
    if not resource.is_active or resource.capacity < attendees:
        return False
    if not _resource_visible_to_user(resource, user):
        return False
    return _resource_allowed_by_policy(get_policy(db, resource.id), user)


def _is_slot_usable(
    db: Session,
    resource: Resource,
    start_time: datetime,
    end_time: datetime,
    attendees: int,
    exclude_booking_id: Optional[int] = None,
) -> bool:
    try:
        enforce_policy(db, resource.id, start_time, end_time)
        check_maintenance_block(db, resource.id, start_time, end_time)
        if not is_shared_capacity_resource(resource):
            check_booking_conflict(db, resource.id, start_time, end_time, exclude_booking_id)
        check_capacity(db, resource.id, start_time, end_time, attendees, exclude_booking_id)
    except HTTPException:
        return False
    return True


def _format_slot(resource: Resource, start_time: datetime, end_time: datetime) -> dict:
    return {
        "resource_id": resource.id,
        "resource_name": resource.name,
        "resource_location": resource.location,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
    }


def _slot_search_start(requested_start: datetime) -> datetime:
    baseline = max(to_local_naive(requested_start), now_local_naive())
    if baseline.minute % SUGGESTION_STEP_MINUTES == 0 and baseline.second == 0 and baseline.microsecond == 0:
        return baseline
    rounded_minutes = ((baseline.minute // SUGGESTION_STEP_MINUTES) + 1) * SUGGESTION_STEP_MINUTES
    if rounded_minutes >= 60:
        baseline = baseline.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
    else:
        baseline = baseline.replace(minute=rounded_minutes, second=0, microsecond=0)
    return baseline


def get_next_available_slots(
    db: Session,
    resource: Resource,
    requested_start: datetime,
    requested_end: datetime,
    attendees: int,
    limit: int = SUGGESTION_LIMIT,
    exclude_booking_id: Optional[int] = None,
) -> list[dict]:
    duration = to_local_naive(requested_end) - to_local_naive(requested_start)
    cursor = _slot_search_start(requested_start)
    horizon = cursor + timedelta(days=SUGGESTION_SCAN_DAYS)
    suggestions: list[dict] = []
    seen: set[tuple[str, str]] = set()

    while cursor < horizon and len(suggestions) < limit:
        end_cursor = cursor + duration
        if _is_slot_usable(db, resource, cursor, end_cursor, attendees, exclude_booking_id):
            key = (cursor.isoformat(), end_cursor.isoformat())
            if key not in seen:
                suggestions.append(_format_slot(resource, cursor, end_cursor))
                seen.add(key)
        cursor += timedelta(minutes=SUGGESTION_STEP_MINUTES)
    return suggestions


def get_similar_resource_suggestions(
    db: Session,
    resource: Resource,
    requested_start: datetime,
    requested_end: datetime,
    attendees: int,
    current_user: User,
    limit: int = SUGGESTION_LIMIT,
) -> list[dict]:
    requested_start = to_local_naive(requested_start)
    requested_end = to_local_naive(requested_end)

    candidates = (
        db.query(Resource)
        .filter(Resource.id != resource.id, Resource.type == resource.type, Resource.is_active == True)
        .all()
    )

    ranked: list[tuple[tuple[int, int, int], dict]] = []
    for candidate in candidates:
        if not _resource_is_eligible(db, candidate, current_user, attendees):
            continue

        exact_match = _is_slot_usable(db, candidate, requested_start, requested_end, attendees)
        candidate_slot = None
        delay_minutes = 0

        if exact_match:
            candidate_slot = _format_slot(candidate, requested_start, requested_end)
        else:
            next_slots = get_next_available_slots(db, candidate, requested_start, requested_end, attendees, limit=1)
            if not next_slots:
                continue
            candidate_slot = next_slots[0]
            delay_minutes = int(
                (to_local_naive(datetime.fromisoformat(candidate_slot["start_time"])) - requested_start).total_seconds() / 60
            )

        same_scope = 0 if candidate.department_id == resource.department_id else 1
        same_location = 0 if (candidate.location or "").strip() == (resource.location or "").strip() else 1
        ranked.append(((same_scope, delay_minutes, same_location), candidate_slot))

    ranked.sort(key=lambda item: item[0])
    return [item[1] for item in ranked[:limit]]


def build_booking_failure_detail(
    db: Session,
    resource: Resource,
    requested_start: datetime,
    requested_end: datetime,
    attendees: int,
    current_user: User,
    message: str,
    reason: str,
    exclude_booking_id: Optional[int] = None,
) -> dict:
    requested_start = to_local_naive(requested_start)
    requested_end = to_local_naive(requested_end)

    next_slots = get_next_available_slots(
        db,
        resource,
        requested_start + timedelta(minutes=SUGGESTION_STEP_MINUTES),
        requested_end + timedelta(minutes=SUGGESTION_STEP_MINUTES),
        attendees,
        limit=SUGGESTION_LIMIT,
        exclude_booking_id=exclude_booking_id,
    )
    same_resource_next_slot = next_slots[0] if next_slots else None
    similar_resources = get_similar_resource_suggestions(
        db, resource, requested_start, requested_end, attendees, current_user, limit=SUGGESTION_LIMIT
    )

    return {
        "type": "booking_unavailable",
        "reason": reason,
        "message": message,
        "waitlist_eligible": reason in {"conflict", "capacity", "maintenance"},
        "suggestions": {
            "same_resource_next_slot": same_resource_next_slot,
            "nearby_slots": next_slots,
            "similar_resources": similar_resources,
        },
    }
