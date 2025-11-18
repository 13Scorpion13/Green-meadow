import httpx
from app.config import get_settings

settings = get_settings()

async def register_user_in_user_service(user_data: dict) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/users/",
                json=user_data
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise ValueError(e.response.json().get("detail", "Bad Request"))
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")

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
    
async def get_other_profile_from_user_service(user_id: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/users/{user_id}"
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("User not found")
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")
    
async def change_password_in_user_service(password_change_data: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/users/change-password",
                json=password_change_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise Exception("Old password is incorrect or new password is same as old")
        if e.response.status_code == 404:
            raise Exception("User not found")
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")
    
# async def get_developer_profile_from_user_service(token: str) -> dict:
#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.get(
#                 f"{settings.USER_SERVICE_URL}/developers/me",
#                 headers={"Authorization": f"Bearer {token}"}
#             )
#             response.raise_for_status()
#             return response.json()
#     except httpx.HTTPStatusError as e:
#         if e.response.status_code == 404:
#             raise Exception("Developer profile not found")
#         raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
#     except Exception as e:
#         raise Exception(f"User Service connection error: {str(e)}")
    
async def get_users_nicknames_by_ids_from_user_service(user_ids: list[str], token: str) -> dict[str, str]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.USER_SERVICE_URL}/users/nicknames",
                json={"user_ids": user_ids},
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            data: dict[str, str] = response.json()
            return data
    except httpx.HTTPStatusError as e:
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")
    
async def update_user_profile_in_user_service(user_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{settings.USER_SERVICE_URL}/users/me",
                json=user_update,
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
    
async def delete_user_account_in_user_service(token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
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
    
async def verify_user_exists(user_id: str) -> bool:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.USER_SERVICE_URL}/users/{user_id}")
            return response.status_code == 200
    except Exception:
        return False