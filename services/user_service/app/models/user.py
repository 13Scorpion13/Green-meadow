from sqlalchemy import Column, UUID, String, Enum, Boolean, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from app.core.base import Base

class User(Base):
    __tablename__ = "user"

    id = Column(PGUUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    type = Column(Enum('individual', 'organization', 'provider', name='user_type'), nullable=False)
    role = Column(Enum('user', 'manager', 'admin', name='user_role'), default='user', nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=text("now()"), onupdate=text("now()"), nullable=False)

    individual_profile = relationship("IndividualProfile", back_populates="user", cascade="all, delete-orphan")
    organization_profile = relationship("OrganizationProfile", back_populates="user", cascade="all, delete-orphan")
    provider_profile = relationship("ProviderProfile", back_populates="user", cascade="all, delete-orphan")