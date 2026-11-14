from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class TrackingHistory(Base):
    __tablename__ = "TrackingHistory"

    id = Column(String, primary_key=True, default=generate_cuid)
    orderId = Column("orderId", String, ForeignKey("Order.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, nullable=False)
    note = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False, index=True)

    order = relationship("Order", back_populates="trackingHistory")

