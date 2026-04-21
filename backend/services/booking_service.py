from sqlalchemy.orm import Session
from models.booking import Booking, BookingStatusEnum
from models.approval import Approval
from models.resource import Resource
from models.user import User, RoleEnum
from schemas.booking import BookingCreate
from services.conflict_service import check_booking_conflict, check_capacity, check_maintenance_block
from services.policy_service import enforce_policy
from services.audit_service import log_action
from models.audit_log import AuditActionEnum
from utils.exceptions import (
    BookingNotFoundError, UnauthorizedAccessError, InvalidStateTransitionError, NoManagerAssignedError
)
from utils.helpers import validate_future_datetime, validate_time_range
from utils.timezone import now_local_naive, to_local_naive


def create_booking(db: Session, data: BookingCreate, current_user: User) -> Booking:
    start_time = to_local_naive(data.start_time)
    end_time = to_local_naive(data.end_time)

    validate_future_datetime(start_time)
    validate_time_range(start_time, end_time)

    resource = db.query(Resource).filter(Resource.id == data.resource_id, Resource.is_active == True).first()
    if not resource:
        from utils.exceptions import ResourceNotFoundError
        raise ResourceNotFoundError()

    # Run all validation checks
    enforce_policy(db, data.resource_id, start_time, end_time)
    check_maintenance_block(db, data.resource_id, start_time, end_time)
    check_booking_conflict(db, data.resource_id, start_time, end_time)
    check_capacity(db, data.resource_id, start_time, end_time, data.attendees)

    # Determine initial status
    if resource.approval_required:
        status = BookingStatusEnum.pending
    else:
        status = BookingStatusEnum.approved

    booking = Booking(
        user_id=current_user.id,
        resource_id=data.resource_id,
        start_time=start_time,
        end_time=end_time,
        purpose=data.purpose,
        attendees=data.attendees,
        status=status
    )
    db.add(booking)
    db.flush()

    if resource.approval_required:
        # Find manager of the user's department
        dept = current_user.department
        if not dept or not dept.manager_id:
            raise NoManagerAssignedError()
        approval = Approval(booking_id=booking.id, manager_id=dept.manager_id)
        db.add(approval)
        log_action(db, current_user.id, AuditActionEnum.booking_created, "booking", booking.id,
                   {"status": "pending", "resource_id": data.resource_id})
    else:
        log_action(db, current_user.id, AuditActionEnum.booking_auto_approved, "booking", booking.id,
                   {"status": "approved", "resource_id": data.resource_id})

    db.commit()
    db.refresh(booking)
    return booking


def refresh_completed_bookings(db: Session) -> int:
    """Promote expired approved bookings to completed and write an audit entry."""
    now = now_local_naive()
    updated = db.query(Booking).filter(
        Booking.status == BookingStatusEnum.approved,
        Booking.end_time < now
    ).all()
    count = 0
    for booking in updated:
        booking.status = BookingStatusEnum.completed
        log_action(
            db,
            booking.user_id,
            AuditActionEnum.booking_completed,
            "booking",
            booking.id,
            {"completed_at": now.isoformat()}
        )
        count += 1
    if count:
        db.commit()
    return count


def cancel_booking(db: Session, booking_id: int, current_user: User) -> Booking:
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise BookingNotFoundError()

    # Only the owner or admin can cancel
    if booking.user_id != current_user.id and current_user.role != RoleEnum.admin:
        raise UnauthorizedAccessError()

    valid_cancel_states = [BookingStatusEnum.pending, BookingStatusEnum.approved]
    if booking.status not in valid_cancel_states:
        raise InvalidStateTransitionError(booking.status.value, "cancelled")

    # Must be before start time
    if booking.start_time <= now_local_naive():
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Cannot cancel a booking that has already started")

    booking.status = BookingStatusEnum.cancelled
    log_action(db, current_user.id, AuditActionEnum.booking_cancelled, "booking", booking.id)
    db.commit()
    db.refresh(booking)
    return booking


def get_bookings(db: Session, current_user: User, skip: int = 0, limit: int = 50):
    refresh_completed_bookings(db)
    q = db.query(Booking)
    if current_user.role == RoleEnum.employee:
        q = q.filter(Booking.user_id == current_user.id)
    return q.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


def get_booking_by_id(db: Session, booking_id: int, current_user: User) -> Booking:
    refresh_completed_bookings(db)
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise BookingNotFoundError()
    if current_user.role == RoleEnum.employee and booking.user_id != current_user.id:
        raise UnauthorizedAccessError()
    return booking


def mark_completed(db: Session) -> int:
    """Backward-compatible wrapper for callers expecting the old helper."""
    return refresh_completed_bookings(db)
