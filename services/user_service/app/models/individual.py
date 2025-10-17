from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.base import Base

class IndividualProfile(Base):
    __tablename__ = "individual_profile"

    user_id = Column(PGUUID(as_uuid=True), ForeignKey("user.id", ondelete="CASCADE"), primary_key=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(512), nullable=True)

    user = relationship("User", back_populates="individual_profile")