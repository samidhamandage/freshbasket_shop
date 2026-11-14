from sqlalchemy import Column, String, Boolean, DateTime, Index
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid, utc_now

class User(Base):
    __tablename__ = "User"

    id = Column(String, primary_key=True, default=generate_cuid)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    emailVerified = Column("emailVerified", DateTime, nullable=True)
    image = Column(String, nullable=True)
    password = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    role = Column(String, default="USER", nullable=False, index=True)
    blocked = Column(Boolean, default=False, nullable=False)
    createdAt = Column("createdAt", DateTime, default=utc_now, nullable=False)
    updatedAt = Column("updatedAt", DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    interactions = relationship("UserInteraction", back_populates="user", cascade="all, delete-orphan")

