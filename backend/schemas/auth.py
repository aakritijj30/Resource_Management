from pydantic import BaseModel
from pydantic import EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: str
    password: str


class SignupRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    department_id: Optional[int] = None


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
