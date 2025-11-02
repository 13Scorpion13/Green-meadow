from sqlalchemy import Column, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.base import Base

class Category(Base):
    __tablename__ = 'categories'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(Text, nullable=False)
    slug = Column(Text, nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(Text, nullable=True)
