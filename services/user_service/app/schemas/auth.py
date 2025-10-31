from pydantic import BaseModel
from typing import Literal

class TokenData(BaseModel):
    user_id: str
    role: Literal["user", "creator", "admin"]

class Token(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    email: str
    password: str