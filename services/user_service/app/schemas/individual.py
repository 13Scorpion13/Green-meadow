from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class IndividualProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20, pattern=r"^\+?[1-9]\d{1,14}$")
    avatar_url: Optional[str] = Field(None, max_length=512)

class IndividualProfileCreate(IndividualProfileBase):
    pass

class IndividualProfileOut(IndividualProfileBase):
    user_id: UUID

    class Config:
        from_attributes = True