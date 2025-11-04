from pydantic import BaseModel
from uuid import UUID
from typing import Optional, Any

class AgentCreate(BaseModel):
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