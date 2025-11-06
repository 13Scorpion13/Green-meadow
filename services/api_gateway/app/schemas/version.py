from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class VersionBase(BaseModel):
    agent_id: UUID
    version: str
    changelog: Optional[str] = None
    status: str
    project_path: Optional[str] = None

class VersionCreate(VersionBase):
    pass

class VersionUpdate(BaseModel):
    version: Optional[str] = None
    changelog: Optional[str] = None
    status: Optional[str] = None
    project_path: Optional[str] = None

class VersionRead(VersionBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True