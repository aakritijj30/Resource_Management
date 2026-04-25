import os
import sys
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal

def update_resource_images_specific():
    db = SessionLocal()
    try:
        print("Updating specific resource images from the 'rooms' folder...")
        
        mappings = [
            # Conference Rooms
            (["Ashoka"], "/rooms/ashoka.png"),
            (["Sahyadri"], "/rooms/sahyadri.png"),
            (["Maurya"], "/rooms/maurya.png"),
            (["Hoysala"], "/rooms/croom1.webp"),
            (["Vijayanagara"], "/rooms/croom2.webp"),
            (["Wadeyars"], "/rooms/room2"),
            
            # Cubicles & Desks
            (["Standard Cubicle A", "Standard Cubicle B"], "/rooms/cubicle1.jpg"),
            ([f"Bay Desk {i}" for i in range(1, 11)], "/rooms/bay.jpg"),
            
            # Labs
            (["Ai first lab"], "/rooms/ai_lab.png"),
            (["Moksha"], "/rooms/moksha.png"),
            (["Nalanda"], "/rooms/nalanda.png"),
            (["Mantra"], "/rooms/mantra.png"),
            
            # Other / Common
            (["Indus"], "/rooms/indus.png"),
            (["Ganga"], "/rooms/ganga.png"),
            (["Kaveri"], "/rooms/kaveri.png"),
            (["Kadamba"], "/rooms/room6.webp"),
            (["IT storage 1"], "/rooms/it_storage.png"),
            (["Server room 2"], "/rooms/server.png"),
            (["3D Printer Station"], "/rooms/printer.png"),
            (["Parking Slot P1", "Parking Slot P2"], "/rooms/parking.webp"),
        ]
        
        for names, img_path in mappings:
            for name in names:
                db.execute(text("UPDATE resources SET image_url = :img WHERE name = :name"), {"img": img_path, "name": name})
        
        # Fallback for anything missed
        db.execute(text("UPDATE resources SET image_url = '/rooms/room1.jpg' WHERE image_url IS NULL"))
        
        db.commit()
        print("Success: All resources updated with specific images from the 'rooms' directory.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_resource_images_specific()
