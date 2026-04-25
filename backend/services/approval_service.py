from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from models.approval import Approval, ApprovalDecisionEnum
from models.booking import Booking, BookingStatusEnum
from models.user import User, RoleEnum
from services.audit_service import log_action
from models.audit_log import AuditActionEnum
from services.conflict_service import check_booking_conflict, check_capacity
from utils.exceptions import UnauthorizedAccessError, InvalidStateTransitionError, BookingNotFoundError
from utils.timezone import now_local_naive


def get_pending_approvals(db: Session, manager: User):
    """Returns pending approvals. Admins see all; managers see only their department's."""
    query = (
        db.query(Approval)
        .options(joinedload(Approval.booking).joinedload(Booking.user), joinedload(Approval.booking).joinedload(Booking.resource))
        .join(Booking, Approval.booking_id == Booking.id)
        .filter(
            Approval.decision == ApprovalDecisionEnum.pending,
            Booking.status == BookingStatusEnum.pending,
        )
    )
    if manager.role != RoleEnum.admin:
        query = query.filter(Approval.manager_id == manager.id)
    else:
        # Admins should only see requests for employees without an assigned manager
        query = query.filter(Approval.manager_id == None)
    
    approvals = query.all()
    filtered_approvals = []
    for a in approvals:
        # Sync check: If booking was cancelled (preempted), fix the approval and don't show in pending queue
        if a.booking.status == BookingStatusEnum.cancelled:
            a.decision = ApprovalDecisionEnum.rejected
            a.comment = a.comment or "System: Auto-rejected due to booking cancellation."
            a.decided_at = a.decided_at or now_local_naive()
            db.add(a)
            db.commit()
            continue
            
        a.user_name = a.booking.user.full_name if a.booking.user else f"User #{a.booking.user_id}"
        a.resource_id = a.booking.resource_id
        a.resource_name = a.booking.resource.name if a.booking.resource else f"Resource #{a.booking.resource_id}"
        filtered_approvals.append(a)
    return filtered_approvals


def get_approval_history(db: Session, manager: User):
    """Returns past approval decisions. Admins see all; managers see their own."""
    query = (
        db.query(Approval)
        .options(joinedload(Approval.booking).joinedload(Booking.user), joinedload(Approval.booking).joinedload(Booking.resource))
    )
    if manager.role != RoleEnum.admin:
        query = query.filter(Approval.manager_id == manager.id)
    else:
        # Admins should only see requests for employees without an assigned manager
        query = query.filter(Approval.manager_id == None)
    
    approvals = query.order_by(Approval.created_at.desc()).all()
    for a in approvals:
        # Sync logic: If the booking was cancelled (e.g. by preemption), the approval must not stay 'pending'
        if a.booking.status == BookingStatusEnum.cancelled and a.decision == ApprovalDecisionEnum.pending:
            a.decision = ApprovalDecisionEnum.rejected
            a.comment = a.comment or "System: Booking was cancelled by a priority request or user."
            a.decided_at = a.decided_at or now_local_naive()
            db.add(a)
            db.commit() # Commit each fix to ensure consistency
            db.refresh(a)

        a.user_name = a.booking.user.full_name if a.booking.user else f"User #{a.booking.user_id}"
        a.resource_id = a.booking.resource_id
        a.resource_name = a.booking.resource.name if a.booking.resource else f"Resource #{a.booking.resource_id}"
    return approvals


def get_approval_by_id(db: Session, approval_id: int, manager: User) -> Approval:
    approval = db.query(Approval).options(
        joinedload(Approval.booking).joinedload(Booking.user),
        joinedload(Approval.booking).joinedload(Booking.resource)
    ).filter(Approval.id == approval_id).first()
    if not approval:
        raise BookingNotFoundError()
    if approval.manager_id != manager.id and manager.role != RoleEnum.admin:
        raise UnauthorizedAccessError()
    
    approval.user_name = approval.booking.user.full_name if approval.booking.user else f"User #{approval.booking.user_id}"
    approval.resource_id = approval.booking.resource_id
    approval.resource_name = approval.booking.resource.name if approval.booking.resource else f"Resource #{approval.booking.resource_id}"
    
    return approval


def decide_approval(db: Session, approval_id: int, decision: ApprovalDecisionEnum, comment: str, manager: User) -> Approval:
    approval = get_approval_by_id(db, approval_id, manager)

    # Guard: only the assigned manager (or admin) can decide
    if approval.manager_id != manager.id and manager.role != RoleEnum.admin:
        raise UnauthorizedAccessError()

    # Guard: prevent double-action — must still be pending
    if approval.decision != ApprovalDecisionEnum.pending:
        raise InvalidStateTransitionError(approval.decision.value, decision.value)

    booking = approval.booking
    if booking.status != BookingStatusEnum.pending:
        raise InvalidStateTransitionError(booking.status.value, decision.value)

    if decision == ApprovalDecisionEnum.rejected and not (comment or "").strip():
        raise InvalidStateTransitionError(booking.status.value, "rejected_without_comment")

    if decision == ApprovalDecisionEnum.approved:
        # Re-check slot availability (another booking may have taken it while pending)
        check_booking_conflict(db, booking.resource_id, booking.start_time, booking.end_time, exclude_booking_id=booking.id)
        check_capacity(db, booking.resource_id, booking.start_time, booking.end_time, booking.attendees, exclude_booking_id=booking.id)
        booking.status = BookingStatusEnum.approved
        log_action(db, manager.id, AuditActionEnum.booking_approved, "booking", booking.id, {"comment": comment})
    else:
        booking.status = BookingStatusEnum.rejected
        log_action(db, manager.id, AuditActionEnum.booking_rejected, "booking", booking.id, {"comment": comment})

    approval.decision = decision
    approval.comment = comment
    approval.decided_at = now_local_naive()
    db.commit()
    db.refresh(approval)
    return approval
