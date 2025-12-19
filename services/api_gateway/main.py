from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth, agents, developers, comments, versions, community

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(developers.router, prefix="/api/developers", tags=["Developers"])
app.include_router(comments.router, prefix="/api/agents", tags=["Comments"])
app.include_router(versions.router, prefix="/api/agents", tags=["Versions"])
app.include_router(community.router, prefix="/api/contents", tags=["Community"])

@app.get("/")
def root():
    return {"message": "API Gateway"}