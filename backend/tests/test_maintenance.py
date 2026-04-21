"""
Tests for maintenance block date/time validation.
"""
import pytest
from datetime import timedelta
from fastapi import HTTPException
from utils.timezone import now_local_naive
from uuid import uuid4
from models.resource import Resource, ResourceTypeEnum
from models.user import User, RoleEnum
from schemas.maintenance import MaintenanceCreate
from services.maintenance_service import create_maintenance_block


def _setup(db):
    suffix = uuid4().hex[:8]
    r = Resource(name=f"MT Room {suffix}", type=ResourceTypeEnum.conference_room, capacity=5, approval_required=False)
    u = User(email=f"mt_user_{suffix}@test.com", full_name="MT User", hashed_password="x", role=RoleEnum.admin)
    db.add_all([r, u])
    db.commit()
    db.refresh(r)
    db.refresh(u)
    return r, u


def test_create_maintenance_block_rejects_past_start(db):
    r, admin = _setup(db)
    past_start = now_local_naive() - timedelta(hours=2)
    data = MaintenanceCreate(
        resource_id=r.id,
        start_time=past_start,
        end_time=past_start + timedelta(hours=1),
        reason="Past block",
    )

    with pytest.raises(HTTPException) as exc:
        create_maintenance_block(db, data, admin.id)

    assert exc.value.status_code == 422


def test_create_maintenance_block_rejects_end_before_start(db):
    r, admin = _setup(db)
    start = now_local_naive() + timedelta(days=1)
    data = MaintenanceCreate(
        resource_id=r.id,
        start_time=start,
        end_time=start - timedelta(hours=1),
        reason="Invalid range",
    )

    with pytest.raises(HTTPException) as exc:
        create_maintenance_block(db, data, admin.id)

    assert exc.value.status_code == 422
