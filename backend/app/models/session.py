from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid

class Session(Base):
    __tablename__ = "Session"

    id = Column(String, primary_key=True, default=generate_cuid)
    sessionToken = Column("sessionToken", String, unique=True, nullable=False)
    userId = Column("userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    expires = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")

