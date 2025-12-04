from sqlalchemy import Column, Text, DateTime, Boolean, UUID, ForeignKey
from sqlalchemy.dialects.postgresql import ENUM
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.base import Base

class AgentMedia(Base):
    __tablename__ = 'agent_media'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), nullable=False)
    media_type = Column(ENUM('image', 'video', name='media_type_enum'), nullable=False)
    file_path = Column(Text, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Связь с агентом
    agent = relationship("Agent", back_populates="media")