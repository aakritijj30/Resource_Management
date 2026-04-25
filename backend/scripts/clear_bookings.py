import psycopg

def clear_all_bookings():
    try:
        # Connect to the enterprise_booking database
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            # 1. Delete all approvals first due to foreign key constraints
            cur.execute("DELETE FROM approvals;")
            
            # 2. Delete all audit logs related to bookings (optional but keeps DB clean)
            cur.execute("DELETE FROM audit_logs WHERE entity_type = 'booking';")
            
            # 3. Delete all bookings
            cur.execute("DELETE FROM bookings;")
            
            conn.commit()
            print("Successfully deleted all bookings, approvals, and related audit logs from the database!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    clear_all_bookings()
