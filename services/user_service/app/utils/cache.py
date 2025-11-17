import json
from typing import Optional, Dict, Any
from app.redis import redis_client

async def get_user_from_cache(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Получает профиль пользователя из Redis по user_id.
    Возвращает dict (или None, если не найден).
    """
    key = f"user:profile:{user_id}"
    cached_data = await redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

async def set_user_in_cache(user_id: str, user_data: Dict[str, Any], ttl: int = 300):
    """
    Сохраняет профиль пользователя в Redis.
    user_data: dict (Pydantic model .model_dump())
    ttl: время жизни в секундах
    """
    key = f"user:profile:{user_id}"
    await redis_client.setex(key, ttl, json.dumps(user_data))

async def delete_user_from_cache(user_id: str):
    """
    Удаляет профиль пользователя из Redis (например, при обновлении).
    """
    key = f"user:profile:{user_id}"
    await redis_client.delete(key)

async def get_user_full_from_cache(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Получает полный профиль пользователя (с developer_profile) из Redis.
    """
    key = f"user:profile:full:{user_id}"
    cached_data = await redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

async def set_user_full_in_cache(user_id: str, user_data: Dict[str, Any], ttl: int = 600):
    """
    Сохраняет полный профиль пользователя (с developer_profile) в Redis.
    """
    key = f"user:profile:full:{user_id}"
    await redis_client.setex(key, ttl, json.dumps(user_data))

async def delete_user_full_from_cache(user_id: str):
    """
    Удаляет полный профиль пользователя из Redis (например, при обновлении).
    """
    key = f"user:profile:full:{user_id}"
    await redis_client.delete(key)

# --- Функции для кэширования разработчиков ---

async def get_developer_from_cache(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Получает профиль разработчика из Redis по user_id.
    """
    key = f"developer:profile:{user_id}"
    cached_data = await redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

async def set_developer_in_cache(user_id: str, dev_data: Dict[str, Any], ttl: int = 600):
    """
    Сохраняет профиль разработчика в Redis.
    """
    key = f"developer:profile:{user_id}"
    await redis_client.setex(key, ttl, json.dumps(dev_data))

async def delete_developer_from_cache(user_id: str):
    """
    Удаляет профиль разработчика из Redis.
    """
    key = f"developer:profile:{user_id}"
    await redis_client.delete(key)