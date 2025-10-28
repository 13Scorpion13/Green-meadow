from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class DeveloperBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    support_email: EmailStr
    support_phone: Optional[str] = Field(None, max_length=20, pattern=r"^\+?[1-9]\d{1,14}$")
    public_contact: Optional[bool] = True

class DeveloperCreate(DeveloperBase):
    pass

class DeveloperOut(DeveloperBase):
    user_id: UUID
    verified: bool
    created_at: datetime

    class Config:
        from_attributes = True