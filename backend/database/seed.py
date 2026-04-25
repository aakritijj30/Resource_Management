"""
Production-ready seed script for the Enterprise Booking System.
Ensures a clean slate, resets all sequences, and seeds core data.
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
    """Clears ALL data and RESTART sequences."""
    print("Part 1: The Clean Slate - Clearing ALL data and resetting IDs...")
    try:
        # PostgreSQL specific truncate with cascade and identity reset
        # This ensures that ID 1 is always the next ID used.
        db.execute(text("TRUNCATE TABLE audit_logs, notifications, approvals, maintenance_blocks, bookings, resource_policies, resources, users, departments RESTART IDENTITY CASCADE"))
        db.commit()
    except Exception as e:
        print(f"Warning during clear: {e}")
        db.rollback()

def seed_users(db: Session):
    """Seed core user accounts."""
    print("Part 2: Seeding User Accounts (Admin, Manager, Employee)...")
    users_data = [
        {"id": 1, "email": "admin@company.com", "full_name": "System Admin", "role": RoleEnum.admin, "password": "admin123"},
        {"id": 2, "email": "manager@company.com", "full_name": "Alice Manager", "role": RoleEnum.manager, "password": "manager123"},
        {"id": 3, "email": "emp1@company.com", "full_name": "Aakriti Employee", "role": RoleEnum.employee, "password": "employee123"},
    ]
    
    for u in users_data:
        db.execute(text(
            "INSERT INTO users (id, email, full_name, hashed_password, role, is_active, created_at) "
            "VALUES (:id, :email, :name, :pass, :role, True, :created)"
        ), {
            "id": u["id"], "email": u["email"], "name": u["full_name"], 
            "pass": hash_password(u["password"]), "role": u["role"].value, 
            "created": datetime.now()
        })
    db.commit()

def seed_departments(db: Session):
    """Seed department hierarchy."""
    print("Part 3: Seeding Departments...")
    depts_data = [
        {"id": 1, "name": "Data and AI", "manager_id": None},
        {"id": 2, "name": "Salesforce", "manager_id": None},
        {"id": 3, "name": "AI First Labs", "manager_id": None},
        {"id": 4, "name": "Planning", "manager_id": None},
        {"id": 5, "name": "Digital Transformation", "manager_id": 2}, # Alice is manager
    ]
    
    for d in depts_data:
        dept = Department(
            id=d["id"],
            name=d["name"],
            manager_id=d["manager_id"],
            created_at=datetime.now()
        )
        db.add(dept)
    db.flush()
    
    # Update seeded users to belong to 'Digital Transformation' (ID 5)
    db.execute(text("UPDATE users SET department_id = 5 WHERE id IN (2, 3)"))
    db.commit()

def seed_resources(db: Session):
    """Seed resources and policies."""
    print("Part 4: Seeding Managed Resources (Approval Required)...")
    managed_resources = [
        # (DeptID, Name, Type, Image)
        (2, "Vijayanagara", ResourceTypeEnum.conference_room, "/rooms/croom2.webp"),
        (2, "Wadeyars", ResourceTypeEnum.conference_room, "/rooms/room2"),
        (3, "AI First Lab 1", ResourceTypeEnum.lab, "/rooms/ai_lab.png"),
        (3, "Moksha Lab", ResourceTypeEnum.lab, "/rooms/moksha.jpg"),
        (4, "Maurya Room", ResourceTypeEnum.conference_room, "/rooms/maurya.webp"),
        (4, "Hoysala Room", ResourceTypeEnum.conference_room, "/rooms/croom1.webp"),
        (5, "Ashoka Boardroom", ResourceTypeEnum.conference_room, "/rooms/ashoka.webp"),
        (5, "Sahyadri Lounge", ResourceTypeEnum.conference_room, "/rooms/sahyadri.png"),
        (1, "Nalanda Hub", ResourceTypeEnum.lab, "/rooms/nalanda.webp"),
        (None, "Indus Common", ResourceTypeEnum.other, "/rooms/indus.webp"),
        (None, "Ganga Common", ResourceTypeEnum.other, "/rooms/ganga.webp"),
    ]

    for dept_id, name, res_type, img in managed_resources:
        res = Resource(
            name=name,
            type=res_type,
            capacity=12,
            approval_required=True,
            department_id=dept_id,
            image_url=img,
            created_at=datetime.now()
        )
        db.add(res)
        db.flush()
        db.add(ResourcePolicy(
            resource_id=res.id,
            max_duration_hours=12,
            office_hours_start=8,
            office_hours_end=20,
            max_attendees=12,
            allowed_days=31, # Mon-Fri
            allowed_department_ids=[dept_id] if dept_id else None
        ))

    print("Part 5: Seeding Auto-Approval Assets & PARKING...")
    auto_assets = [
        ("Bay Desk 1", ResourceTypeEnum.other, 1, "/rooms/bay.jpg"),
        ("Bay Desk 2", ResourceTypeEnum.other, 1, "/rooms/bay.jpg"),
        ("Bay Desk 3", ResourceTypeEnum.other, 1, "/rooms/bay.jpg"),
        ("Standard Cubicle A", ResourceTypeEnum.other, 1, "/rooms/cubicle1.jpg"),
        ("3D Printer Station", ResourceTypeEnum.equipment, 1, "/rooms/printer.png"),
        # Parking slots with requested capacities
        ("Parking Slot P1", ResourceTypeEnum.other, 10, "/rooms/parking.webp"),
        ("Parking Slot P2", ResourceTypeEnum.other, 15, "/rooms/parking.webp"),
        ("Parking Slot P3", ResourceTypeEnum.other, 20, "/rooms/parking.webp"),
    ]

    for name, res_type, cap, img in auto_assets:
        res = Resource(
            name=name,
            type=res_type,
            capacity=cap,
            approval_required=False,
            department_id=None,
            image_url=img,
            created_at=datetime.now()
        )
        db.add(res)
        db.flush()
        db.add(ResourcePolicy(
            resource_id=res.id,
            max_duration_hours=24,
            office_hours_start=0,
            office_hours_end=23,
            max_attendees=cap,
            allowed_days=127, # All days
            allowed_department_ids=None
        ))
    db.commit()

def sync_sequences(db: Session):
    """Syncs PostgreSQL sequences so that future inserts don't fail."""
    print("Part 6: Syncing Database Sequences...")
    seq_commands = [
        "SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))",
        "SELECT setval('departments_id_seq', (SELECT MAX(id) FROM departments))",
        "SELECT setval('resources_id_seq', (SELECT MAX(id) FROM resources))",
    ]
    for cmd in seq_commands:
        db.execute(text(cmd))
    db.commit()

def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        clear_db(db)
        seed_users(db)
        seed_departments(db)
        seed_resources(db)
        sync_sequences(db)
        print("\nSUCCESS: Database seeded successfully!")
        print("Accounts Created:")
        print(" - Admin:    admin@company.com / admin123")
        print(" - Manager:  manager@company.com / manager123")
        print(" - Employee: emp1@company.com / employee123")
    except Exception as e:
        print(f"\nFATAL ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
