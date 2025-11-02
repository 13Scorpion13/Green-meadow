from sqlalchemy import Column, Text, DateTime, Enum, ForeignKey
from enum import Enum
from sqlalchemy.types import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.core.base import Base
from sqlalchemy.orm import relationship

class VersionStatusEnum(str, Enum):
    stable = 'stable'
    latest = 'latest'
    published = 'published'
    unpublished = 'unpublished'

class Version(Base):
    __tablename__ = 'versions'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), nullable=False)
    version = Column(Text, nullable=False)
    changelog = Column(Text, nullable=True)
    status = Column(SQLEnum(VersionStatusEnum, name='version_status_enum'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    project_path = Column(Text, nullable=True)

    agent = relationship('Agent')
