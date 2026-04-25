import psycopg

def add_missing_column():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            # Check if column exists first
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='resources' AND column_name='created_at';
            """)
            if not cur.fetchone():
                print("Adding created_at column to resources table...")
                cur.execute("ALTER TABLE resources ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;")
                conn.commit()
                print("Successfully added created_at column.")
            else:
                print("Column created_at already exists.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_missing_column()
