from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class InventoryLog(Base):
    __tablename__ = "InventoryLog"

    id = Column(String, primary_key=True, default=generate_cuid)
    productId = Column("productId", String, ForeignKey("Product.id", ondelete="CASCADE"), nullable=False, index=True)
    change = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    stock = Column(Integer, nullable=False)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False, index=True)

    product = relationship("Product", back_populates="inventoryLogs")

