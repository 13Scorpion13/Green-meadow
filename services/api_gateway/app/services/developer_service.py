import httpx
from app.config import get_settings

settings = get_settings()

async def create_developer_profile_in_user_service(dev_data: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/developers/",
                json=dev_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise Exception("Developer profile already exists")
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

async def update_developer_profile_in_user_service(dev_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{settings.USER_SERVICE_URL}/developers/me",
                json=dev_update,
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

async def delete_developer_profile_in_user_service(token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
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