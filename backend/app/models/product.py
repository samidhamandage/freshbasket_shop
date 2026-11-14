from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class Product(Base):
    __tablename__ = "Product"

    id = Column(String, primary_key=True, default=generate_cuid)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    comparePrice = Column("comparePrice", Float, nullable=True)
    images = Column(String, nullable=False)
    categoryId = Column("categoryId", String, ForeignKey("Category.id"), nullable=False, index=True)
    stock = Column(Integer, default=0, nullable=False)
    stockStatus = Column("stockStatus", String, default="IN_STOCK", nullable=False, index=True)
    unit = Column(String, default="piece", nullable=False)
    weight = Column(String, nullable=True)
    featured = Column(Boolean, default=False, nullable=False, index=True)
    rating = Column(Float, default=0.0, nullable=False)
    reviewCount = Column("reviewCount", Integer, default=0, nullable=False)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False)
    updatedAt = Column("updatedAt", DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    category = relationship("Category", back_populates="products")
    orderItems = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    inventoryLogs = relationship("InventoryLog", back_populates="product", cascade="all, delete-orphan")
    interactions = relationship("UserInteraction", back_populates="product", cascade="all, delete-orphan")

