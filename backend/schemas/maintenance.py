from pydantic import BaseModel
from datetime import datetime


class MaintenanceCreate(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime
    reason: str


class MaintenanceOut(BaseModel):
    id: int
    resource_id: int
    resource_name: str | None = None
    start_time: datetime
    end_time: datetime
    reason: str
    created_by: int
    created_at: datetime

    model_config = {"from_attributes": True}
