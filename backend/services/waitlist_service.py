from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from models.approval import Approval
from models.audit_log import AuditActionEnum
from models.booking import Booking, BookingStatusEnum
from models.notification import Notification
from models.resource import Resource
from models.user import RoleEnum, User
from models.waitlist import WaitlistEntry, WaitlistStatusEnum
from schemas.waitlist import WaitlistCreate
from services.audit_service import log_action
from services.conflict_service import check_booking_conflict, check_capacity, check_maintenance_block
from services.policy_service import enforce_policy
from utils.exceptions import ResourceNotFoundError, UnauthorizedAccessError
from utils.helpers import validate_future_datetime, validate_time_range
from utils.resource_rules import is_shared_capacity_resource
from utils.timezone import now_local_naive, to_local_naive


def create_waitlist_entry(db: Session, data: WaitlistCreate, current_user: User) -> WaitlistEntry:
    start_time = to_local_naive(data.start_time)
    end_time = to_local_naive(data.end_time)
    validate_future_datetime(start_time)
    validate_time_range(start_time, end_time)

    resource = db.query(Resource).filter(Resource.id == data.resource_id, Resource.is_active == True).first()
    if not resource:
        raise ResourceNotFoundError()

    existing = (
        db.query(WaitlistEntry)
        .filter(
            WaitlistEntry.user_id == current_user.id,
            WaitlistEntry.resource_id == data.resource_id,
            WaitlistEntry.start_time == start_time,
            WaitlistEntry.end_time == end_time,
            WaitlistEntry.status == WaitlistStatusEnum.active,
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="You are already on the waitlist for this slot.")

    entry = WaitlistEntry(
        user_id=current_user.id,
        resource_id=data.resource_id,
        start_time=start_time,
        end_time=end_time,
        purpose=data.purpose,
        attendees=data.attendees,
        status=WaitlistStatusEnum.active,
    )
    db.add(entry)
    db.flush()

    db.add(
        Notification(
            user_id=current_user.id,
            title="Waitlist Joined",
            message=f"You joined the waitlist for {resource.name} on {start_time.strftime('%Y-%m-%d %H:%M')}.",
        )
    )
    log_action(
        db,
        current_user.id,
        AuditActionEnum.booking_created,
        "waitlist",
        entry.id,
        {"resource_id": resource.id, "start_time": start_time.isoformat(), "end_time": end_time.isoformat()},
    )
    db.commit()
    db.refresh(entry)
    return entry


def get_my_waitlist_entries(db: Session, current_user: User) -> list[WaitlistEntry]:
    entries = (
        db.query(WaitlistEntry)
        .options(joinedload(WaitlistEntry.resource))
        .filter(WaitlistEntry.user_id == current_user.id)
        .order_by(WaitlistEntry.created_at.desc())
        .all()
    )
    now = now_local_naive()
    dirty = False
    for entry in entries:
        if entry.status == WaitlistStatusEnum.active and entry.end_time < now:
            entry.status = WaitlistStatusEnum.expired
            dirty = True
        entry.resource_name = entry.resource.name if entry.resource else f"Resource #{entry.resource_id}"
    if dirty:
        db.commit()
    return entries


def cancel_waitlist_entry(db: Session, waitlist_id: int, current_user: User) -> WaitlistEntry:
    entry = db.query(WaitlistEntry).options(joinedload(WaitlistEntry.resource)).filter(WaitlistEntry.id == waitlist_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist entry not found")
    if entry.user_id != current_user.id and current_user.role != RoleEnum.admin:
        raise UnauthorizedAccessError()
    if entry.status != WaitlistStatusEnum.active:
        raise HTTPException(status_code=422, detail="Only active waitlist entries can be cancelled.")

    entry.status = WaitlistStatusEnum.cancelled
    db.commit()
    db.refresh(entry)
    entry.resource_name = entry.resource.name if entry.resource else f"Resource #{entry.resource_id}"
    return entry


def _create_booking_from_waitlist(db: Session, entry: WaitlistEntry) -> Booking:
    resource = db.query(Resource).filter(Resource.id == entry.resource_id, Resource.is_active == True).with_for_update().first()
    if not resource:
        raise ResourceNotFoundError()

    start_time = to_local_naive(entry.start_time)
    end_time = to_local_naive(entry.end_time)

    enforce_policy(db, resource.id, start_time, end_time)
    check_maintenance_block(db, resource.id, start_time, end_time)
    if not is_shared_capacity_resource(resource):
        check_booking_conflict(db, resource.id, start_time, end_time)
    check_capacity(db, resource.id, start_time, end_time, entry.attendees)

    user_manager_id = entry.user.department.manager_id if entry.user and entry.user.department else None
    is_mgmt = entry.user and entry.user.role in [RoleEnum.manager, RoleEnum.admin]

    if is_mgmt:
        status = BookingStatusEnum.approved
        requires_approval = False
        manager_id = None
    elif resource.approval_required:
        status = BookingStatusEnum.pending
        requires_approval = True
        manager_id = user_manager_id
        if manager_id is None:
            raise HTTPException(status_code=422, detail="No manager assigned to your department. Contact admin.")
    else:
        status = BookingStatusEnum.approved
        requires_approval = False
        manager_id = None

    booking = Booking(
        user_id=entry.user_id,
        resource_id=entry.resource_id,
        start_time=start_time,
        end_time=end_time,
        purpose=entry.purpose,
        attendees=entry.attendees,
        status=status,
    )
    db.add(booking)
    db.flush()

    if requires_approval:
        db.add(Approval(booking_id=booking.id, manager_id=manager_id))
        log_action(
            db,
            entry.user_id,
            AuditActionEnum.booking_created,
            "booking",
            booking.id,
            {"status": "pending", "source": "waitlist", "resource_id": resource.id},
        )
    else:
        log_action(
            db,
            entry.user_id,
            AuditActionEnum.booking_auto_approved,
            "booking",
            booking.id,
            {"status": "approved", "source": "waitlist", "resource_id": resource.id},
        )

    entry.status = WaitlistStatusEnum.fulfilled
    entry.booking_id = booking.id
    db.add(
        Notification(
            user_id=entry.user_id,
            title="Waitlist Fulfilled",
            message=f"Your waitlisted slot for {resource.name} on {start_time.strftime('%Y-%m-%d %H:%M')} is now reserved.",
        )
    )
    return booking


def process_waitlist_for_resource(
    db: Session,
    resource_id: int,
    slot_start,
    slot_end,
) -> list[Booking]:
    slot_start = to_local_naive(slot_start)
    slot_end = to_local_naive(slot_end)
    now = now_local_naive()
    fulfilled: list[Booking] = []

    entries = (
        db.query(WaitlistEntry)
        .options(joinedload(WaitlistEntry.user).joinedload(User.department), joinedload(WaitlistEntry.resource))
        .filter(
            WaitlistEntry.resource_id == resource_id,
            WaitlistEntry.status == WaitlistStatusEnum.active,
            WaitlistEntry.start_time < slot_end,
            WaitlistEntry.end_time > slot_start,
        )
        .order_by(WaitlistEntry.created_at.asc(), WaitlistEntry.start_time.asc())
        .all()
    )

    for entry in entries:
        if entry.end_time < now:
            entry.status = WaitlistStatusEnum.expired
            continue
        try:
            booking = _create_booking_from_waitlist(db, entry)
            fulfilled.append(booking)
        except HTTPException:
            db.rollback()
            fresh_entry = db.query(WaitlistEntry).filter(WaitlistEntry.id == entry.id).first()
            if fresh_entry and fresh_entry.status == WaitlistStatusEnum.active:
                continue
        else:
            db.commit()

    return fulfilled
