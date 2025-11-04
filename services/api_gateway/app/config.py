from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    USER_SERVICE_URL: str
    CATALOG_SERVICE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()