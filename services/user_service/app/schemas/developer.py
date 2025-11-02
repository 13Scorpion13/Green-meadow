from pydantic import BaseModel, Field, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime

class DeveloperBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    support_phone: Optional[str] = Field(None, max_length=20, pattern=r"^\+?[1-9]\d{1,14}$")
    github_profile: Optional[str] = Field(None, max_length=255)
    
    @field_validator('github_profile', mode='before')
    @classmethod
    def validate_github_url(cls, v):
        if v is None:
            return v
        if not v.startswith("https://github.com/"):
            raise ValueError("Must be a valid GitHub profile URL (https://github.com/username)")
        parts = v.split("/")
        if len(parts) < 4 or parts[3] == "":
            return v
        if parts[3] not in ["", "followers", "following", "stars", "repositories", "sponsoring", "topics", "trending", "stars", "watching", "settings"]:
            raise ValueError("Must be a valid GitHub profile URL (https://github.com/username)")
        return v

class DeveloperCreate(DeveloperBase):
    pass

class DeveloperUpdate(DeveloperBase):
    first_name: str | None = Field(None, min_length=1, max_length=100)
    last_name: str | None = Field(None, min_length=1, max_length=100)
    support_phone: str | None = Field(None, max_length=20)
    github_profile: str | None = Field(None, max_length=255)

class DeveloperOut(DeveloperBase):
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True