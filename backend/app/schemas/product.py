from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.base import BaseSchema
from app.schemas.category import CategoryResponse

class ProductBase(BaseSchema):
    name: str
    slug: Optional[str] = None
    description: str
    price: float
    comparePrice: Optional[float] = None
    images: str
    categoryId: str
    stock: int = 0
    stockStatus: str = "IN_STOCK"
    unit: str = "piece"
    weight: Optional[str] = None
    featured: bool = False
    rating: float = 0.0
    reviewCount: int = 0

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    comparePrice: Optional[float] = None
    images: str
    categoryId: str
    stock: int = 0
    unit: str = "piece"
    weight: Optional[str] = None
    featured: bool = False

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    comparePrice: Optional[float] = None
    images: Optional[str] = None
    categoryId: Optional[str] = None
    stock: Optional[int] = None
    stockStatus: Optional[str] = None
    unit: Optional[str] = None
    weight: Optional[str] = None
    featured: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    totalPages: int
