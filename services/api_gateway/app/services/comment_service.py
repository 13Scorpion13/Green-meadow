import httpx
from app.config import get_settings

settings = get_settings()

async def create_comment_in_catalog_service(comment_data: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.CATALOG_SERVICE_URL}/comments/",
                json=comment_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Agent not found")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def get_comments_by_agent_id_from_catalog_service(agent_id: str, token: str) -> list[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/comments/",
                params={"agent_id": agent_id},
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")


async def update_comment_in_catalog_service(comment_id: str, comment_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{settings.CATALOG_SERVICE_URL}/comments/{comment_id}",
                json=comment_update,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Comment not found")
        if e.response.status_code == 403:
            raise Exception("Not authorized to update this comment")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def delete_comment_in_catalog_service(comment_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.CATALOG_SERVICE_URL}/comments/{comment_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Comment not found")
        if e.response.status_code == 403:
            raise Exception("Not authorized to delete this comment")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")