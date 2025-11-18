from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    POSTGRES_DB: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_EXTERNAL_PORT: str
    API_GATEWAY_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    REDIS_URL: str
    REDIS_PASSWORD: str

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    settings = Settings()
    return settings