from sqlalchemy import Column, String, DateTime, UniqueConstraint
from app.database.base import Base

class VerificationToken(Base):
    __tablename__ = "VerificationToken"

    identifier = Column(String, primary_key=True)
    token = Column(String, primary_key=True, unique=True, nullable=False)
    expires = Column(DateTime, nullable=False)

    __table_args__ = (
        UniqueConstraint("identifier", "token", name="VerificationToken_identifier_token_key"),
    )

