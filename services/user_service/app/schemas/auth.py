from pydantic import BaseModel, EmailStr
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
    
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str