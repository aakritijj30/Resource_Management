import os
import sys
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from models.resource import ResourceTypeEnum

def update_resource_images():
    db = SessionLocal()
    try:
        print("Updating resource images based on type...")
        
        # Mapping types to our new public images
        db.execute(text("UPDATE resources SET image_url = '/resources/conference.png' WHERE type = 'conference_room'"))
        db.execute(text("UPDATE resources SET image_url = '/resources/lab.png' WHERE type = 'lab'"))
        db.execute(text("UPDATE resources SET image_url = '/resources/equipment.png' WHERE type = 'equipment'"))
        db.execute(text("UPDATE resources SET image_url = '/resources/other.png' WHERE type = 'other'"))
        db.execute(text("UPDATE resources SET image_url = '/resources/other.png' WHERE type = 'vehicle'")) # Fallback
        
        db.commit()
        print("Success: All resources now have beautiful room images.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_resource_images()
