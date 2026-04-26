import os
import sys
from sqlalchemy import text

# Add parent directory to path
sys.path.insert(0, os.getcwd())

from database.connection import SessionLocal

def update_enum():
    db = SessionLocal()
    try:
        # Check if we are using Postgres or SQLite
        dialect = db.bind.dialect.name
        if dialect == 'postgresql':
            print("Detected PostgreSQL. Updating Enum...")
            # Postgres Enums need explicit ALTER TYPE to add values
            # We use a transaction-safe way to check and add
            db.execute(text("ALTER TYPE auditactionenum ADD VALUE IF NOT EXISTS 'resource_reactivated'"))
            db.commit()
            print("Successfully added 'resource_reactivated' to auditactionenum.")
        else:
            print(f"Detected {dialect}. No manual Enum update needed.")
    except Exception as e:
        print(f"Error updating enum: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_enum()
