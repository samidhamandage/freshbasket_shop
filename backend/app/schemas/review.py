from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.base import BaseSchema

class ReviewCreate(BaseModel):
    productId: str
    rating: int = Field(ge=1, le=5)
    comment: str

class ReviewUserSummary(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ReviewResponse(BaseSchema):
    id: str
    userId: str
    productId: str
    rating: int
    comment: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    user: Optional[ReviewUserSummary] = None

    model_config = ConfigDict(from_attributes=True)
