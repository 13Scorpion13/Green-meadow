from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProviderBase(BaseModel):
    description: Optional[str] = Field(None, max_length=10000)
    support_email: Optional[EmailStr] = None
    support_phone: Optional[str] = Field(None, max_length=20, pattern=r"^\+?[1-9]\d{1,14}$")
    public_contact: Optional[bool] = True

class ProviderCreate(ProviderBase):
    pass

class ProviderOut(ProviderBase):
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True