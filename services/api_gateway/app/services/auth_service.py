import httpx
from app.config import get_settings

settings = get_settings()

async def forgot_password_in_user_service(email: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/auth/forgot-password",
                json={"email": email}
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        pass
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")

async def reset_password_in_user_service(token: str, new_password: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/auth/reset-password",
                json={"token": token, "new_password": new_password}
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise ValueError(e.response.json().get("detail", "Invalid or expired token"))
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")