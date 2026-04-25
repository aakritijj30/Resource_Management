import psycopg

def add_missing_column():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            # Check if column exists first
            cur.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='resources' AND column_name='image_url';
            """)
            if not cur.fetchone():
                print("Adding image_url column to resources table...")
                cur.execute("ALTER TABLE resources ADD COLUMN image_url VARCHAR(500);")
                conn.commit()
                print("Successfully added image_url column.")
            else:
                print("Column image_url already exists.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_missing_column()
