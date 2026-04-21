"""
Tests for conflict detection: overlap, capacity, boundary edge cases.
"""
import pytest
from datetime import datetime, timedelta
from services.conflict_service import check_booking_conflict, check_capacity, check_maintenance_block
from utils.exceptions import BookingConflictError, CapacityExceededError, MaintenanceBlockError
from models.resource import Resource, ResourceTypeEnum
from models.booking import Booking, BookingStatusEnum
from models.maintenance_block import MaintenanceBlock
from models.user import User, RoleEnum


def _make_resource(db, capacity=1):
    r = Resource(name="Test Room", type=ResourceTypeEnum.conference_room, capacity=capacity, approval_required=False)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


def _make_user(db, email="conflict_user@test.com"):
    u = User(email=email, full_name="CUser", hashed_password="x", role=RoleEnum.employee)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def _make_booking(db, resource_id, user_id, start, end, status=BookingStatusEnum.approved):
    b = Booking(user_id=user_id, resource_id=resource_id, start_time=start, end_time=end,
                purpose="test", status=status)
    db.add(b)
    db.commit()
    db.refresh(b)
    return b


NOW = datetime(2025, 6, 15, 10, 0)


def test_no_conflict_different_times(db):
    r = _make_resource(db)
    u = _make_user(db, "nc1@test.com")
    _make_booking(db, r.id, u.id, NOW, NOW + timedelta(hours=2))
    # No exception — different time window
    check_booking_conflict(db, r.id, NOW + timedelta(hours=3), NOW + timedelta(hours=5))


def test_overlap_raises_conflict(db):
    r = _make_resource(db)
    u = _make_user(db, "ov1@test.com")
    _make_booking(db, r.id, u.id, NOW, NOW + timedelta(hours=2))
    with pytest.raises(BookingConflictError):
        check_booking_conflict(db, r.id, NOW + timedelta(hours=1), NOW + timedelta(hours=3))


def test_exact_boundary_no_conflict(db):
    """Booking ending exactly when another starts = no conflict."""
    r = _make_resource(db)
    u = _make_user(db, "bd1@test.com")
    _make_booking(db, r.id, u.id, NOW, NOW + timedelta(hours=2))
    # Starts exactly when existing ends — should NOT conflict
    check_booking_conflict(db, r.id, NOW + timedelta(hours=2), NOW + timedelta(hours=4))


def test_capacity_exceeded(db):
    r = _make_resource(db, capacity=1)
    u = _make_user(db, "cap1@test.com")
    _make_booking(db, r.id, u.id, NOW, NOW + timedelta(hours=2))
    with pytest.raises(CapacityExceededError):
        check_capacity(db, r.id, NOW, NOW + timedelta(hours=2), requested_attendees=1)


def test_capacity_within_limit(db):
    r = _make_resource(db, capacity=5)
    u = _make_user(db, "cap2@test.com")
    _make_booking(db, r.id, u.id, NOW, NOW + timedelta(hours=2))
    # Should not raise — 1 existing + 3 requested < 5
    check_capacity(db, r.id, NOW, NOW + timedelta(hours=2), requested_attendees=3)


def test_maintenance_block_raises(db):
    r = _make_resource(db)
    u = _make_user(db, "maint1@test.com")
    block = MaintenanceBlock(resource_id=r.id, start_time=NOW, end_time=NOW + timedelta(hours=4),
                              reason="Cleaning", created_by=u.id)
    db.add(block)
    db.commit()
    with pytest.raises(MaintenanceBlockError):
        check_maintenance_block(db, r.id, NOW + timedelta(hours=1), NOW + timedelta(hours=3))
