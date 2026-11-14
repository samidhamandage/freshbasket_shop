from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class Review(Base):
    __tablename__ = "Review"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column("userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    productId = Column("productId", String, ForeignKey("Product.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Integer, nullable=False, index=True)
    comment = Column(String, nullable=False)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False)
    updatedAt = Column("updatedAt", DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    __table_args__ = (
        UniqueConstraint("userId", "productId", name="Review_userId_productId_key"),
    )

    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

