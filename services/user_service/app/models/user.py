from sqlalchemy import Column, String, Enum, Boolean, TIMESTAMP, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship
from app.core.base import Base

class User(Base):
    __tablename__ = "user"

    id = Column(PGUUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    email = Column(String(255), unique=True, nullable=False)
    nickname = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('user', 'creator', 'admin', name='user_role'), default='user', nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("now()"), nullable=False)
    updated_at = Column(TIMESTAMP, server_default=text("now()"), onupdate=text("now()"), nullable=False)
    avatar_url = Column(String(512), nullable=True)

    developer_profile = relationship(
        "Developer",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False
    )