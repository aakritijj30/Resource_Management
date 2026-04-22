from pydantic import BaseModel
from typing import Optional
from models.resource import ResourceTypeEnum


class ResourceCreate(BaseModel):
    name: str
    type: ResourceTypeEnum = ResourceTypeEnum.other
    capacity: int = 1
    location: Optional[str] = None
    description: Optional[str] = None
    approval_required: bool = False
    department_id: Optional[int] = None  # None = common/shared resource


class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[ResourceTypeEnum] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    description: Optional[str] = None
    approval_required: Optional[bool] = None
    is_active: Optional[bool] = None
    department_id: Optional[int] = None


class ResourceOut(BaseModel):
    id: int
    name: str
    type: ResourceTypeEnum
    capacity: int
    location: Optional[str]
    description: Optional[str]
    approval_required: bool
    is_active: bool
    department_id: Optional[int] = None

    model_config = {"from_attributes": True}
