from sqlalchemy import Column, String, Text, TIMESTAMP, Boolean, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.base import Base

class ProviderProfile(Base):
    __tablename__ = "provider_profile"

    user_id = Column(PGUUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), primary_key=True, nullable=False)
    description = Column(Text, nullable=True)
    support_email = Column(String(255), nullable=True)
    support_phone = Column(String(20), nullable=True)
    public_contact = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"), nullable=False)

    user = relationship("User", back_populates="provider_profile")