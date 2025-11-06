from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from uuid import UUID
from datetime import datetime

UserRole = Literal["user", "creator", "admin"]

class UserBase(BaseModel):
    email: EmailStr
    nickname: str = Field(..., min_length=3, max_length=100)
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

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
    
class UserOut(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True