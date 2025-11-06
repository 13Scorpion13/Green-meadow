from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class DeveloperOut(BaseModel):
    # user_id: UUID
    first_name: str
    last_name: str
    github_profile: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class UserWithDeveloper(BaseModel):
    # id: UUID
    email: EmailStr
    nickname: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_url: Optional[str] = None

    developer: Optional[DeveloperOut] = None

    class Config:
        from_attributes = True
        
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None