from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime

class VersionBase(BaseModel):
    agent_id: UUID
    version: str
    changelog: Optional[str] = None
    status: str
    project_path: Optional[str] = None

class VersionCreate(BaseModel):
    agent_id: UUID
    version: str
    changelog: Optional[str] = None
    status: str
    project_path: Optional[str] = None

class VersionUpdate(BaseModel):
    version: Optional[str] = None
    changelog: Optional[str] = None
    status: Optional[str] = None
    project_path: Optional[str] = None

class VersionRead(VersionBase):
    id: UUID
    created_at: datetime

class VersionReadFull(BaseModel):
    id: UUID
    agent_id: UUID
    version: str
    changelog: Optional[str] = None
    status: str
    project_path: Optional[str] = None
    created_at: datetime
