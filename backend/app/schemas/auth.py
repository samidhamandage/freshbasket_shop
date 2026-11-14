import re
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from app.schemas.base import BaseSchema

NAME_REGEX = re.compile(r"^[A-Za-z\s]+$")
UPPERCASE_REGEX = re.compile(r"[A-Z]")
DIGIT_REGEX = re.compile(r"[0-9]")
SPECIAL_CHAR_REGEX = re.compile(r"[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\/'`~]")

class UserResponse(BaseSchema):
    id: str
    name: Optional[str] = None
    email: str
    role: str = "USER"
    image: Optional[str] = None
    phone: Optional[str] = None
    blocked: bool = False
    createdAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Full Name is required.")
        if len(trimmed) < 2:
            raise ValueError("Full Name must be at least 2 characters.")
        if not NAME_REGEX.match(trimmed):
            raise ValueError("Full Name must contain only alphabetic letters and spaces.")
        return trimmed

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not UPPERCASE_REGEX.search(v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not DIGIT_REGEX.search(v):
            raise ValueError("Password must contain at least one number.")
        if not SPECIAL_CHAR_REGEX.search(v):
            raise ValueError("Password must contain at least one special character.")
        return v

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str
