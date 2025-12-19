from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.routers.comments import router as comments_router
from app.routers.content import router as content_router
from app.routers.content_type import router as content_type_router
from app.config import get_settings

import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()
PROXY_PORT = int(os.getenv("COMMUNITY_SERVICE_PORT"))

settings = get_settings()

app = FastAPI(
    title="User Service",
    description="Микросервис управления пользователями для площадки по обмену опытом разработки ИИ-агентов",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.API_GATEWAY_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(comments_router)
app.include_router(content_router)
app.include_router(content_type_router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "community-service"}

@app.on_event("startup")
async def startup():
    pass

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()

if __name__ == "__main__":
    uvicorn.run(app, port=PROXY_PORT)