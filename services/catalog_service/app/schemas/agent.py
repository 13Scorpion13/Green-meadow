from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Any, List
from datetime import datetime

class AgentBase(BaseModel):
    user_id: UUID
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

class AgentCreate(BaseModel):
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

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    agent_url: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    tags: Optional[Any] = None
    category_id: Optional[UUID] = None
    article_id: Optional[UUID] = None
    price: Optional[float] = None
    avg_raiting: Optional[float] = None
    reviews_count: Optional[int] = None

class AgentRead(AgentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class AgentReadFull(AgentRead):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    # category: Optional['CategoryRead'] = None
    # comments: Optional[List['CommentRead']] = None
    # versions: Optional[List['VersionRead']] = None

from .category import CategoryRead
from .comment import CommentRead
from .version import VersionRead
AgentReadFull.update_forward_refs()
