from pydantic import BaseModel, Field
from typing import Optional

class DeveloperBase(BaseModel):
    first_name: str
    last_name: str
    github_profile: Optional[str] = None

class DeveloperCreate(DeveloperBase):
    pass

class DeveloperUpdate(DeveloperBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    support_phone: Optional[str] = Field(None, max_length=20)
    github_profile: Optional[str] = None