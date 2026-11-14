from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.schemas.base import BaseSchema
from app.schemas.auth import UserResponse

class UserCountSummary(BaseModel):
    orders: int = 0

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    image: Optional[str] = None
    blocked: Optional[bool] = None
    role: Optional[str] = None

class UserAdminView(BaseSchema):
    id: str
    name: Optional[str] = None
    email: str
    role: str
    phone: Optional[str] = None
    image: Optional[str] = None
    blocked: bool
    createdAt: Optional[datetime] = None
    orderCount: Optional[int] = 0
    totalSpent: Optional[float] = 0.0
    count_: Optional[UserCountSummary] = Field(default_factory=UserCountSummary, alias="_count")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
