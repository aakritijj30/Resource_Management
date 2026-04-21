from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.approval import ApprovalDecisionEnum


class ApprovalCreate(BaseModel):
    booking_id: int


class ApprovalDecide(BaseModel):
    decision: ApprovalDecisionEnum
    comment: Optional[str] = None


class ApprovalOut(BaseModel):
    id: int
    booking_id: int
    manager_id: Optional[int]
    decision: ApprovalDecisionEnum
    comment: Optional[str]
    decided_at: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}
