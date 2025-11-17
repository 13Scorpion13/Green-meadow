import redis.asyncio as redis
from app.config import get_settings

settings = get_settings()

redis_client = redis.from_url(
    settings.REDIS_URL,
    password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5
)