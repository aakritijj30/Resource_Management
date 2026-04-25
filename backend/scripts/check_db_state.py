import psycopg

def check_db():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
            tables = cur.fetchall()
            print(f"Tables: {tables}")
            
            for table in ['resources', 'users', 'bookings', 'departments']:
                cur.execute(f"SELECT count(*) FROM {table}")
                count = cur.fetchone()[0]
                print(f"Table {table} has {count} rows.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()
