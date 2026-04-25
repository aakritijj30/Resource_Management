from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
import sys

# Add parent dir
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from services.maintenance_service import get_relevant_maintenance_blocks
from models.user import User

def debug_maintenance():
    db = SessionLocal()
    try:
        # emp1@company.com is user id 3, department 5
        user = db.query(User).filter(User.id == 3).first()
        print(f"Testing for user: {user.full_name}, Dept: {user.department_id}")
        
        blocks = get_relevant_maintenance_blocks(db, user.department_id)
        print(f"Found {len(blocks)} relevant blocks.")
        for b in blocks:
            print(f" - Resource: {b.resource_name}, Reason: {b.reason}, End: {b.end_time}")
            
    finally:
        db.close()

if __name__ == "__main__":
    load_dotenv()
    debug_maintenance()
