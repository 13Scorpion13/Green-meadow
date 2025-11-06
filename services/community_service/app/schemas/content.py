from pydantic import BaseModel
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class ContentBase(BaseModel):
    content_type_id: int
    user_id: UUID
    title: Optional[str] = None
    content: str
    agent_id: Optional[UUID] = None

class ContentCreate(BaseModel):
    content_type_id: int
    title: Optional[str] = None
    content: str
    agent_id: Optional[UUID] = None
    user_id: UUID

class ContentUpdate(BaseModel):
    content_type_id: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    agent_id: Optional[UUID] = None

class ContentRead(ContentBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

class ContentReadFull(ContentRead):
    content_type: Optional['ContentTypeRead'] = None
    comments: Optional[List['CommentRead']] = None

from .content_type import ContentTypeRead
from .comments import CommentRead
ContentReadFull.update_forward_refs()