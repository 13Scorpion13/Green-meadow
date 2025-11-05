import httpx
from app.config import get_settings

settings = get_settings()

async def get_user_profile_from_user_service(token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/users/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("User not found")
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")
    
async def get_developer_profile_from_user_service(token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/developers/me",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Developer profile not found")
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")
# async def get_user_profile(user_id: str) -> dict:
#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.get(f"{settings.USER_SERVICE_URL}/users/{user_id}")
#             response.raise_for_status()
#             return response.json()
#     except Exception as e:
#         raise Exception(f"User Service error: {str(e)}")
    
async def verify_user_exists(user_id: str) -> bool:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.USER_SERVICE_URL}/users/{user_id}")
            return response.status_code == 200
    except Exception:
        return False