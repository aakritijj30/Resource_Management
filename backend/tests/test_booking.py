"""
Tests for booking state transitions and cancellation logic.
"""
import pytest
from datetime import datetime, timedelta, timezone
from uuid import uuid4
from models.audit_log import AuditActionEnum, AuditLog
from models.booking import Booking, BookingStatusEnum
from models.resource import Resource, ResourceTypeEnum
from models.user import User, RoleEnum
from services.booking_service import cancel_booking, refresh_completed_bookings
from utils.exceptions import InvalidStateTransitionError, UnauthorizedAccessError


NOW_FUTURE = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(days=5)


def _setup(db):
    suffix = uuid4().hex[:8]
    r = Resource(name="BK Room", type=ResourceTypeEnum.conference_room, capacity=5, approval_required=False)
    db.add(r)
    u = User(email=f"bk_user_{suffix}@test.com", full_name="BK User", hashed_password="x", role=RoleEnum.employee)
    db.add(u)
    db.commit()
    db.refresh(r); db.refresh(u)
    return r, u


def test_cancel_approved_booking(db):
    r, u = _setup(db)
    b = Booking(user_id=u.id, resource_id=r.id,
                start_time=NOW_FUTURE, end_time=NOW_FUTURE + timedelta(hours=2),
                purpose="Test", status=BookingStatusEnum.approved)
    db.add(b); db.commit(); db.refresh(b)
    updated = cancel_booking(db, b.id, u)
    assert updated.status == BookingStatusEnum.cancelled


def test_cancel_already_cancelled_raises(db):
    r, u = _setup(db)
    b = Booking(user_id=u.id, resource_id=r.id,
                start_time=NOW_FUTURE, end_time=NOW_FUTURE + timedelta(hours=2),
                purpose="Test", status=BookingStatusEnum.cancelled)
    db.add(b); db.commit(); db.refresh(b)
    with pytest.raises(InvalidStateTransitionError):
        cancel_booking(db, b.id, u)


def test_cancel_rejected_booking_raises(db):
    r, u = _setup(db)
    b = Booking(user_id=u.id, resource_id=r.id,
                start_time=NOW_FUTURE, end_time=NOW_FUTURE + timedelta(hours=2),
                purpose="Test", status=BookingStatusEnum.rejected)
    db.add(b); db.commit(); db.refresh(b)
    with pytest.raises(InvalidStateTransitionError):
        cancel_booking(db, b.id, u)


def test_cancel_other_users_booking_raises(db):
    r, u = _setup(db)
    other = User(email=f"other_bk_{uuid4().hex[:8]}@test.com", full_name="Other", hashed_password="x", role=RoleEnum.employee)
    db.add(other); db.commit(); db.refresh(other)
    b = Booking(user_id=other.id, resource_id=r.id,
                start_time=NOW_FUTURE, end_time=NOW_FUTURE + timedelta(hours=2),
                purpose="Test", status=BookingStatusEnum.approved)
    db.add(b); db.commit(); db.refresh(b)
    with pytest.raises(UnauthorizedAccessError):
        cancel_booking(db, b.id, u)


def test_refresh_marks_expired_approved_bookings_completed_and_logs(db):
    r, u = _setup(db)
    past_end = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(hours=1)
    b = Booking(
        user_id=u.id,
        resource_id=r.id,
        start_time=past_end - timedelta(hours=2),
        end_time=past_end,
        purpose="Expired",
        status=BookingStatusEnum.approved
    )
    db.add(b); db.commit(); db.refresh(b)

    updated = refresh_completed_bookings(db)
    db.refresh(b)

    log = db.query(AuditLog).filter(
        AuditLog.booking_id == b.id,
        AuditLog.action == AuditActionEnum.booking_completed
    ).first()
    assert updated == 1
    assert b.status == BookingStatusEnum.completed
    assert log is not None
