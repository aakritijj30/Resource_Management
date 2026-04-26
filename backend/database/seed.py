"""
Safe seed script that restores the user's specific data and ensures schema compliance.
Does NOT clear the database. Use 'upsert' logic to prevent duplicates.
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

def seed_data():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Part 1: Departments (no managers yet)
        print("Syncing Departments...")
        depts_data = [
            {"id": 1, "name": "Data and AI"},
            {"id": 2, "name": "Salesforce"},
            {"id": 3, "name": "AI First Labs"},
            {"id": 4, "name": "Planning"},
            {"id": 5, "name": "Digital Transformation"},
        ]
        
        for d in depts_data:
            existing = db.query(Department).filter(Department.id == d["id"]).first()
            if not existing:
                dept = Department(id=d["id"], name=d["name"])
                db.add(dept)
            else:
                existing.name = d["name"]
        db.commit()

        # Part 2: Users
        print("Syncing Users...")
        users_data = [
            {"email": "admin@company.com", "name": "System Admin", "role": RoleEnum.admin, "pass": "admin123", "dept": None},
            {"email": "emp3@company.com", "name": "Lino Jose", "role": RoleEnum.employee, "pass": "employee123", "dept": 4},
            {"email": "emp2@company.com", "name": "Shivani", "role": RoleEnum.employee, "pass": "employee123", "dept": 3},
            {"email": "manager_dt@company.com", "name": "Alice", "role": RoleEnum.manager, "pass": "manager123", "dept": 5},
            {"email": "emp1@company.com", "name": "Aakriti", "role": RoleEnum.employee, "pass": "employee123", "dept": 5},
            {"email": "manager_data@company.com", "name": "Bob", "role": RoleEnum.manager, "pass": "manager123", "dept": 1},
            {"email": "emp4@company.com", "name": "Prasanna", "role": RoleEnum.employee, "pass": "employee123", "dept": 1},
        ]
        
        for u in users_data:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_user = User(
                    email=u["email"],
                    full_name=u["name"],
                    hashed_password=hash_password(u["pass"]),
                    role=u["role"],
                    department_id=u["dept"]
                )
                db.add(new_user)
        db.commit()

        # Part 3: Link Managers
        print("Linking Managers...")
        # Alice (manager_dt) manages DT (5)
        # Bob (manager_data) manages Data (1)
        alice = db.query(User).filter(User.email == "manager_dt@company.com").first()
        bob = db.query(User).filter(User.email == "manager_data@company.com").first()
        
        if alice:
            db.query(Department).filter(Department.id == 5).update({"manager_id": alice.id})
        if bob:
            db.query(Department).filter(Department.id == 1).update({"manager_id": bob.id})
        db.commit()

        # Part 3: Restore Resources
        print("Syncing 32 Resources...")
        resources_list = [
            {'name': '3D Printer Station', 'type': ResourceTypeEnum.equipment, 'dept_id': None, 'img': '/rooms/printer.png'},
            {'name': 'Parking Slot P1', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/parking.webp'},
            {'name': 'Parking Slot P2', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/parking.webp'},
            {'name': 'Standard Cubicle A', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/cubicle1.jpg'},
            {'name': 'Standard Cubicle B', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/cubicle2.jpg'},
            {'name': 'Bay Desk 1', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 2', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 3', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 4', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 5', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 6', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 7', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 8', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 9', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Bay Desk 10', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg'},
            {'name': 'Main Conference Room ', 'type': ResourceTypeEnum.conference_room, 'dept_id': None, 'img': '/rooms/room8.webp'},
            {'name': 'Hoysala', 'type': ResourceTypeEnum.conference_room, 'dept_id': 4, 'img': '/rooms/croom1.webp'},
            {'name': 'Vijayanagara', 'type': ResourceTypeEnum.conference_room, 'dept_id': 2, 'img': '/rooms/croom2.webp'},
            {'name': 'Wadeyars', 'type': ResourceTypeEnum.conference_room, 'dept_id': 2, 'img': '/rooms/room2'},
            {'name': 'Kadamba', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/room6.webp'},
            {'name': 'Ashoka', 'type': ResourceTypeEnum.conference_room, 'dept_id': 5, 'img': '/rooms/ashoka.webp'},
            {'name': 'Sahyadri', 'type': ResourceTypeEnum.conference_room, 'dept_id': 5, 'img': '/rooms/sahyadri.png'},
            {'name': 'Maurya', 'type': ResourceTypeEnum.conference_room, 'dept_id': 4, 'img': '/rooms/maurya.webp'},
            {'name': 'Indus', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/indus.webp'},
            {'name': 'Ganga', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/ganga.webp'},
            {'name': 'Kaveri', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/kaveri.png'},
            {'name': 'Ai first lab', 'type': ResourceTypeEnum.lab, 'dept_id': 3, 'img': '/rooms/ai_lab.png'},
            {'name': 'Moksha', 'type': ResourceTypeEnum.lab, 'dept_id': 3, 'img': '/rooms/moksha.jpg'},
            {'name': 'Nalanda', 'type': ResourceTypeEnum.lab, 'dept_id': 1, 'img': '/rooms/nalanda.webp'},
            {'name': 'Mantra', 'type': ResourceTypeEnum.lab, 'dept_id': 1, 'img': '/rooms/mantra.webp'},
            {'name': 'IT storage 1', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/it_storage.png'},
            {'name': 'Server room 2', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/server.png'}
        ]

        for r_data in resources_list:
            existing = db.query(Resource).filter(Resource.name == r_data["name"]).first()
            if not existing:
                res = Resource(
                    name=r_data["name"],
                    type=r_data["type"],
                    department_id=r_data["dept_id"],
                    image_url=r_data["img"],
                    capacity=10 if r_data["type"] != ResourceTypeEnum.other else 1,
                    approval_required=True if r_data["dept_id"] else False
                )
                db.add(res)
                db.flush()
                # Add a default policy
                db.add(ResourcePolicy(
                    resource_id=res.id,
                    max_duration_hours=8,
                    office_hours_start=9,
                    office_hours_end=18,
                    allowed_days=31
                ))
        
        db.commit()
        print("Data restoration complete! No data was erased.")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
