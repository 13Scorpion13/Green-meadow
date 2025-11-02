from sqlalchemy import Column, String, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from app.core.base import Base

class Developer(Base):
    __tablename__ = "developer"

    user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        primary_key=True,
        nullable=False
    )
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    support_phone = Column(String(20), nullable=True)
    github_profile = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=text("now()"), nullable=False)
    
    user = relationship(
        "User",
        back_populates="developer_profile"
    )