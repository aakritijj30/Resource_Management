"""
Safe seed script that restores the user's specific data and ensures schema compliance.
Does NOT clear the database. Use 'upsert' logic to prevent duplicates.
"""
import os
import sys
from sqlalchemy import text, func

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
        dept_id_map = {}
        depts_data = [
            {"id": 1, "name": "Data and AI"},
            {"id": 2, "name": "Salesforce"},
            {"id": 3, "name": "AI First Labs"},
            {"id": 4, "name": "Planning"},
            {"id": 5, "name": "Digital Transformation"},
        ]
        
        for d in depts_data:
            existing_by_name = db.query(Department).filter(Department.name == d["name"]).first()
            existing_by_id = db.query(Department).filter(Department.id == d["id"]).first()

            if existing_by_name:
                existing_by_name.name = d["name"]
                dept_id_map[d["id"]] = existing_by_name.id
                continue

            if existing_by_id:
                existing_by_id.name = d["name"]
                dept_id_map[d["id"]] = existing_by_id.id
                continue

            if not existing_by_name and not existing_by_id:
                dept = Department(id=d["id"], name=d["name"])
                db.add(dept)
                db.flush()
                dept_id_map[d["id"]] = dept.id
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
                    department_id=dept_id_map.get(u["dept"])
                )
                db.add(new_user)
            else:
                existing.full_name = u["name"]
                existing.role = u["role"]
                existing.department_id = dept_id_map.get(u["dept"])
        db.commit()

        # Part 3: Link Managers
        print("Linking Managers...")
        # Alice (manager_dt) manages DT (5)
        # Bob (manager_data) manages Data (1)
        alice = db.query(User).filter(User.email == "manager_dt@company.com").first()
        bob = db.query(User).filter(User.email == "manager_data@company.com").first()
        
        if alice:
            db.query(Department).filter(Department.name == "Digital Transformation").update({"manager_id": alice.id})
        if bob:
            db.query(Department).filter(Department.name == "Data and AI").update({"manager_id": bob.id})
        db.commit()

        # Part 3: Restore Resources
        print("Syncing 32 Resources...")
        resources_list = [
            {'name': '3D Printer Station', 'type': ResourceTypeEnum.equipment, 'dept_id': None, 'img': '/rooms/printer.png', 'loc': 'Ground Floor'},
            {'name': 'Parking Slot P1', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/parking.webp', 'loc': 'Ground Floor'},
            {'name': 'Parking Slot P2', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/parking.webp', 'loc': 'Ground Floor'},
            {'name': 'Standard Cubicle A', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/cubicle1.jpg', 'loc': 'Ground Floor'},
            {'name': 'Standard Cubicle B', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/cubicle2.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 1', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 2', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 3', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 4', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 5', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 6', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 7', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 8', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 9', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Bay Desk 10', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/bay.jpg', 'loc': 'Ground Floor'},
            {'name': 'Main Conference Room ', 'type': ResourceTypeEnum.conference_room, 'dept_id': None, 'img': '/rooms/room8.webp', 'loc': 'Ground Floor'},
            {'name': 'Hoysala', 'type': ResourceTypeEnum.conference_room, 'dept_id': 4, 'img': '/rooms/croom1.webp', 'loc': '4th Floor'},
            {'name': 'Vijayanagara', 'type': ResourceTypeEnum.conference_room, 'dept_id': 2, 'img': '/rooms/croom2.webp', 'loc': '2nd Floor'},
            {'name': 'Wadeyars', 'type': ResourceTypeEnum.conference_room, 'dept_id': 2, 'img': '/rooms/room2.webp', 'loc': '2nd Floor'},
            {'name': 'Kadamba', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/room6.webp', 'loc': 'Ground Floor'},
            {'name': 'Ashoka', 'type': ResourceTypeEnum.conference_room, 'dept_id': 5, 'img': '/rooms/ashoka.webp', 'loc': '5th Floor'},
            {'name': 'Sahyadri', 'type': ResourceTypeEnum.conference_room, 'dept_id': 5, 'img': '/rooms/sahyadri.png', 'loc': '5th Floor'},
            {'name': 'Maurya', 'type': ResourceTypeEnum.conference_room, 'dept_id': 4, 'img': '/rooms/maurya.webp', 'loc': '4th Floor'},
            {'name': 'Indus', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/indus.webp', 'loc': 'Ground Floor'},
            {'name': 'Ganga', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/ganga.webp', 'loc': 'Ground Floor'},
            {'name': 'Kaveri', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/kaveri.png', 'loc': 'Ground Floor'},
            {'name': 'Ai first lab', 'type': ResourceTypeEnum.lab, 'dept_id': 3, 'img': '/rooms/ai_lab.png', 'loc': '3rd Floor'},
            {'name': 'Moksha', 'type': ResourceTypeEnum.lab, 'dept_id': 3, 'img': '/rooms/moksha.jpg', 'loc': '3rd Floor'},
            {'name': 'Nalanda', 'type': ResourceTypeEnum.lab, 'dept_id': 1, 'img': '/rooms/nalanda.webp', 'loc': '1st Floor'},
            {'name': 'Mantra', 'type': ResourceTypeEnum.lab, 'dept_id': 1, 'img': '/rooms/mantra.webp', 'loc': '1st Floor'},
            {'name': 'IT storage 1', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/it_storage.png', 'loc': 'Ground Floor'},
            {'name': 'Server room 2', 'type': ResourceTypeEnum.other, 'dept_id': None, 'img': '/rooms/server.png', 'loc': 'Ground Floor'}
        ]

        for r_data in resources_list:
            res_name = r_data["name"].strip()
            # Use func.trim to catch resources that have accidental trailing spaces in the DB
            existing = db.query(Resource).filter(func.trim(Resource.name).ilike(res_name)).first()
            
            if existing:
                # Update location and other fields
                existing.name = res_name
                existing.location = r_data["loc"]
                existing.image_url = r_data["img"]
                existing.type = r_data["type"]
                existing.department_id = dept_id_map.get(r_data["dept_id"])
                db.flush()
            else:
                res = Resource(
                    name=res_name,
                    type=r_data["type"],
                    department_id=dept_id_map.get(r_data["dept_id"]),
                    image_url=r_data["img"],
                    location=r_data["loc"],
                    capacity=10 if r_data["type"] != ResourceTypeEnum.other else 1,
                    approval_required=True if dept_id_map.get(r_data["dept_id"]) else False
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
