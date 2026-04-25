import os
import sys
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal

def update_resource_images_renamed():
    db = SessionLocal()
    try:
        print("Updating resource images based on user's renamed files...")
        
        # Mapping resources to exactly named files
        mappings = [
            ("Ashoka", "/rooms/ashoka.webp"),
            ("Sahyadri", "/rooms/sahyadri.png"),
            ("Maurya", "/rooms/maurya.webp"),
            ("Indus", "/rooms/indus.webp"),
            ("Ganga", "/rooms/ganga.webp"),
            ("Kaveri", "/rooms/kaveri.png"),
            ("Ai first lab", "/rooms/ai_lab.png"),
            ("Moksha", "/rooms/moksha.jpg"),
            ("Nalanda", "/rooms/nalanda.webp"),
            ("Mantra", "/rooms/mantra.webp"),
            ("IT storage 1", "/rooms/it_storage.png"),
            ("Server room 2", "/rooms/server.png"),
            ("3D Printer Station", "/rooms/printer.png"),
            ("Parking Slot P1", "/rooms/parking.webp"),
            ("Parking Slot P2", "/rooms/parking.webp"),
            ("Standard Cubicle A", "/rooms/cubicle1.jpg"),
            ("Standard Cubicle B", "/rooms/cubicle2.jpg"),
        ]
        
        for i in range(1, 11):
            mappings.append((f"Bay Desk {i}", "/rooms/bay.jpg"))
            
        for name, img_path in mappings:
            db.execute(text("UPDATE resources SET image_url = :img WHERE name = :name"), {"img": img_path, "name": name})
        
        db.commit()
        print("Success: All resources updated to match your newly named pictures.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_resource_images_renamed()
