from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from schemas.booking import BookingCreate, BookingOut, BookingUpdate, BookingAuditOut
from services.booking_service import create_booking, cancel_booking, get_bookings, get_booking_by_id, update_booking, get_booking_audit_trail, check_in_booking, mark_booking_no_show
from utils.dependencies import get_db, get_current_user
from models.user import User, RoleEnum

router = APIRouter(prefix="/bookings", tags=["bookings"], redirect_slashes=False)

@router.get("", response_model=List[BookingOut])
@router.get("/", response_model=List[BookingOut])
def list_user_bookings(
    mine_only: bool = False, 
    skip: int = 0, 
    limit: int = 50, 
    department_id: Optional[int] = None,
    is_common: Optional[bool] = None,
    sort: str = 'latest',
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return get_bookings(db, current_user, skip, limit, mine_only, department_id, is_common, sort)


@router.get("/department", response_model=List[BookingOut])
@router.get("/department/", response_model=List[BookingOut])
def list_department_bookings(skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in [RoleEnum.manager, RoleEnum.admin]:
        from utils.exceptions import UnauthorizedAccessError
        raise UnauthorizedAccessError()
    from services.booking_service import get_department_bookings
    return get_department_bookings(db, current_user, skip, limit)

@router.get("/{booking_id}", response_model=BookingOut)
@router.get("/{booking_id}/", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_booking_by_id(db, booking_id, current_user)

@router.get("/{booking_id}/audit", response_model=List[BookingAuditOut])
@router.get("/{booking_id}/audit/", response_model=List[BookingAuditOut])
def get_audit(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    booking = get_booking_by_id(db, booking_id, current_user)
    if current_user.role not in [RoleEnum.admin, RoleEnum.manager] and booking.user_id != current_user.id:
        from utils.exceptions import UnauthorizedAccessError
        raise UnauthorizedAccessError()
    return get_booking_audit_trail(db, booking_id)

@router.post("/", response_model=List[BookingOut])
def book_resource(data: BookingCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return create_booking(db, data, current_user)

@router.patch("/{booking_id}", response_model=BookingOut)
@router.patch("/{booking_id}/", response_model=BookingOut)
def edit_booking(booking_id: int, data: BookingUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return update_booking(db, booking_id, data, current_user)

@router.patch("/{booking_id}/cancel", response_model=BookingOut)
@router.patch("/{booking_id}/cancel/", response_model=BookingOut)
def cancel(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return cancel_booking(db, booking_id, current_user)


@router.patch("/{booking_id}/check-in", response_model=BookingOut)
@router.patch("/{booking_id}/check-in/", response_model=BookingOut)
def check_in(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return check_in_booking(db, booking_id, current_user)


@router.patch("/{booking_id}/mark-no-show", response_model=BookingOut, dependencies=[Depends(get_current_user)])
@router.patch("/{booking_id}/mark-no-show/", response_model=BookingOut, dependencies=[Depends(get_current_user)])
def mark_no_show(booking_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return mark_booking_no_show(db, booking_id, current_user)
