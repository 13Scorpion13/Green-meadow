from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import users, individuals, organizations, providers

app = FastAPI(
    title="User Service",
    description="Микросервис управления пользователями для маркетплейса AI-агентов",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(individuals.router, prefix="/individuals", tags=["Individuals"])
app.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])
app.include_router(providers.router, prefix="/providers", tags=["Providers"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "user-service"}

@app.on_event("startup")
async def startup():
    pass

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()