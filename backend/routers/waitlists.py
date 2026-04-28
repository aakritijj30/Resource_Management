from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from models.user import User
from schemas.waitlist import WaitlistCreate, WaitlistOut
from services.waitlist_service import create_waitlist_entry, get_my_waitlist_entries, cancel_waitlist_entry
from utils.dependencies import get_current_user, get_db


router = APIRouter(prefix="/waitlists", tags=["waitlists"], redirect_slashes=False)


@router.get("/mine", response_model=List[WaitlistOut])
@router.get("/mine/", response_model=List[WaitlistOut])
def list_my_waitlists(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_my_waitlist_entries(db, current_user)


@router.post("/", response_model=WaitlistOut)
def join_waitlist(data: WaitlistCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_waitlist_entry(db, data, current_user)


@router.delete("/{waitlist_id}", response_model=WaitlistOut)
@router.delete("/{waitlist_id}/", response_model=WaitlistOut)
def delete_waitlist(waitlist_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cancel_waitlist_entry(db, waitlist_id, current_user)
