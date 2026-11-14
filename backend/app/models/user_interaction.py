from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class UserInteraction(Base):
    __tablename__ = "UserInteraction"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column("userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False, index=True)
    productId = Column("productId", String, ForeignKey("Product.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String, nullable=False, index=True)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False, index=True)

    user = relationship("User", back_populates="interactions")
    product = relationship("Product", back_populates="interactions")

