import httpx
from app.config import get_settings

settings = get_settings()

async def get_user_profile(user_id: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.USER_SERVICE_URL}/users/{user_id}")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise Exception(f"User Service error: {str(e)}")