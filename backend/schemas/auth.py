from pydantic import BaseModel
from pydantic import EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


from models.user import RoleEnum

class SignupRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: RoleEnum
    department_id: int  # Required — employee/manager must belong to a department
    manager_secret_key: Optional[str] = None


class EmailAvailabilityResponse(BaseModel):
    available: bool
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: int
    full_name: str
    email: EmailStr
