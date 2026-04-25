from sqlalchemy.orm import Session, joinedload
from models.booking import Booking, BookingStatusEnum
from models.approval import Approval
from models.approval import ApprovalDecisionEnum
from models.audit_log import AuditLog
from models.notification import Notification
from models.resource import Resource
from models.user import User, RoleEnum
from schemas.booking import BookingCreate, BookingUpdate
from services.conflict_service import check_booking_conflict, check_capacity, check_maintenance_block
from services.policy_service import enforce_policy
from services.audit_service import log_action
from models.audit_log import AuditActionEnum
from utils.exceptions import (
    BookingNotFoundError, UnauthorizedAccessError, InvalidStateTransitionError, NoManagerAssignedError
)
from utils.helpers import validate_future_datetime, validate_time_range
from utils.timezone import now_local_naive, to_local_naive
from datetime import datetime


def check_and_preempt_conflicts(db: Session, resource_id: int, start_time: datetime, end_time: datetime, current_user: User, exclude_booking_id: int = None):
    """If manager/admin, preempt employee bookings. Otherwise raise conflict."""
    if current_user.role not in [RoleEnum.manager, RoleEnum.admin]:
        check_booking_conflict(db, resource_id, start_time, end_time, exclude_booking_id)
        return

    conflicts = db.query(Booking).options(joinedload(Booking.user)).filter(
        Booking.resource_id == resource_id,
        Booking.status.in_([BookingStatusEnum.approved, BookingStatusEnum.pending]),
        Booking.start_time < end_time,
        Booking.end_time > start_time
    )
    if exclude_booking_id:
        conflicts = conflicts.filter(Booking.id != exclude_booking_id)

    conflict_list = conflicts.all()
    if not conflict_list:
        return

    # If any conflict is with a Manager or Admin, we cannot preempt.
    if any(b.user.role in [RoleEnum.manager, RoleEnum.admin] for b in conflict_list):
        check_booking_conflict(db, resource_id, start_time, end_time, exclude_booking_id)

    # Preempt employee bookings
    for b in conflict_list:
        b.status = BookingStatusEnum.cancelled
        log_action(db, current_user.id, AuditActionEnum.booking_cancelled, "booking", b.id,
                   {"reason": f"Priority booking by {current_user.role.value} {current_user.full_name}", "preempted_by_role": current_user.role.value})
        
        notif = Notification(
            user_id=b.user_id,
            title="Booking Cancelled (Priority)",
            message=f"Your booking for resource #{b.resource_id} starting at {b.start_time.isoformat()} was cancelled because a manager requires the slot."
        )
        db.add(notif)
    db.flush()


from datetime import timedelta

def create_booking(db: Session, data: BookingCreate, current_user: User) -> list[Booking]:
    start_time = to_local_naive(data.start_time)
    end_time = to_local_naive(data.end_time)

    # Validate overall dates
    validate_future_datetime(start_time)

    resource = db.query(Resource).filter(Resource.id == data.resource_id, Resource.is_active == True).first()
    if not resource:
        from utils.exceptions import ResourceNotFoundError
        raise ResourceNotFoundError()

    # Determine initial status and approval routing
    user_manager_id = current_user.department.manager_id if current_user.department else None
    is_mgmt = current_user.role in [RoleEnum.manager, RoleEnum.admin]

    if is_mgmt:
        status = BookingStatusEnum.approved
        requires_approval_record = False
        manager_id = None
    elif resource.approval_required:
        status = BookingStatusEnum.pending
        requires_approval_record = True
        manager_id = user_manager_id
    else:
        status = BookingStatusEnum.approved
        requires_approval_record = False
        manager_id = None

    start_date = start_time.date()
    end_date = end_time.date()
    daily_start_time = start_time.time()
    daily_end_time = end_time.time()
    
    if daily_end_time <= daily_start_time:
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="End time must be after start time on the given days.")

    created_bookings = []
    current_date = start_date

    while current_date <= end_date:
        slot_start = datetime.combine(current_date, daily_start_time)
        slot_end = datetime.combine(current_date, daily_end_time)
        
        # Validation checks per day
        enforce_policy(db, data.resource_id, slot_start, slot_end)
        check_maintenance_block(db, data.resource_id, slot_start, slot_end)
        check_and_preempt_conflicts(db, data.resource_id, slot_start, slot_end, current_user)
        check_capacity(db, data.resource_id, slot_start, slot_end, data.attendees)

        booking = Booking(
            user_id=current_user.id,
            resource_id=data.resource_id,
            start_time=slot_start,
            end_time=slot_end,
            purpose=data.purpose,
            attendees=data.attendees,
            status=status
        )
        db.add(booking)
        db.flush()

        if requires_approval_record:
            approval = Approval(booking_id=booking.id, manager_id=manager_id)
            db.add(approval)
            log_action(db, current_user.id, AuditActionEnum.booking_created, "booking", booking.id,
                       {"status": "pending", "resource_id": data.resource_id, "assigned_manager": manager_id})
        else:
            log_action(db, current_user.id, AuditActionEnum.booking_auto_approved, "booking", booking.id,
                       {"status": "approved", "resource_id": data.resource_id})
            
        created_bookings.append(booking)
        current_date += timedelta(days=1)

    db.commit()
    for b in created_bookings:
        db.refresh(b)
    return created_bookings


def update_booking(db: Session, booking_id: int, data: BookingUpdate, current_user: User) -> Booking:
    booking = db.query(Booking).options(joinedload(Booking.approval), joinedload(Booking.user)).filter(Booking.id == booking_id).first()
    if not booking:
        raise BookingNotFoundError()

    if booking.user_id != current_user.id and current_user.role != RoleEnum.admin:
        raise UnauthorizedAccessError()

    if booking.status not in [BookingStatusEnum.pending, BookingStatusEnum.approved]:
        raise InvalidStateTransitionError(booking.status.value, "updated")

    if booking.start_time <= now_local_naive():
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Cannot edit a booking that has already started")

    next_resource_id = data.resource_id or booking.resource_id
    next_start = to_local_naive(data.start_time) if data.start_time else booking.start_time
    next_end = to_local_naive(data.end_time) if data.end_time else booking.end_time

    validate_future_datetime(next_start)
    validate_time_range(next_start, next_end)

    resource = db.query(Resource).filter(Resource.id == next_resource_id, Resource.is_active == True).first()
    if not resource:
        from utils.exceptions import ResourceNotFoundError
        raise ResourceNotFoundError()

    enforce_policy(db, next_resource_id, next_start, next_end)
    check_maintenance_block(db, next_resource_id, next_start, next_end)
    check_and_preempt_conflicts(db, next_resource_id, next_start, next_end, current_user, exclude_booking_id=booking.id)
    next_attendees = data.attendees if data.attendees is not None else booking.attendees
    check_capacity(db, next_resource_id, next_start, next_end, next_attendees, exclude_booking_id=booking.id)

    previous_status = booking.status
    approval_required = resource.approval_required

    if data.resource_id is not None:
        booking.resource_id = next_resource_id
    if data.start_time is not None:
        booking.start_time = next_start
    if data.end_time is not None:
        booking.end_time = next_end
    if data.purpose is not None:
        booking.purpose = data.purpose
    if data.attendees is not None:
        booking.attendees = data.attendees

    # Manager checking
    manager_id = None
    if booking.user and booking.user.department:
        manager_id = booking.user.department.manager_id
        
    is_mgmt = current_user.role in [RoleEnum.manager, RoleEnum.admin]

    if (approval_required or (not is_mgmt and manager_id is None)) and booking.status == BookingStatusEnum.approved:
        booking.status = BookingStatusEnum.pending
        if booking.approval:
            booking.approval.decision = ApprovalDecisionEnum.pending
            booking.approval.comment = "Edited booking; reapproval required."
            booking.approval.decided_at = None
        else:
            approval = Approval(booking_id=booking.id, manager_id=manager_id)
            db.add(approval)
    elif not approval_required and is_mgmt and booking.status == BookingStatusEnum.pending:
        booking.status = BookingStatusEnum.approved
        if booking.approval:
            db.delete(booking.approval)

    log_action(
        db,
        current_user.id,
        AuditActionEnum.booking_updated,
        "booking",
        booking.id,
        {
            "resource_id": booking.resource_id,
            "purpose": booking.purpose,
            "attendees": booking.attendees,
            "start_time": booking.start_time.isoformat(),
            "end_time": booking.end_time.isoformat(),
            "previous_status": previous_status.value,
            "status": booking.status.value,
        },
    )

    db.commit()
    db.refresh(booking)
    return booking


def refresh_completed_bookings(db: Session) -> int:
    """Promote expired approved bookings to completed, and expire pending bookings."""
    now = now_local_naive()
    count = 0
    
    updated_approved = db.query(Booking).filter(
        Booking.status == BookingStatusEnum.approved,
        Booking.end_time < now
    ).all()
    for booking in updated_approved:
        booking.status = BookingStatusEnum.completed
        log_action(
            db, booking.user_id, AuditActionEnum.booking_completed, "booking", booking.id, {"completed_at": now.isoformat()}
        )
        count += 1
        
    updated_pending = db.query(Booking).filter(
        Booking.status == BookingStatusEnum.pending,
        Booking.end_time < now
    ).all()
    for booking in updated_pending:
        booking.status = BookingStatusEnum.cancelled
        log_action(
            db, booking.user_id, AuditActionEnum.booking_cancelled, "booking", booking.id, {"reason": "Expired before approval"}
        )
        if booking.approval:
            booking.approval.decision = ApprovalDecisionEnum.rejected
            booking.approval.comment = "Auto-rejected due to expiration"
            booking.approval.decided_at = now
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

    # Must be before end time
    if booking.end_time <= now_local_naive():
        from fastapi import HTTPException
        raise HTTPException(status_code=422, detail="Cannot cancel a booking that has already ended")

    booking.status = BookingStatusEnum.cancelled
    log_action(
        db,
        current_user.id,
        AuditActionEnum.booking_cancelled,
        "booking",
        booking.id,
        {
            "cancelled_by": current_user.full_name,
            "cancelled_by_role": current_user.role.value if hasattr(current_user.role, "value") else current_user.role,
        },
    )
    db.commit()
    db.refresh(booking)
    return booking


def get_bookings(db: Session, current_user: User, skip: int = 0, limit: int = 50, mine_only: bool = False):
    refresh_completed_bookings(db)
    q = db.query(Booking).options(joinedload(Booking.user), joinedload(Booking.approval))
    if mine_only or current_user.role == RoleEnum.employee:
        q = q.filter(Booking.user_id == current_user.id)
    
    results = q.order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()
    
    # Manually attach names for the schema to pick up, or rely on relationships if lazy loading is fast enough.
    # To be safe and avoid N+1, we can just ensure they are loaded.
    for b in results:
        b.user_name = b.user.full_name if b.user else f"User #{b.user_id}"
        b.resource_name = b.resource.name if b.resource else f"Resource #{b.resource_id}"
        
    return results


def get_department_bookings(db: Session, manager: User, skip: int = 0, limit: int = 50):
    """Returns all bookings from users in the manager's department."""
    refresh_completed_bookings(db)
    if not manager.department_id:
        return []
    results = (
        db.query(Booking)
        .options(joinedload(Booking.user), joinedload(Booking.resource), joinedload(Booking.approval))
        .join(User, Booking.user_id == User.id)
        .filter(User.department_id == manager.department_id)
        .filter(Booking.user_id != manager.id)  # Exclude manager's own bookings
        .order_by(Booking.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    for b in results:
        b.user_name = b.user.full_name if b.user else f"User #{b.user_id}"
        b.resource_name = b.resource.name if b.resource else f"Resource #{b.resource_id}"
    
    return results


def get_booking_by_id(db: Session, booking_id: int, current_user: User) -> Booking:
    refresh_completed_bookings(db)
    booking = db.query(Booking).options(joinedload(Booking.user), joinedload(Booking.approval)).filter(Booking.id == booking_id).first()
    if not booking:
        raise BookingNotFoundError()
    if current_user.role == RoleEnum.employee and booking.user_id != current_user.id:
        raise UnauthorizedAccessError()
        
    booking.user_name = booking.user.full_name if booking.user else f"User #{booking.user_id}"
    booking.resource_name = booking.resource.name if booking.resource else f"Resource #{booking.resource_id}"
    
    return booking


def get_booking_audit_trail(db: Session, booking_id: int):
    return (
        db.query(AuditLog)
        .options(joinedload(AuditLog.user))
        .filter(AuditLog.booking_id == booking_id)
        .order_by(AuditLog.timestamp.asc())
        .all()
    )


def mark_completed(db: Session) -> int:
    """Backward-compatible wrapper for callers expecting the old helper."""
    return refresh_completed_bookings(db)
