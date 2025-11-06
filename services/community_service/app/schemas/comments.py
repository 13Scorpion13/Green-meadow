from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class CommentBase(BaseModel):
    user_id: UUID
    parent_comment_id: Optional[UUID] = None
    content_id: UUID
    rating: Optional[int] = None
    comment: str

class CommentCreate(BaseModel):
    parent_comment_id: Optional[UUID] = None
    content_id: UUID
    rating: Optional[int] = None
    comment: str
    user_id: UUID

class CommentUpdate(BaseModel):
    parent_comment_id: Optional[UUID] = None
    rating: Optional[int] = None
    comment: Optional[str] = None

class CommentRead(CommentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class CommentReadFull(CommentRead):
    replies: Optional[List['CommentRead']] = None
    parent_comment: Optional['CommentRead'] = None
    content: Optional['ContentRead'] = None

from .content import ContentRead
CommentReadFull.update_forward_refs()