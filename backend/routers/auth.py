from fastapi import APIRouter, Depends, HTTPException, status, Query
import os
from sqlalchemy.orm import Session
from schemas.auth import LoginRequest, SignupRequest, TokenResponse, EmailAvailabilityResponse
from schemas.user import UserProfileOut
from services.auth_service import verify_password, create_access_token, hash_password
from utils.dependencies import get_db, get_current_user
from models.user import User, RoleEnum
from models.department import Department
from models.audit_log import AuditActionEnum
from services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["auth"], redirect_slashes=False)


def _auth_payload(user: User) -> dict:
    role_val = user.role.value if hasattr(user.role, "value") else user.role
    return {
        "access_token": create_access_token({"sub": str(user.id), "role": role_val}),
        "token_type": "bearer",
        "role": role_val,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email,
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    # Normalize email to lowercase for case-insensitive match
    email = data.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if user.is_active is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated")

    log_action(db, user.id, AuditActionEnum.user_login, "user", user.id)
    db.commit()

    return _auth_payload(user)


@router.get("/check-email", response_model=EmailAvailabilityResponse)
def check_email(email: str = Query(...), db: Session = Depends(get_db)):
    normalized = email.strip().lower()
    exists = db.query(User.id).filter(User.email == normalized).first() is not None
    return {"available": not exists, "email": normalized}


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # Normalize email to lowercase before storing
    normalized_email = data.email.strip().lower()

    if db.query(User).filter(User.email == normalized_email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    # Block admin sign-up
    if data.role == RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin accounts cannot be created via sign-up."
        )

    # Validate manager secret key
    if data.role == RoleEnum.manager:
        expected_key = os.getenv("MANAGER_SIGNUP_KEY")
        if not expected_key or data.manager_secret_key != expected_key:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid Manager Secret Key."
            )

    # Validate department exists
    department = db.query(Department).filter(Department.id == data.department_id).first()
    if not department:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Department not found.")

    user = User(
        email=normalized_email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        department_id=data.department_id
    )
    db.add(user)
    db.flush()  # get user.id before commit

    # Auto-assign manager to their department
    if data.role == RoleEnum.manager:
        department.manager_id = user.id

    log_action(db, user.id, AuditActionEnum.user_created, "user", user.id)
    db.commit()
    db.refresh(user)

    return _auth_payload(user)

@router.get("/me", response_model=UserProfileOut)
def get_me(current_user: User = Depends(get_current_user)):
    department_name = current_user.department.name if current_user.department else None
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "department_id": current_user.department_id,
        "department_name": department_name,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
    }
