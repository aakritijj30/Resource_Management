from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.user import User
from models.notification import Notification
from schemas.notification import NotificationOut, NotificationUpdate
from utils.dependencies import get_db, require_role
from models.user import RoleEnum

router = APIRouter(prefix="/notifications", tags=["notifications"], redirect_slashes=False)


@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.employee, RoleEnum.manager, RoleEnum.admin))
):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.patch("/{notification_id}", response_model=NotificationOut)
def update_notification(
    notification_id: int,
    data: NotificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.employee, RoleEnum.manager, RoleEnum.admin))
):
    notif = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = data.is_read
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/mark-all-read")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.employee, RoleEnum.manager, RoleEnum.admin))
):
    db.query(Notification).filter(Notification.user_id == current_user.id, Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
