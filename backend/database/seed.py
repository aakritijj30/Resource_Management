"""
Mandatory seed script that ensures admin, departments, and resources exist.
Usage: python database/seed.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import Base, SessionLocal, engine
import models  # noqa

from models.department import Department
from models.resource import Resource, ResourceTypeEnum
from models.resource_policy import ResourcePolicy
from models.user import RoleEnum, User
from services.auth_service import hash_password


def seed_mandatory():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        admin_email = "admin@company.com"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                full_name="System Admin",
                hashed_password=hash_password("admin123"),
                role=RoleEnum.admin,
                is_active=True,
            )
            db.add(admin)
            db.commit()
            print(f"Admin created: {admin_email} / admin123")
        else:
            print(f"Admin already exists: {admin_email}")

        department_names = [
            "Data and AI",
            "Salesforce",
            "AI First Labs",
            "Planning",
            "Digital Transformation",
        ]

        dept_map = {}
        for dept_name in department_names:
            dept = db.query(Department).filter(Department.name == dept_name).first()
            if not dept:
                dept = Department(name=dept_name)
                db.add(dept)
                db.flush()
                print(f"Department created: {dept_name}")
            else:
                print(f"Department already exists: {dept_name}")
            dept_map[dept_name] = dept

        dept_resources = {
            "Data and AI": [
                dict(
                    name="AI Workstation Lab",
                    type=ResourceTypeEnum.lab,
                    capacity=10,
                    location="Floor 4 - Room 401",
                    approval_required=False,
                    description="High-GPU workstations for AI/ML model training",
                ),
                dict(
                    name="Data Science Meeting Room",
                    type=ResourceTypeEnum.conference_room,
                    capacity=8,
                    location="Floor 4 - Room 402",
                    approval_required=False,
                    description="Private meeting room with dual 4K displays",
                ),
            ],
            "Salesforce": [
                dict(
                    name="CRM Training Suite",
                    type=ResourceTypeEnum.conference_room,
                    capacity=15,
                    location="Floor 2 - Room 201",
                    approval_required=False,
                    description="Equipped with Salesforce sandbox environments",
                ),
                dict(
                    name="Client Demo Room",
                    type=ResourceTypeEnum.conference_room,
                    capacity=6,
                    location="Floor 2 - Room 205",
                    approval_required=True,
                    description="Premium AV setup for client-facing demos",
                ),
            ],
            "AI First Labs": [
                dict(
                    name="Innovation Lab A",
                    type=ResourceTypeEnum.lab,
                    capacity=12,
                    location="Floor 5 - Lab A",
                    approval_required=False,
                    description="Collaborative space with whiteboards and rapid prototyping tools",
                ),
                dict(
                    name="3D Printer Station",
                    type=ResourceTypeEnum.equipment,
                    capacity=1,
                    location="Floor 5 - Lab B",
                    approval_required=True,
                    description="Industrial 3D printer for prototype manufacturing",
                ),
            ],
            "Planning": [
                dict(
                    name="Strategy Board Room",
                    type=ResourceTypeEnum.conference_room,
                    capacity=20,
                    location="Floor 3 - Room 301",
                    approval_required=True,
                    description="Executive-level boardroom for planning sessions",
                ),
                dict(
                    name="Project War Room",
                    type=ResourceTypeEnum.conference_room,
                    capacity=10,
                    location="Floor 3 - Room 308",
                    approval_required=False,
                    description="Dedicated space for project sprints and war-room sessions",
                ),
            ],
            "Digital Transformation": [
                dict(
                    name="DevOps Lab",
                    type=ResourceTypeEnum.lab,
                    capacity=8,
                    location="Floor 6 - Lab DT",
                    approval_required=False,
                    description="CI/CD pipeline infrastructure and cloud monitoring dashboards",
                ),
                dict(
                    name="UX Research Lab",
                    type=ResourceTypeEnum.lab,
                    capacity=6,
                    location="Floor 6 - Room 601",
                    approval_required=False,
                    description="User testing lab with eye-tracking equipment",
                ),
            ],
        }

        common_resources = [
            dict(
                name="Main Conference Hall",
                type=ResourceTypeEnum.conference_room,
                capacity=50,
                location="Ground Floor",
                approval_required=True,
                description="Large all-hands conference hall for company events",
                department_id=None,
            ),
            dict(
                name="Company Van A",
                type=ResourceTypeEnum.vehicle,
                capacity=8,
                location="Parking Bay 1",
                approval_required=True,
                description="Company vehicle for off-site visits",
                department_id=None,
            ),
        ]

        seeded_resources = 0

        for r_data in common_resources:
            exists = db.query(Resource).filter(Resource.name == r_data["name"]).first()
            if not exists:
                resource = Resource(**r_data)
                db.add(resource)
                db.flush()
                db.add(
                    ResourcePolicy(
                        resource_id=resource.id,
                        max_duration_hours=8,
                        office_hours_start=9,
                        office_hours_end=18,
                    )
                )
                seeded_resources += 1

        for dept_name, resources in dept_resources.items():
            dept = dept_map.get(dept_name)
            if not dept:
                print(f"Warning: Department '{dept_name}' not found, skipping resources.")
                continue

            for r_data in resources:
                exists = db.query(Resource).filter(Resource.name == r_data["name"]).first()
                if not exists:
                    resource = Resource(**r_data, department_id=dept.id)
                    db.add(resource)
                    db.flush()
                    db.add(
                        ResourcePolicy(
                            resource_id=resource.id,
                            max_duration_hours=4,
                            office_hours_start=9,
                            office_hours_end=18,
                        )
                    )
                    seeded_resources += 1

        db.commit()
        if seeded_resources:
            print(f"Resources seeded: {seeded_resources} new resources added.")
        else:
            print("Resources: all already exist, nothing new added.")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_mandatory()
