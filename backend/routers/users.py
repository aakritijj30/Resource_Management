from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.user import UserCreate, UserOut, UserUpdate
from services.auth_service import hash_password
from utils.dependencies import get_db, get_current_user, require_role
from models.user import User, RoleEnum
from models.audit_log import AuditActionEnum
from services.audit_service import log_action

router = APIRouter(prefix="/users", tags=["users"], redirect_slashes=False)


@router.get("/", response_model=List[UserOut], dependencies=[Depends(require_role(RoleEnum.admin))])
def list_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()


@router.post("/", response_model=UserOut, dependencies=[Depends(require_role(RoleEnum.admin))])
def create_user(data: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role=data.role,
        department_id=data.department_id
    )
    db.add(user)
    db.flush()
    log_action(db, current_user.id, AuditActionEnum.user_created, "user", user.id)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}", response_model=UserOut, dependencies=[Depends(require_role(RoleEnum.admin))])
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(user, key, val)
    db.commit()
    db.refresh(user)
    return user
