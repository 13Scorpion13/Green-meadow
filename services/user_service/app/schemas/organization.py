from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from uuid import UUID

class OrganizationProfileBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=255)
    legal_name: Optional[str] = Field(None, max_length=255)
    tax_id: Optional[str] = Field(None, max_length=50, pattern=r"^[A-Z0-9\-]+$")
    website: Optional[HttpUrl] = None
    address: Optional[str] = Field(None, max_length=512)
    contact_person: Optional[str] = Field(None, max_length=255)

class OrganizationProfileCreate(OrganizationProfileBase):
    pass

class OrganizationProfileOut(OrganizationProfileBase):
    user_id: UUID
    verified: bool

    class Config:
        from_attributes = True