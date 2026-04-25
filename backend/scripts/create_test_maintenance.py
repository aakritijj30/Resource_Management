import psycopg
from datetime import datetime, timedelta

def create_test_block():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM resources WHERE name = 'Parking Slot P1';")
            row = cur.fetchone()
            if not row:
                print("Resource P1 not found")
                return
            res_id = row[0]
            
            # Start now, end in 2 days
            start = datetime.now()
            end = start + timedelta(days=2)
            
            cur.execute("""
                INSERT INTO maintenance_blocks (resource_id, start_time, end_time, reason, created_by, created_at)
                VALUES (%s, %s, %s, %s, 1, CURRENT_TIMESTAMP);
            """, (res_id, start, end, "Scheduled Server Maintenance"))
            conn.commit()
            print(f"Created maintenance block for Parking Slot P1 (ID: {res_id})")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_test_block()
