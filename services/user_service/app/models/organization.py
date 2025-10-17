from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.base import Base

class OrganizationProfile(Base):
    __tablename__ = "organization_profile"

    user_id = Column(PGUUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    company_name = Column(String(255), nullable=False)
    legal_name = Column(String(255), nullable=True)
    tax_id = Column(String(50), nullable=True) 
    website = Column(String(255), nullable=True)
    address = Column(String(512), nullable=True)
    contact_person = Column(String(255), nullable=True)
    verified = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="organization_profile")