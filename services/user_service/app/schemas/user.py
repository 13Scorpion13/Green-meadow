from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from .developer import DeveloperOut
from uuid import UUID

UserRole = Literal["user", "creator", "admin"]

class UserBase(BaseModel):
    email: EmailStr
    nickname: str = Field(..., min_length=3, max_length=100)
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)
    
class UserUpdate(BaseModel):
    email: EmailStr | None = None
    nickname: str | None = None
    is_active: Optional[bool] = None
    avatar_url: str | None = None
    
class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., min_length=8, max_length=72)
    new_password: str = Field(..., min_length=8, max_length=72)

    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v, values):
        if 'old_password' in values.data and v == values.data['old_password']:
            raise ValueError('New password must be different from the old password')
        return v

class UserOut(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True
        
class UserFullOut(UserOut):
    developer: DeveloperOut | None = None

