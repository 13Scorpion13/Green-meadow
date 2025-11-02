from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.routers.agent import router as agent_router
from app.routers.version import router as version_router
from app.routers.category import router as category_router
from app.routers.comment import router as comment_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent_router)
app.include_router(version_router)
app.include_router(category_router)
app.include_router(comment_router)