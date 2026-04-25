from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from models.booking import Booking, BookingStatusEnum
from models.maintenance_block import MaintenanceBlock
from models.resource import Resource
from utils.timezone import to_local_naive

def check_maintenance_block(db: Session, resource_id: int, start_time: datetime, end_time: datetime):
    """Step 3: Maintenance block check -> raises if overlap."""
    start_time = to_local_naive(start_time)
    end_time = to_local_naive(end_time)
    overlap = db.query(MaintenanceBlock).filter(
        MaintenanceBlock.resource_id == resource_id,
        MaintenanceBlock.start_time < end_time,
        MaintenanceBlock.end_time > start_time
    ).first()
    
    if overlap:
        resource_name = overlap.resource.name if overlap.resource else f"Resource #{resource_id}"
        time_fmt = "%Y-%m-%d %H:%M"
        interval = f"{overlap.start_time.strftime(time_fmt)} to {overlap.end_time.strftime(time_fmt)}"
        raise HTTPException(
            status_code=409, 
            detail=f"Maintenance Alert: '{resource_name}' is unavailable from {interval}. Reason: {overlap.reason}"
        )

def check_booking_conflict(db: Session, resource_id: int, start_time: datetime, end_time: datetime, exclude_booking_id: int = None):
    """Step 4: Booking conflict check -> raises if new_start < exist_end AND new_end > exist_start."""
    start_time = to_local_naive(start_time)
    end_time = to_local_naive(end_time)
    query = db.query(Booking).filter(
        Booking.resource_id == resource_id,
        Booking.status.in_([BookingStatusEnum.approved, BookingStatusEnum.pending]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    if query.first():
        raise HTTPException(status_code=409, detail="Time slot overlaps with an existing or pending booking.")

def check_capacity(db: Session, resource_id: int, start_time: datetime, end_time: datetime, attendees: int, exclude_booking_id: int = None):
    """Step 5: Capacity check -> sums concurrent attendees vs resource capacity."""
    start_time = to_local_naive(start_time)
    end_time = to_local_naive(end_time)
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        return

    query = db.query(Booking).filter(
        Booking.resource_id == resource_id,
        Booking.status.in_([BookingStatusEnum.approved, BookingStatusEnum.pending]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        query = query.filter(Booking.id != exclude_booking_id)

    # Calculate max concurrent attendees using a sweep-line algorithm to handle staggered overlaps
    events = [(start_time, attendees), (end_time, -attendees)]
    for b in query.all():
        curr_start = max(b.start_time, start_time)
        curr_end = min(b.end_time, end_time)
        if curr_start < curr_end:
            events.extend([(curr_start, b.attendees), (curr_end, -b.attendees)])

    # Sort by time. If equal, process capacity drops (ends) before jumps (starts)
    events.sort(key=lambda x: (x[0], x[1] > 0))

    concurrent = 0
    for time_point, change in events:
        concurrent += change
        if concurrent > resource.capacity:
            raise HTTPException(
                status_code=409, 
                detail=f"Capacity exceeded at {time_point.strftime('%H:%M')}. Resource max capacity is {resource.capacity}."
            )
