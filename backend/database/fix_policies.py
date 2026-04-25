import os
import sys
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal

def fix_allowed_days():
    db = SessionLocal()
    try:
        print("Updating all resource policies to allow Monday-Friday only (bits 0-4)...")
        # 31 = (1<<0) | (1<<1) | (1<<2) | (1<<3) | (1<<4) = 1+2+4+8+16
        db.execute(text("UPDATE resource_policies SET allowed_days = 31"))
        db.commit()
        print("Success: All resources are now set to Mon-Fri.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_allowed_days()
