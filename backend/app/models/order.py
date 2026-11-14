from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class Order(Base):
    __tablename__ = "Order"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column("userId", String, ForeignKey("User.id"), nullable=False, index=True)
    status = Column(String, default="PLACED", nullable=False, index=True)
    subtotal = Column(Float, nullable=False)
    deliveryFee = Column("deliveryFee", Float, default=0.0, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    couponCode = Column("couponCode", String, nullable=True)
    shippingName = Column("shippingName", String, nullable=False)
    shippingEmail = Column("shippingEmail", String, nullable=False)
    shippingPhone = Column("shippingPhone", String, nullable=False)
    shippingAddress = Column("shippingAddress", String, nullable=False)
    shippingCity = Column("shippingCity", String, nullable=False)
    shippingState = Column("shippingState", String, nullable=False)
    shippingZip = Column("shippingZip", String, nullable=False)
    paymentIntentId = Column("paymentIntentId", String, nullable=True)
    paymentStatus = Column("paymentStatus", String, default="pending", nullable=False)
    whatsappNotified = Column("whatsappNotified", Boolean, default=False, nullable=False)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False, index=True)
    updatedAt = Column("updatedAt", DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    trackingHistory = relationship("TrackingHistory", back_populates="order", cascade="all, delete-orphan")

