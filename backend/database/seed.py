"""
Mandatory seed script that ensures admin, departments, and resources exist.
Usage: python backend/database/seed.py
"""
import os
import sys
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.orm import Session

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import Base, SessionLocal, engine
import models  # noqa
from models.department import Department
from models.resource import Resource, ResourceTypeEnum
from models.resource_policy import ResourcePolicy
from models.user import RoleEnum, User
from services.auth_service import hash_password

def clear_db(db: Session):
    """
    Part 1: The Clean Slate
    Clears users, resources, and departments to ensure a fresh start.
    """
    print("Part 1: The Clean Slate - Clearing ALL data (Users, Resources, Departments)...")
    try:
        # PostgreSQL specific truncate with cascade and identity reset
        db.execute(text("TRUNCATE TABLE audit_logs, notifications, approvals, maintenance_blocks, bookings, resource_policies, resources, users, departments RESTART IDENTITY CASCADE"))
        db.commit()
    except Exception as e:
        print(f"Warning during clear: {e}")
        db.rollback()

def seed_users(db: Session):
    """
    Seed exactly three users as requested.
    """
    print("Seeding specific user accounts...")
    users_data = [
        {"id": 1, "email": "admin@company.com", "name": "System Admin", "role": RoleEnum.admin, "pass": "admin123"},
        {"id": 2, "email": "manager_dt@company.com", "name": "DT Manager", "role": RoleEnum.manager, "pass": "manager123"},
        {"id": 3, "email": "emp1@company.com", "name": "DT Employee", "role": RoleEnum.employee, "pass": "employee123"},
    ]
    
    for u in users_data:
        db.execute(text(
            "INSERT INTO users (id, email, full_name, hashed_password, role, is_active, created_at) "
            "VALUES (:id, :email, :name, :pass, :role, True, :created)"
        ), {
            "id": u["id"], "email": u["email"], "name": u["name"], 
            "pass": hash_password(u["pass"]), "role": u["role"], 
            "created": datetime.utcnow()
        })
    db.commit()

def seed_mandatory():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Part 1: Clear EVERYTHING
        clear_db(db)
        
        # Part 2: Seed exact users
        seed_users(db)

        # Part 3: Department Hierarchy
        print("Part 3: Seeding Departments...")
        depts_data = [
            {"id": 2, "name": "Salesforce", "manager_id": None},
            {"id": 3, "name": "AI First Labs", "manager_id": None},
            {"id": 4, "name": "Planning", "manager_id": None},
            {"id": 5, "name": "Digital Transformation", "manager_id": 2}, # Linked to manager_dt
            {"id": 1, "name": "Data and AI", "manager_id": None},
        ]
        
        for d in depts_data:
            dept = Department(
                id=d["id"],
                name=d["name"],
                manager_id=d["manager_id"],
                created_at=datetime.utcnow()
            )
            db.add(dept)
        db.flush()

        # Update Users to link to Digital Transformation (ID 5)
        db.execute(text("UPDATE users SET department_id = 5 WHERE id IN (2, 3)"))

        # Part 4: Resource Seeding (Approval Required)
        print("Part 4: Seeding Resources (Approval Required)...")
        managed_resources = [
            (2, ["Vijayanagara", "Wadeyars"], ResourceTypeEnum.conference_room),
            (3, ["Ai first lab", "Moksha"], ResourceTypeEnum.lab),
            (4, ["Maurya", "Hoysala"], ResourceTypeEnum.conference_room),
            (5, ["Ashoka", "Sahyadri"], ResourceTypeEnum.conference_room),
            (1, ["Nalanda", "Mantra"], ResourceTypeEnum.lab),
            (None, ["Indus", "Ganga", "Kaveri", "Kadamba", "IT storage 1", "Server room 2"], ResourceTypeEnum.other)
        ]

        for dept_id, names, res_type in managed_resources:
            for name in names:
                res = Resource(
                    name=name,
                    type=res_type,
                    capacity=10 if res_type != ResourceTypeEnum.other else 1,
                    approval_required=True,
                    department_id=dept_id,
                    created_at=datetime.utcnow()
                )
                db.add(res)
                db.flush()
                db.add(ResourcePolicy(resource_id=res.id, max_duration_hours=8, office_hours_start=9, office_hours_end=18))

        # Part 5: Auto-Approval Assets
        print("Part 5: Seeding Auto-Approval Assets...")
        auto_assets = [
            ([f"Bay Desk {i}" for i in range(1, 11)], ResourceTypeEnum.other),
            (["Standard Cubicle A", "Standard Cubicle B"], ResourceTypeEnum.other),
            (["3D Printer Station"], ResourceTypeEnum.equipment),
            (["Parking Slot P1", "Parking Slot P2"], ResourceTypeEnum.other)
        ]

        for names, res_type in auto_assets:
            for name in names:
                res = Resource(
                    name=name,
                    type=res_type,
                    capacity=1,
                    approval_required=False,
                    department_id=None,
                    created_at=datetime.utcnow()
                )
                db.add(res)
                db.flush()
                db.add(ResourcePolicy(resource_id=res.id, max_duration_hours=24, office_hours_start=0, office_hours_end=23))

        db.commit()
        print("Database refresh completed! Only the three requested users exist.")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_mandatory()
