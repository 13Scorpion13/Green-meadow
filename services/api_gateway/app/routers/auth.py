from fastapi import APIRouter, HTTPException, status
import httpx
from app.config import get_settings
from app.schemas.auth import LoginRequest
# from app.utils.auth import create_access_token

settings = get_settings()
router = APIRouter()

@router.post("/login")
async def login_gateway(request: LoginRequest):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.USER_SERVICE_URL}/auth/login",
            json={"email": request.email, "password": request.password}
        )
        if response.status_code != 200:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        tokens = response.json()
        return tokens