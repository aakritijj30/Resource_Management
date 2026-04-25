import psycopg

def add_missing_columns():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            # Check for max_attendees
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='resource_policies' AND column_name='max_attendees';
            """)
            if not cur.fetchone():
                print("Adding max_attendees column to resource_policies table...")
                cur.execute("ALTER TABLE resource_policies ADD COLUMN max_attendees INTEGER;")
                conn.commit()
                print("Successfully added max_attendees column.")
            
            # Check for allowed_department_ids
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='resource_policies' AND column_name='allowed_department_ids';
            """)
            if not cur.fetchone():
                print("Adding allowed_department_ids column to resource_policies table...")
                cur.execute("ALTER TABLE resource_policies ADD COLUMN allowed_department_ids JSON;")
                conn.commit()
                print("Successfully added allowed_department_ids column.")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_missing_columns()
