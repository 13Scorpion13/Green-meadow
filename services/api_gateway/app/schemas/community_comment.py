from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class CommentBase(BaseModel):
    rating: Optional[int] = None
    comment: str
    parent_comment_id: Optional[UUID] = None

class CommentCreate(CommentBase):
    pass

class CommentUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None
    parent_comment_id: Optional[UUID] = None

class CommentRead(CommentBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    
    author_nickname: Optional[str] = None

    class Config:
        from_attributes = True