from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.utils.password import verify_password
from app.utils.auth import (
    create_access_token,
    create_refresh_token,
    store_refresh_token,
    validate_refresh_token,
    delete_refresh_token
)
from app.schemas.auth import LoginRequest
from typing import Optional
from jose import jwt
from app.config import get_settings

settings = get_settings()

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
    
    await store_refresh_token(str(user.id), refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
    
async def refresh_user_token(db: AsyncSession, refresh_token: str):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Could not validate credentials")
    except jwt.JWTError:
        raise ValueError("Could not validate credentials")

    is_valid = await validate_refresh_token(user_id, refresh_token)
    if not is_valid:
        raise ValueError("Invalid refresh token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise ValueError("User not found or inactive")

    await delete_refresh_token(user_id)

    new_access_data = {"sub": str(user.id), "role": user.role}
    new_access_token = create_access_token(data=new_access_data)

    new_refresh_data = {"sub": str(user.id), "role": user.role}
    new_refresh_token = create_refresh_token(data=new_refresh_data)

    await store_refresh_token(user_id, new_refresh_token)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }
    
async def logout_user(user_id: str):
    await delete_refresh_token(user_id)