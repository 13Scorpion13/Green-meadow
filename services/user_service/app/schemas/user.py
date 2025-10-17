from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

UserType = Literal["individual", "organization", "provider"]
UserRole = Literal["user", "manager", "admin"]

class UserBase(BaseModel):
    email: EmailStr
    type: UserType

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

class UserOut(UserBase):
    id: UUID
    role: UserRole
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str