from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from schemas.booking import BookingCreate, BookingOut
from services.booking_service import create_booking, cancel_booking, get_bookings, get_booking_by_id
from utils.dependencies import get_db, get_current_user
from models.user import User

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.get("/", response_model=List[BookingOut])
def list_user_bookings(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_bookings(db, current_user, skip, limit)

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_booking_by_id(db, booking_id, current_user)

@router.post("/", response_model=BookingOut)
def book_resource(data: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_booking(db, data, current_user)

@router.patch("/{booking_id}/cancel", response_model=BookingOut)
def cancel(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cancel_booking(db, booking_id, current_user)