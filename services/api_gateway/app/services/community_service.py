import httpx
from app.config import get_settings

settings = get_settings()

async def create_content_in_community_service(content_data: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.COMMUNITY_SERVICE_URL}/contents/",
                json=content_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise Exception("Content type not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def get_content_by_id_from_community_service(content_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.COMMUNITY_SERVICE_URL}/contents/{content_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Content not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def get_contents_from_community_service(skip: int, limit: int, content_type_id: int | None, user_id: str | None, token: str) -> list[dict]:
    try:
        async with httpx.AsyncClient() as client:
            params = {"skip": skip, "limit": limit}
            if content_type_id:
                params["content_type_id"] = content_type_id
            if user_id:
                params["user_id"] = user_id

            response = await client.get(
                f"{settings.COMMUNITY_SERVICE_URL}/contents/",
                params=params,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")
    
async def get_discussions_by_agent_id_from_community_service(agent_id: str, token: str) -> list[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.COMMUNITY_SERVICE_URL}/contents/",
                params={
                    "agent_id": agent_id,
                    "content_type_name": "discussion"
                },
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def update_content_in_community_service(content_id: str, content_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{settings.COMMUNITY_SERVICE_URL}/contents/{content_id}",
                json=content_update,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Content not found")
        if e.response.status_code == 400:
            raise Exception("Content type not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def delete_content_in_community_service(content_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.COMMUNITY_SERVICE_URL}/contents/{content_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Content not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def create_comment_in_community_service(comment_data: dict, content_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.COMMUNITY_SERVICE_URL}/comments/?content_id={content_id}",
                json=comment_data,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 400:
            raise Exception("Referenced content or parent comment not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def get_comments_by_content_id_from_community_service(content_id: str, token: str) -> list[dict]:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.COMMUNITY_SERVICE_URL}/comments/",
                params={"content_id": content_id},
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def update_comment_in_community_service(comment_id: str, comment_update: dict, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{settings.COMMUNITY_SERVICE_URL}/comments/{comment_id}",
                json=comment_update,
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Comment not found")
        if e.response.status_code == 400:
            raise Exception("Parent comment not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")

async def delete_comment_in_community_service(comment_id: str, token: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{settings.COMMUNITY_SERVICE_URL}/comments/{comment_id}",
                headers={"Authorization": f"Bearer {token}"}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            raise Exception("Comment not found")
        raise Exception(f"Community Service error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        raise Exception(f"Community Service connection error: {str(e)}")