from sqlalchemy import Column, Text, DateTime, SmallInteger, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.base import Base


class ContentType(Base):
    __tablename__ = 'content_types'

    id = Column(SmallInteger, primary_key=True)
    name = Column(Enum('article', 'discussion', 'agent_article', 'agent_discussion', name='content_type_enum'), unique=True, nullable=False)

    contents = relationship("Content", back_populates="content_type")