from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.utils.password import verify_password
from app.utils.auth import create_access_token, create_refresh_token
from app.schemas.auth import LoginRequest
from typing import Optional

async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

async def login_user(db: AsyncSession, login_data: LoginRequest):
    user = await authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise ValueError("Incorrect email or password")
    if not user.is_active:
        raise ValueError("User account is deactivated")

    access_token_data = {"sub": str(user.id), "role": user.role}
    access_token = create_access_token(data=access_token_data)

    refresh_token_data = {"sub": str(user.id), "role": user.role}
    refresh_token = create_refresh_token(data=refresh_token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }