from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from models.user import RoleEnum
import re


class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str
    role: RoleEnum = RoleEnum.employee
    department_id: Optional[int] = None

    @field_validator("email")
    def validate_email_pattern(cls, v):
        if not re.match(r"^[a-z]+\.[a-z0-9]+@relanto\.ai$", v):
            raise ValueError("Email must follow the pattern 'name.name1@relanto.ai'")
        return v

    @field_validator("password")
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?/" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[RoleEnum] = None
    department_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: RoleEnum
    department_id: Optional[int]
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: RoleEnum
    department_id: Optional[int]
    department_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
