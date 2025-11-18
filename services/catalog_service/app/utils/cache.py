import json
from typing import Optional, Dict, Any
from app.redis import redis_client

# --- Функции для кэширования агентов ---

async def get_agent_from_cache(agent_id: str) -> Optional[Dict[str, Any]]:
    """
    Получает агента из Redis по agent_id.
    """
    key = f"agent:profile:{agent_id}"
    cached_data = await redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

async def set_agent_in_cache(agent_id: str, agent_data: Dict[str, Any], ttl: int = 600):
    """
    Сохраняет агента в Redis.
    """
    key = f"agent:profile:{agent_id}"
    await redis_client.setex(key, ttl, json.dumps(agent_data, default=str))

async def delete_agent_from_cache(agent_id: str):
    """
    Удаляет агента из Redis.
    """
    key = f"agent:profile:{agent_id}"
    await redis_client.delete(key)

# --- Функции для кэширования списков агентов (если понадобится) ---

async def get_agents_list_from_cache(key: str) -> Optional[Dict[str, Any]]:
    """
    Получает список агентов из Redis по ключу.
    Ключ должен учитывать все параметры (skip, limit, category_id, search...).
    """
    cached_data = await redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

async def set_agents_list_in_cache(key: str, agents_data: Dict[str, Any], ttl: int = 300):
    """
    Сохраняет список агентов в Redis.
    """
    await redis_client.setex(key, ttl, json.dumps(agents_data, default=str))

async def delete_agents_list_from_cache(key: str):
    """
    Удаляет список агентов из Redis.
    """
    await redis_client.delete(key)
    
# --- Функции для кэширования списка агентов пользователя ---
    
async def get_user_agents_from_cache(user_id: str, skip: int, limit: int) -> Optional[Dict[str, Any]]:
    """
    Получает список агентов пользователя из Redis.
    """
    key = f"user_agents:{user_id}:{skip}:{limit}"
    cached_data = await redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

async def set_user_agents_in_cache(user_id: str, skip: int, limit: int, agents_data: Dict[str, Any], ttl: int = 300):  # 5 минут
    """
    Сохраняет список агентов пользователя в Redis.
    """
    key = f"user_agents:{user_id}:{skip}:{limit}"
    await redis_client.setex(key, ttl, json.dumps(agents_data, default=str))

async def delete_user_agents_from_cache(user_id: str, skip: int = None, limit: int = None):
    """
    Удаляет список агентов пользователя из Redis.
    Если skip/limit не указаны — удаляет все списки для user_id.
    """
    if skip is not None and limit is not None:
        key = f"user_agents:{user_id}:{skip}:{limit}"
        await redis_client.delete(key)
    else:
        # Удаляем все списки агентов для user_id (используем паттерн)
        # Это дорого, но иногда нужно
        keys = await redis_client.keys(f"user_agents:{user_id}:*")
        if keys:
            await redis_client.delete(*keys)