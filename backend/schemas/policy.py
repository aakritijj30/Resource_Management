from pydantic import BaseModel
from typing import Optional, List


class PolicyCreate(BaseModel):
    resource_id: int
    max_duration_hours: float = 8.0
    min_duration_hours: float = 0.5
    office_hours_start: int = 9
    office_hours_end: int = 18
    allowed_days: int = 0b0111110  # Mon-Fri
    require_justification: bool = False
    advance_booking_days: int = 30
    max_attendees: Optional[int] = None
    allowed_department_ids: Optional[List[int]] = None


class PolicyUpdate(BaseModel):
    max_duration_hours: Optional[float] = None
    min_duration_hours: Optional[float] = None
    office_hours_start: Optional[int] = None
    office_hours_end: Optional[int] = None
    allowed_days: Optional[int] = None
    require_justification: Optional[bool] = None
    advance_booking_days: Optional[int] = None
    max_attendees: Optional[int] = None
    allowed_department_ids: Optional[List[int]] = None


class PolicyOut(BaseModel):
    id: int
    resource_id: int
    max_duration_hours: float
    min_duration_hours: float
    office_hours_start: int
    office_hours_end: int
    allowed_days: int
    require_justification: bool
    advance_booking_days: int
    max_attendees: Optional[int] = None
    allowed_department_ids: Optional[List[int]] = None

    model_config = {"from_attributes": True}
