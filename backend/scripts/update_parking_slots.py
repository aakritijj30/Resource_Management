import psycopg
from datetime import datetime

def update_parking_slots():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            # 1. Ensure Parking Slot P3 exists
            cur.execute("SELECT id FROM resources WHERE name = 'Parking Slot P3';")
            if not cur.fetchone():
                print("Adding Parking Slot P3...")
                cur.execute("""
                    INSERT INTO resources (name, type, capacity, approval_required, is_active, created_at)
                    VALUES ('Parking Slot P3', 'other', 20, FALSE, TRUE, CURRENT_TIMESTAMP)
                    RETURNING id;
                """)
                res_id = cur.fetchone()[0]
                # Add policy for P3
                cur.execute("""
                    INSERT INTO resource_policies (resource_id, max_duration_hours, min_duration_hours, office_hours_start, office_hours_end, allowed_days, max_attendees)
                    VALUES (%s, 24, 0.5, 0, 23, 31, 1);
                """, (res_id,))
            
            # 2. Update capacities for P1 and P2
            print("Updating capacities for P1 and P2...")
            cur.execute("UPDATE resources SET capacity = 10 WHERE name = 'Parking Slot P1';")
            cur.execute("UPDATE resources SET capacity = 15 WHERE name = 'Parking Slot P2';")
            
            # Update P3 capacity if it already existed but had wrong capacity
            cur.execute("UPDATE resources SET capacity = 20 WHERE name = 'Parking Slot P3';")

            conn.commit()
            print("Successfully updated parking slots.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_parking_slots()
