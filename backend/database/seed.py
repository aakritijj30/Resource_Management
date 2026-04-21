"""
Seed script — run once to populate demo data.
Usage:  python database/seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal, engine, Base
import models  # noqa — ensure all tables are registered

from models.department import Department
from models.user import User, RoleEnum
from models.resource import Resource, ResourceTypeEnum
from models.resource_policy import ResourcePolicy
from models.booking import Booking, BookingStatusEnum
from models.approval import Approval, ApprovalDecisionEnum
from services.auth_service import hash_password
from datetime import datetime, timedelta, timezone

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ─── Departments ────────────────────────────────────────────────────────────
depts = [
    Department(name="Engineering"),
    Department(name="Marketing"),
    Department(name="Operations"),
]
db.add_all(depts)
db.flush()

# ─── Users ──────────────────────────────────────────────────────────────────
admin = User(email="admin@company.com", full_name="Alice Admin", hashed_password=hash_password("admin123"), role=RoleEnum.admin)
mgr1  = User(email="mgr.eng@company.com",  full_name="Bob Manager",    hashed_password=hash_password("manager123"), role=RoleEnum.manager, department_id=depts[0].id)
mgr2  = User(email="mgr.mkt@company.com",  full_name="Carol Manager",  hashed_password=hash_password("manager123"), role=RoleEnum.manager, department_id=depts[1].id)
emp1  = User(email="emp1@company.com", full_name="Dave Employee",  hashed_password=hash_password("emp123"), role=RoleEnum.employee, department_id=depts[0].id)
emp2  = User(email="emp2@company.com", full_name="Eve Employee",   hashed_password=hash_password("emp123"), role=RoleEnum.employee, department_id=depts[0].id)
emp3  = User(email="emp3@company.com", full_name="Frank Employee", hashed_password=hash_password("emp123"), role=RoleEnum.employee, department_id=depts[1].id)

db.add_all([admin, mgr1, mgr2, emp1, emp2, emp3])
db.flush()

# Assign managers to departments
depts[0].manager_id = mgr1.id
depts[1].manager_id = mgr2.id

# ─── Resources ──────────────────────────────────────────────────────────────
r1 = Resource(name="Conference Room A", type=ResourceTypeEnum.conference_room, capacity=10, location="Floor 2", approval_required=True)
r2 = Resource(name="Conference Room B", type=ResourceTypeEnum.conference_room, capacity=6,  location="Floor 3", approval_required=False)
r3 = Resource(name="3D Printer",        type=ResourceTypeEnum.equipment,       capacity=1,  location="Lab 1",   approval_required=True)
r4 = Resource(name="Company Van",       type=ResourceTypeEnum.vehicle,         capacity=8,  location="Parking", approval_required=True)
r5 = Resource(name="Training Lab",      type=ResourceTypeEnum.lab,             capacity=20, location="Floor 1", approval_required=False)

db.add_all([r1, r2, r3, r4, r5])
db.flush()

# ─── Policies ────────────────────────────────────────────────────────────────
policies = [
    ResourcePolicy(resource_id=r1.id, max_duration_hours=8,  office_hours_start=8, office_hours_end=18),
    ResourcePolicy(resource_id=r2.id, max_duration_hours=4,  office_hours_start=8, office_hours_end=20),
    ResourcePolicy(resource_id=r3.id, max_duration_hours=2,  office_hours_start=9, office_hours_end=17),
    ResourcePolicy(resource_id=r4.id, max_duration_hours=10, office_hours_start=7, office_hours_end=19),
    ResourcePolicy(resource_id=r5.id, max_duration_hours=6,  office_hours_start=8, office_hours_end=18),
]
db.add_all(policies)

# ─── Sample Bookings ─────────────────────────────────────────────────────────
now = datetime.now(timezone.utc).replace(tzinfo=None)
b1 = Booking(user_id=emp1.id, resource_id=r2.id,
             start_time=now + timedelta(days=1, hours=2),
             end_time=now + timedelta(days=1, hours=4),
             purpose="Sprint Planning", status=BookingStatusEnum.approved)
b2 = Booking(user_id=emp2.id, resource_id=r1.id,
             start_time=now + timedelta(days=2, hours=3),
             end_time=now + timedelta(days=2, hours=5),
             purpose="Design Review", status=BookingStatusEnum.pending)
b3 = Booking(user_id=emp3.id, resource_id=r5.id,
             start_time=now + timedelta(days=1, hours=1),
             end_time=now + timedelta(days=1, hours=3),
             purpose="Team Training", status=BookingStatusEnum.approved)

db.add_all([b1, b2, b3])
db.flush()

# Approval for b2
db.add(Approval(booking_id=b2.id, manager_id=mgr1.id, decision=ApprovalDecisionEnum.pending))

db.commit()
db.close()
print("✅ Seed complete — demo data loaded.")
print("\nDemo credentials:")
print("  admin@company.com        / admin123")
print("  mgr.eng@company.com      / manager123")
print("  mgr.mkt@company.com      / manager123")
print("  emp1@company.com         / emp123")
