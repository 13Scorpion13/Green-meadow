from sqlalchemy import Column, Text, DateTime, Float, Integer, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.base import Base

class Agent(Base):
    __tablename__ = 'agents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    name = Column(Text, nullable=False)
    slug = Column(Text, nullable=False, unique=True)
    agent_url = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    tags = Column(JSONB, nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id'), nullable=True)
    article_id = Column(UUID(as_uuid=True), nullable=True)
    price = Column(Numeric, nullable=True)
    avg_raiting = Column(Float, nullable=True)
    reviews_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    category = relationship('Category', backref='agents')
    comments = relationship('Comment', backref='agent', cascade='all, delete-orphan')
    media = relationship("AgentMedia", back_populates="agent", cascade="all, delete-orphan")
