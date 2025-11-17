from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from app.config import get_settings
from app.schemas.auth import TokenData
from app.redis import redis_client

settings = get_settings()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def store_refresh_token(user_id: str, refresh_token: str):
    key = f"user:{user_id}:refresh_token"
    ttl = int(timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS).total_seconds())
    await redis_client.setex(key, ttl, refresh_token)
    
async def validate_refresh_token(user_id: str, refresh_token: str) -> bool:
    key = f"user:{user_id}:refresh_token"
    stored_token = await redis_client.get(key)
    if stored_token == refresh_token:
        return True
    return False

async def delete_refresh_token(user_id: str):
    key = f"user:{user_id}:refresh_token"
    await redis_client.delete(key)

def verify_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            return None
        return TokenData(user_id=user_id, role=role)
    except JWTError:
        return None