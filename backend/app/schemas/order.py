from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from app.schemas.base import BaseSchema

class OrderItemCreate(BaseModel):
    productId: str
    quantity: int
    price: float
    name: str
    image: Optional[str] = None

class OrderItemProductSummary(BaseModel):
    slug: Optional[str] = None
    images: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class OrderItemResponse(BaseModel):
    id: str
    orderId: str
    productId: str
    quantity: int
    price: float
    name: str
    image: Optional[str] = None
    product: Optional[OrderItemProductSummary] = None

    model_config = ConfigDict(from_attributes=True)

class ShippingInfo(BaseModel):
    name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    zip: str

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping: ShippingInfo
    couponCode: Optional[str] = None
    subtotal: float
    deliveryFee: float = 0.0
    discount: float = 0.0
    total: float

class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

class TrackingHistoryResponse(BaseSchema):
    id: str
    orderId: str
    status: str
    note: Optional[str] = None
    createdAt: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class OrderUserSummary(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseSchema):
    id: str
    userId: str
    status: str
    subtotal: float
    deliveryFee: float = 0.0
    discount: float = 0.0
    total: float
    couponCode: Optional[str] = None
    shippingName: str
    shippingEmail: str
    shippingPhone: str
    shippingAddress: str
    shippingCity: str
    shippingState: str
    shippingZip: str
    paymentIntentId: Optional[str] = None
    paymentStatus: str = "pending"
    whatsappNotified: bool = False
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    items: List[OrderItemResponse] = []
    trackingHistory: List[TrackingHistoryResponse] = []
    user: Optional[OrderUserSummary] = None

    model_config = ConfigDict(from_attributes=True)

class OrderCreateResponse(BaseModel):
    orderId: str
    message: str = "Order created"
