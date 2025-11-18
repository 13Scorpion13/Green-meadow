from fastapi import APIRouter, HTTPException, status, Depends
import httpx
from app.config import get_settings
from app.schemas.auth import LoginRequest, ForgotPasswordRequest, ResetPasswordRequest
from app.services.auth_service import (
    forgot_password_in_user_service,
    reset_password_in_user_service
)
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
    
@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
async def forgot_password_request(
    forgot_request: ForgotPasswordRequest
):
    try:
        await forgot_password_in_user_service(forgot_request.email)
    except Exception as e:
        pass
    return 

@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    reset_request: ResetPasswordRequest
):
    try:
        await reset_password_in_user_service(reset_request.token, reset_request.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return