from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    agent_id: UUID
    rating: int
    content: str

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    rating: Optional[int] = None
    content: Optional[str] = None

class CommentRead(CommentBase):
    id: UUID
    agent_id: UUID
    user_id: UUID
    created_at: datetime
    
    author_nickname: Optional[str] = None

    class Config:
        from_attributes = True