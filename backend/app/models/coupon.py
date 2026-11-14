from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class Coupon(Base):
    __tablename__ = "Coupon"

    id = Column(String, primary_key=True, default=generate_cuid)
    code = Column(String, unique=True, nullable=False, index=True)
    discount = Column(Float, nullable=False)
    type = Column(String, default="percentage", nullable=False)
    minOrder = Column("minOrder", Float, default=0.0, nullable=False)
    maxUses = Column("maxUses", Integer, default=100, nullable=False)
    usedCount = Column("usedCount", Integer, default=0, nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    expiresAt = Column("expiresAt", DateTime, nullable=True)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False)
    updatedAt = Column("updatedAt", DateTime, default=utc_now, onupdate=utc_now, nullable=False)

