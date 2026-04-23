import sys
import os
import random
import string
import secrets
from sqlalchemy.orm import Session

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.connection import SessionLocal
from models.user import User
from services.auth_service import hash_password

def generate_strong_password(length=12):
    """Generate a strong password with at least one upper, one lower, one digit, and one special char."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*()_+-="
    while True:
        password = ''.join(secrets.choice(alphabet) for i in range(length))
        if (any(c.islower() for c in password)
                and any(c.isupper() for c in password)
                and sum(c.isdigit() for c in password) >= 1
                and any(c in "!@#$%^&*()_+-=" for c in password)):
            return password

def migrate_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        credentials = []
        
        for user in users:
            # Generate new email: first.last@relanto.ai
            names = user.full_name.lower().split()
            if len(names) >= 2:
                new_email = f"{names[0]}.{names[1]}@relanto.ai"
            else:
                new_email = f"{names[0]}.user@relanto.ai"
            
            # Ensure uniqueness
            original_new_email = new_email
            counter = 1
            while db.query(User).filter(User.email == new_email, User.id != user.id).first():
                prefix = original_new_email.split('@')[0]
                new_email = f"{prefix}{counter}@relanto.ai"
                counter += 1
            
            new_password = generate_strong_password()
            
            user.email = new_email
            user.hashed_password = hash_password(new_password)
            
            credentials.append(f"Name: {user.full_name}\nRole: {user.role.value}\nEmail: {new_email}\nPassword: {new_password}\n{'-'*30}")
        
        db.commit()
        
        with open("new_user_credentials.txt", "w") as f:
            f.write("\n".join(credentials))
            
        print(f"Successfully migrated {len(users)} users. Credentials saved to new_user_credentials.txt")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_users()
