from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.auth import LoginRequest, TokenResponse
from schemas.user import UserOut
from services.auth_service import verify_password, create_access_token
from utils.dependencies import get_db, get_current_user
from models.user import User
from models.audit_log import AuditActionEnum
from services.audit_service import log_action

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    # Explicitly check for False, averting a lockout if the boolean was saved as None
    if user.is_active is False:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account deactivated")

    role_val = user.role.value if hasattr(user.role, "value") else user.role
    token = create_access_token({"sub": str(user.id), "role": role_val})
    log_action(db, user.id, AuditActionEnum.user_login, "user", user.id)
    db.commit()
    
    return {"access_token": token, "token_type": "bearer", "role": role_val, "user_id": user.id, "full_name": user.full_name}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
