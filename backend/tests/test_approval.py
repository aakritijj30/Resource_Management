"""
Tests for approval guard checks and invalid state transitions.
"""
import pytest
from datetime import timedelta
from utils.timezone import now_local_naive
from uuid import uuid4
from models.booking import Booking, BookingStatusEnum
from models.approval import Approval, ApprovalDecisionEnum
from models.resource import Resource, ResourceTypeEnum
from models.user import User, RoleEnum
from services.approval_service import decide_approval, get_pending_approvals
from utils.exceptions import InvalidStateTransitionError, UnauthorizedAccessError


NOW_FUTURE = now_local_naive() + timedelta(days=3)


def _setup(db):
    suffix = uuid4().hex[:8]
    r = Resource(name="AP Room", type=ResourceTypeEnum.conference_room, capacity=5, approval_required=True)
    db.add(r)
    emp = User(email=f"ap_emp_{suffix}@test.com",  full_name="Emp", hashed_password="x", role=RoleEnum.employee)
    mgr = User(email=f"ap_mgr_{suffix}@test.com",  full_name="Mgr", hashed_password="x", role=RoleEnum.manager)
    db.add_all([emp, mgr]); db.commit()
    db.refresh(r); db.refresh(emp); db.refresh(mgr)
    b = Booking(user_id=emp.id, resource_id=r.id,
                start_time=NOW_FUTURE, end_time=NOW_FUTURE + timedelta(hours=2),
                purpose="Meeting", status=BookingStatusEnum.pending)
    db.add(b); db.flush()
    ap = Approval(booking_id=b.id, manager_id=mgr.id, decision=ApprovalDecisionEnum.pending)
    db.add(ap); db.commit()
    db.refresh(b); db.refresh(ap)
    return r, emp, mgr, b, ap


def test_approve_booking(db):
    r, emp, mgr, b, ap = _setup(db)
    result = decide_approval(db, ap.id, ApprovalDecisionEnum.approved, "Looks good", mgr)
    assert result.decision == ApprovalDecisionEnum.approved
    assert b.status == BookingStatusEnum.approved


def test_reject_booking(db):
    r, emp, mgr, b, ap = _setup(db)
    result = decide_approval(db, ap.id, ApprovalDecisionEnum.rejected, "Unavailable", mgr)
    assert result.decision == ApprovalDecisionEnum.rejected
    assert b.status == BookingStatusEnum.rejected


def test_double_approval_raises(db):
    """Cannot approve an already-decided approval."""
    r, emp, mgr, b, ap = _setup(db)
    decide_approval(db, ap.id, ApprovalDecisionEnum.approved, "First", mgr)
    with pytest.raises(InvalidStateTransitionError):
        decide_approval(db, ap.id, ApprovalDecisionEnum.rejected, "Second", mgr)


def test_wrong_manager_raises(db):
    r, emp, mgr, b, ap = _setup(db)
    other_mgr = User(email=f"other_mgr_{uuid4().hex[:8]}@test.com", full_name="Other Mgr", hashed_password="x", role=RoleEnum.manager)
    db.add(other_mgr); db.commit(); db.refresh(other_mgr)
    with pytest.raises(UnauthorizedAccessError):
        decide_approval(db, ap.id, ApprovalDecisionEnum.approved, "Sneak", other_mgr)


def test_reject_requires_comment(db):
    r, emp, mgr, b, ap = _setup(db)
    with pytest.raises(InvalidStateTransitionError):
        decide_approval(db, ap.id, ApprovalDecisionEnum.rejected, "", mgr)


def test_cancelled_booking_is_not_returned_in_pending_queue(db):
    r, emp, mgr, b, ap = _setup(db)
    b.status = BookingStatusEnum.cancelled
    db.commit()
    db.refresh(b)

    approvals = get_pending_approvals(db, mgr)
    assert approvals == []
