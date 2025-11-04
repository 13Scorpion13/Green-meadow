from datetime import datetime, timezone, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import get_settings
import logging

logger = logging.getLogger(__name__)

settings = get_settings()
security = HTTPBearer()

def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        if user_id is None or role is None:
            return None
        return {"user_id": user_id, "role": role}
    except JWTError:
        return None
    
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    logger.info(f"Received Authorization header: {credentials.credentials}")
    token = credentials.credentials
    user_data = verify_token(token)
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"}, 
        )
    
    return user_data