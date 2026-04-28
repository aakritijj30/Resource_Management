from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from models.waitlist import WaitlistStatusEnum


class WaitlistCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: str
    attendees: int = 1


class WaitlistOut(BaseModel):
    id: int
    user_id: int
    resource_id: int
    booking_id: Optional[int] = None
    start_time: datetime
    end_time: datetime
    purpose: str
    attendees: int
    status: WaitlistStatusEnum
    created_at: datetime
    updated_at: datetime
    resource_name: Optional[str] = None

    model_config = {"from_attributes": True}
