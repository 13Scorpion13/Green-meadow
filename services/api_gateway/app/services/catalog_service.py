import httpx
from app.config import get_settings
from typing import Dict, Any, Optional, List

settings = get_settings()

async def create_agent_in_catalog(agent_data: dict, token: str) -> Dict[Any, Any]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.CATALOG_SERVICE_URL}/agents/",
                json=agent_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")
    
async def get_user_agents_from_catalog_service(
    user_id: str,
    token: str,
    skip: int = 0,
    limit: int = 100
) -> List[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/agents/my",
                params={
                    "user_id": user_id,
                    "skip": skip,
                    "limit": limit
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")
    
async def get_agents_from_catalog_service(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    token: Optional[str] = None
) -> List[dict]:
    try:
        async with httpx.AsyncClient() as client:
            params = {"skip": skip, "limit": limit}
            if category_id:
                params["category_id"] = category_id
            if min_rating is not None:
                params["min_rating"] = min_rating
            if max_price is not None:
                params["max_price"] = max_price
            if search:
                params["search"] = search

            headers = {}
            if token:
                headers["Authorization"] = f"Bearer {token}"

            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/agents/",
                params=params,
                headers=headers
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")
    
async def get_developer_by_user_id_from_user_service(user_id: str, token: str) -> Optional[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.USER_SERVICE_URL}/developers/{user_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return None
        raise Exception(f"User Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"User Service connection error: {str(e)}")
    
async def get_agents_with_developers_from_catalog_service(
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    token: Optional[str] = None
) -> List[dict]:
    agents = await get_agents_from_catalog_service(skip, limit, category_id, min_rating, max_price, search, token)

    enhanced_agents = []
    for agent in agents:
        user_id = agent["user_id"]
        developer = None
        try:
            dev = await get_developer_by_user_id_from_user_service(user_id, token)
            if dev:
                developer = dev
        except Exception:
            developer = None

        agent["developer"] = developer
        enhanced_agents.append(agent)

    return enhanced_agents

async def get_agents_by_user_id_from_catalog_service(user_id: str) -> list[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/agents/user",
                params={"user_id": user_id}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return []
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def update_agent_in_catalog_service(agent_id: str, agent_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{settings.CATALOG_SERVICE_URL}/agents/{agent_id}",
                json=agent_update,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Agent not found")
        if e.response.status_code == 403:
            raise Exception("Not authorized to update this agent")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")

async def delete_agent_in_catalog_service(agent_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.CATALOG_SERVICE_URL}/agents/{agent_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Agent not found")
        if e.response.status_code == 403:
            raise Exception("Not authorized to delete this agent")
        raise Exception(f"Catalog Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Catalog Service connection error: {str(e)}")
    
async def get_agent_by_id_from_catalog_service(agent_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.CATALOG_SERVICE_URL}/agents/{agent_id}",
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

# async def get_agent_by_id(agent_id: str) -> dict:
#     try:
#         async with httpx.AsyncClient() as client:
#             response = await client.get(f"{settings.CATALOG_SERVICE_URL}/agents/{agent_id}")
#             response.raise_for_status()
#             return response.json()
#     except Exception as e:
#         raise Exception(f"Catalog Service error: {str(e)}")