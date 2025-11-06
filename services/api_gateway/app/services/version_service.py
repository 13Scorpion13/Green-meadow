import httpx
from app.config import get_settings

settings = get_settings()

async def create_version_in_catalog_service(version_data: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.CATALOG_SERVICE_URL}/versions/",
                json=version_data,
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

async def get_versions_by_agent_id_from_catalog_service(agent_id: str, token: str) -> list[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/versions/",
                params={"agent_id": agent_id},
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def get_version_by_id_from_catalog_service(version_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/versions/{version_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Version not found")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def update_version_in_catalog_service(version_id: str, version_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{settings.CATALOG_SERVICE_URL}/versions/{version_id}",
                json=version_update,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Version not found")
        if e.response.status_code == 403:
            raise Exception("Not authorized to update this version")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def delete_version_in_catalog_service(version_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.CATALOG_SERVICE_URL}/versions/{version_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Version not found")
        if e.response.status_code == 403:
            raise Exception("Not authorized to delete this version")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")