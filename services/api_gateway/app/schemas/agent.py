from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Any
from datetime import datetime
from .user import DeveloperOut

class AgentBase(BaseModel):
    name: str
    slug: str
    agent_url: str
    description: str
    requirements: Optional[str] = None
    tags: Optional[Any] = None
    category_id: Optional[UUID] = None
    article_id: Optional[UUID] = None
    price: Optional[float] = None
    avg_raiting: Optional[float] = None
    reviews_count: Optional[int] = None
    
class AgentCreate(AgentBase):
    pass

class AgentUpdate(AgentBase):
    name: Optional[str] = None
    slug: Optional[str] = None
    agent_url: Optional[str] = None
    description: Optional[str] = None
    
class AgentRead(AgentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        
class AgentReadFull(AgentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    developer: Optional[DeveloperOut] = None

    class Config:
        from_attributes = True