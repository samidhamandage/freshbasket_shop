from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid

class OrderItem(Base):
    __tablename__ = "OrderItem"

    id = Column(String, primary_key=True, default=generate_cuid)
    orderId = Column("orderId", String, ForeignKey("Order.id", ondelete="CASCADE"), nullable=False, index=True)
    productId = Column("productId", String, ForeignKey("Product.id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    name = Column(String, nullable=False)
    image = Column(String, nullable=True)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="orderItems")

