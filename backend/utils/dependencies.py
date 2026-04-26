from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from services.auth_service import verify_token
from models.user import User, RoleEnum
from typing import List

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")
    return user


def require_role(*roles: RoleEnum):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # Handle cases where current_user.role might be an enum object or a string
        user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
        user_role_str = user_role.lower()
        
        allowed_roles_str = [str(r.value).lower() for r in roles]
        
        if user_role_str not in allowed_roles_str:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles_str}"
            )
        return current_user
    return role_checker
