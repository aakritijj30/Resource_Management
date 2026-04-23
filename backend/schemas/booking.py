from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.booking import BookingStatusEnum


class BookingCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: str
    attendees: int = 1


class BookingUpdate(BaseModel):
    purpose: Optional[str] = None
    attendees: Optional[int] = None


class BookingOut(BaseModel):
    id: int
    user_id: int
    resource_id: int
    user_name: Optional[str] = None
    resource_name: Optional[str] = None
    start_time: datetime
    end_time: datetime
    purpose: str
    attendees: int
    status: BookingStatusEnum
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
