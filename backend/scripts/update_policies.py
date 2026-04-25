import psycopg

def update_policies():
    try:
        conn = psycopg.connect('postgresql://postgres:Marri%401234@localhost:5432/enterprise_booking')
        with conn.cursor() as cur:
            cur.execute("UPDATE resource_policies SET allowed_days = 31;")
            conn.commit()
            print("Successfully updated all resource policies to 31 (Mon-Fri).")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_policies()
