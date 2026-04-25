import psycopg

def reset_sequences():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            tables = ['users', 'resources', 'departments', 'bookings', 'approvals', 'resource_policies', 'maintenance_blocks']
            for table in tables:
                print(f"Resetting sequence for {table}...")
                # This SQL command finds the max ID and sets the sequence to that value
                # so the next nextval() call returns max+1
                cur.execute(f"""
                    SELECT setval(
                        pg_get_serial_sequence('{table}', 'id'),
                        COALESCE((SELECT MAX(id) FROM {table}), 1),
                        (SELECT MAX(id) FROM {table}) IS NOT NULL
                    );
                """)
            conn.commit()
            print("Successfully reset all sequences.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    reset_sequences()
