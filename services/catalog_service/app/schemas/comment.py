from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class CommentBase(BaseModel):
    agent_id: UUID
    # user_id: UUID
    rating: int
    content: str

class CommentCreate(BaseModel):
    agent_id: UUID
    rating: int
    content: str

class CommentUpdate(BaseModel):
    rating: Optional[int] = None
    content: Optional[str] = None

class CommentRead(CommentBase):
    id: UUID
    user_id: UUID
    created_at: datetime

class CommentReadFull(BaseModel):
    id: UUID
    agent_id: UUID
    user_id: UUID
    rating: int
    content: str
    created_at: datetime
