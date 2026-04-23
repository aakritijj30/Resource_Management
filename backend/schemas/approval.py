from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.approval import ApprovalDecisionEnum
from schemas.booking import BookingOut


class ApprovalCreate(BaseModel):
    booking_id: int


class ApprovalDecide(BaseModel):
    decision: ApprovalDecisionEnum
    comment: Optional[str] = None


class ApprovalOut(BaseModel):
    id: int
    booking_id: int
    manager_id: Optional[int]
    user_name: Optional[str] = None
    resource_name: Optional[str] = None
    decision: ApprovalDecisionEnum
    comment: Optional[str]
    decided_at: Optional[datetime]
    created_at: datetime
    booking: Optional[BookingOut] = None

    model_config = {"from_attributes": True}
