from sqlalchemy import Column, Text, DateTime, SmallInteger, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.base import Base


class Content(Base):
    __tablename__ = 'content'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    content_type_id = Column(SmallInteger, ForeignKey('content_types.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    agent_id = Column(UUID(as_uuid=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    content_type = relationship("ContentType", back_populates="contents")
    comments = relationship("Comment", back_populates="content", cascade="all, delete-orphan")