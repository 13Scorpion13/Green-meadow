from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ContentBase(BaseModel):
    content_type_id: int
    title: Optional[str] = None
    content: str
    agent_id: Optional[UUID] = None

class ContentCreate(ContentBase):
    pass

class ContentUpdate(BaseModel):
    content_type_id: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    agent_id: Optional[UUID] = None

class ContentRead(ContentBase):
    id: UUID
    user_id: UUID 
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True