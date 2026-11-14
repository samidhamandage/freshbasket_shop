from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.base import BaseSchema

class CategoryBase(BaseSchema):
    name: str
    slug: str
    description: Optional[str] = None
    image: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    productCount: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
