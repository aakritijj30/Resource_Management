from sqlalchemy.orm import Session
from datetime import datetime, time
from fastapi import HTTPException
from models.resource_policy import ResourcePolicy
from utils.office_hours import GLOBAL_OFFICE_HOURS_END, GLOBAL_OFFICE_HOURS_START, office_hours_label
from utils.timezone import now_local_naive, to_local_naive

def get_policy(db: Session, resource_id: int) -> ResourcePolicy:
    return db.query(ResourcePolicy).filter(ResourcePolicy.resource_id == resource_id).first()

def upsert_policy(db: Session, resource_id: int, policy_data: dict) -> ResourcePolicy:
    from models.resource import Resource
    policy = get_policy(db, resource_id)
    if not policy:
        policy = ResourcePolicy(resource_id=resource_id, **policy_data)
        db.add(policy)
    else:
        for key, value in policy_data.items():
            setattr(policy, key, value)
    
    # Sync capacity with Resource if provided
    if "max_attendees" in policy_data and policy_data["max_attendees"] is not None:
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        if resource:
            resource.capacity = policy_data["max_attendees"]
            
    db.flush()
    return policy

def enforce_policy(db: Session, resource_id: int, start_time: datetime, end_time: datetime):
    """Step 2: Policy validation - validates custom constraints per resource."""
    start_time = to_local_naive(start_time)
    end_time = to_local_naive(end_time)
    policy = get_policy(db, resource_id)
    if not policy:
        return

    duration_hours = (end_time - start_time).total_seconds() / 3600.0

    if policy.min_duration_hours and duration_hours < policy.min_duration_hours:
        raise HTTPException(status_code=422, detail=f"Minimum booking duration is {policy.min_duration_hours} hours.")

    if policy.max_duration_hours and duration_hours > policy.max_duration_hours:
        raise HTTPException(status_code=422, detail=f"Maximum booking duration is {policy.max_duration_hours} hours.")

    if policy.office_hours_start is not None and policy.office_hours_end is not None:
        office_start = time(GLOBAL_OFFICE_HOURS_START, 0)
        office_end = time(GLOBAL_OFFICE_HOURS_END, 0)
        if start_time.time() < office_start or end_time.time() > office_end:
            raise HTTPException(status_code=422, detail=f"Booking must fall strictly within office hours ({office_hours_label()}).")

    if policy.advance_booking_days is not None:
        advance_days = (start_time.date() - now_local_naive().date()).days
        if advance_days > policy.advance_booking_days:
            raise HTTPException(status_code=422, detail=f"Cannot book more than {policy.advance_booking_days} days in advance.")

    if policy.allowed_days is not None:
        weekday_bit = 1 << start_time.weekday()
        if not (policy.allowed_days & weekday_bit):
            raise HTTPException(status_code=422, detail="Booking is not allowed on this day of the week based on resource policy.")
