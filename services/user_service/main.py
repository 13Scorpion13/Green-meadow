from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models import Base
from app.routers import users, developers, auth

app = FastAPI(
    title="User Service",
    description="Микросервис управления пользователями для площадки по обмену опытом разработки ИИ-агентов",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(developers.router, prefix="/developers", tags=["Developers"])
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "user-service"}

@app.on_event("startup")
async def startup():
    pass

@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()