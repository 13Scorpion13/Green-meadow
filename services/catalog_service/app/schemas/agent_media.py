from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional
from datetime import datetime

class AgentMediaBase(BaseModel):
    agent_id: UUID
    media_type: str
    file_path: str
    is_primary: bool = False

class AgentMediaCreate(AgentMediaBase):
    pass

class AgentMediaUpdate(BaseModel):
    is_primary: Optional[bool] = None

class AgentMediaResponse(AgentMediaBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True