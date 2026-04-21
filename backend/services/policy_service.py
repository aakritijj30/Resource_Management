from sqlalchemy.orm import Session
from datetime import datetime, time, timezone
from fastapi import HTTPException
from models.resource_policy import ResourcePolicy

def get_policy(db: Session, resource_id: int) -> ResourcePolicy:
    return db.query(ResourcePolicy).filter(ResourcePolicy.resource_id == resource_id).first()

def upsert_policy(db: Session, resource_id: int, policy_data: dict) -> ResourcePolicy:
    policy = get_policy(db, resource_id)
    if not policy:
        policy = ResourcePolicy(resource_id=resource_id, **policy_data)
        db.add(policy)
    else:
        for key, value in policy_data.items():
            setattr(policy, key, value)
    db.flush()
    return policy

def enforce_policy(db: Session, resource_id: int, start_time: datetime, end_time: datetime):
    """Step 2: Policy validation - validates custom constraints per resource."""
    policy = get_policy(db, resource_id)
    if not policy:
        return

    duration_hours = (end_time - start_time).total_seconds() / 3600.0

    if policy.min_duration_hours and duration_hours < policy.min_duration_hours:
        raise HTTPException(status_code=422, detail=f"Minimum booking duration is {policy.min_duration_hours} hours.")

    if policy.max_duration_hours and duration_hours > policy.max_duration_hours:
        raise HTTPException(status_code=422, detail=f"Maximum booking duration is {policy.max_duration_hours} hours.")

    if policy.office_hours_start is not None and policy.office_hours_end is not None:
        office_start = time(policy.office_hours_start, 0)
        office_end = time(policy.office_hours_end, 0)
        if start_time.time() < office_start or end_time.time() > office_end:
            raise HTTPException(
                status_code=422, 
                detail=f"Booking must fall strictly within office hours ({policy.office_hours_start}:00 - {policy.office_hours_end}:00)."
            )

    if policy.advance_booking_days is not None:
        advance_days = (start_time.date() - datetime.now(timezone.utc).date()).days
        if advance_days > policy.advance_booking_days:
            raise HTTPException(status_code=422, detail=f"Cannot book more than {policy.advance_booking_days} days in advance.")

    if policy.allowed_days is not None:
        weekday_bit = 1 << start_time.weekday()
        if not (policy.allowed_days & weekday_bit):
            raise HTTPException(status_code=422, detail="Booking is not allowed on this day of the week based on resource policy.")