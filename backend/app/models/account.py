from sqlalchemy import Column, String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database.base import Base
from app.utils.helpers import generate_cuid

class Account(Base):
    __tablename__ = "Account"

    id = Column(String, primary_key=True, default=generate_cuid)
    userId = Column("userId", String, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    providerAccountId = Column("providerAccountId", String, nullable=False)
    refresh_token = Column(String, nullable=True)
    access_token = Column(String, nullable=True)
    expires_at = Column(Integer, nullable=True)
    token_type = Column(String, nullable=True)
    scope = Column(String, nullable=True)
    id_token = Column(String, nullable=True)
    session_state = Column(String, nullable=True)

    __table_args__ = (
        UniqueConstraint("provider", "providerAccountId", name="Account_provider_providerAccountId_key"),
    )

    user = relationship("User", back_populates="accounts")

