from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from models.booking import BookingStatusEnum


class UserNested(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class ApprovalNested(BaseModel):
    id: int
    decision: str
    manager_id: Optional[int] = None

    model_config = {"from_attributes": True}


class BookingCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    purpose: str
    attendees: int = 1


class BookingUpdate(BaseModel):
    resource_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
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
    user: Optional[UserNested] = None
    approval: Optional[ApprovalNested] = None

    model_config = {"from_attributes": True}


class AuditUserNested(BaseModel):
    id: int
    full_name: str
    email: str

    model_config = {"from_attributes": True}


class BookingAuditOut(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    detail: Optional[dict] = None
    timestamp: datetime
    user: Optional[AuditUserNested] = None

    model_config = {"from_attributes": True}
