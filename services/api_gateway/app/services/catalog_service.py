import httpx
from app.config import get_settings

settings = get_settings()

async def create_agent_in_catalog(agent_data: dict) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{settings.CATALOG_SERVICE_URL}/agents/", json=agent_data)
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def get_agent_by_id(agent_id: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{settings.CATALOG_SERVICE_URL}/agents/{agent_id}")
            response.raise_for_status()
            return response.json()
    except Exception as e:
        raise Exception(f"Catalog Service error: {str(e)}")