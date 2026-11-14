from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.base import BaseSchema

class CouponValidateRequest(BaseModel):
    code: str
    subtotal: float

class CouponValidateResponse(BaseModel):
    valid: bool
    discount: float = 0.0
    type: Optional[str] = None
    message: str

class CouponBase(BaseSchema):
    code: str
    discount: float
    type: str = "percentage"
    minOrder: float = 0.0
    maxUses: int = 100
    usedCount: int = 0
    active: bool = True
    expiresAt: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount: Optional[float] = None
    type: Optional[str] = None
    minOrder: Optional[float] = None
    maxUses: Optional[int] = None
    usedCount: Optional[int] = None
    active: Optional[bool] = None
    expiresAt: Optional[datetime] = None

class CouponResponse(CouponBase):
    id: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
