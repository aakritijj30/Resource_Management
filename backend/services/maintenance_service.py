from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from models.maintenance_block import MaintenanceBlock
from models.booking import Booking, BookingStatusEnum
from models.audit_log import AuditActionEnum
from services.audit_service import log_action
from schemas.maintenance import MaintenanceCreate
from utils.helpers import validate_future_datetime, validate_time_range
from utils.timezone import to_local_naive

def get_maintenance_blocks(db: Session):
    blocks = db.query(MaintenanceBlock).options(joinedload(MaintenanceBlock.resource)).order_by(MaintenanceBlock.start_time.desc()).all()
    for b in blocks:
        b.resource_name = b.resource.name if b.resource else f"Resource #{b.resource_id}"
    return blocks

def get_relevant_maintenance_blocks(db: Session, user_dept_id: int):
    """Returns maintenance blocks for common resources or resources in the user's department."""
    from models.resource import Resource
    from utils.timezone import now_local_naive
    
    blocks = (
        db.query(MaintenanceBlock)
        .options(joinedload(MaintenanceBlock.resource))
        .join(Resource)
        .filter(
            (Resource.department_id == None) | (Resource.department_id == user_dept_id),
            MaintenanceBlock.end_time >= now_local_naive()
        )
        .order_by(MaintenanceBlock.start_time.asc())
        .all()
    )
    for b in blocks:
        b.resource_name = b.resource.name if b.resource else f"Resource #{b.resource_id}"
    return blocks

def create_maintenance_block(db: Session, data: MaintenanceCreate, admin_id: int):
    start_time = to_local_naive(data.start_time)
    end_time = to_local_naive(data.end_time)
    validate_future_datetime(start_time)
    validate_time_range(start_time, end_time)
    block = MaintenanceBlock(
        resource_id=data.resource_id,
        start_time=start_time,
        end_time=end_time,
        reason=data.reason,
        created_by=admin_id
    )
    db.add(block)
    db.flush()

    log_action(db, admin_id, AuditActionEnum.maintenance_created, "maintenance_block", block.id, {"resource_id": data.resource_id})

    # Creating a block auto-cancels all overlapping pending/approved bookings
    overlapping_bookings = db.query(Booking).filter(
        Booking.resource_id == data.resource_id,
        Booking.status.in_([BookingStatusEnum.pending, BookingStatusEnum.approved]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    ).all()

    for booking in overlapping_bookings:
        booking.status = BookingStatusEnum.cancelled
        log_action(
            db, admin_id, AuditActionEnum.booking_cancelled, "booking", booking.id, 
            {"reason": f"Cancelled due to system maintenance: {data.reason}"}
        )

    db.commit()
    db.refresh(block)
    block.resource_name = block.resource.name if block.resource else f"Resource #{block.resource_id}"
    return block

def delete_maintenance_block(db: Session, block_id: int, admin_id: int):
    block = db.query(MaintenanceBlock).filter(MaintenanceBlock.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Maintenance block not found")

    resource_id = block.resource_id
    db.delete(block)
    log_action(db, admin_id, AuditActionEnum.maintenance_deleted, "maintenance_block", block_id, {"resource_id": resource_id})
    db.commit()
