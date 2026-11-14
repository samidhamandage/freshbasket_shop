from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class Category(Base):
    __tablename__ = "Category"

    id = Column(String, primary_key=True, default=generate_cuid)
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    image = Column(String, nullable=True)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False)
    updatedAt = Column("updatedAt", DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    products = relationship("Product", back_populates="category")

