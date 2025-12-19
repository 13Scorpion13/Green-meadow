from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import users, auth, agents, developers, comments, versions, community

import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()
PROXY_PORT = int(os.getenv("API_GATEWAY_PORT"))

app = FastAPI(title="API Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(auth.router, prefix="", tags=["Authentication"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
app.include_router(developers.router, prefix="/developers", tags=["Developers"])
app.include_router(comments.router, prefix="/agents", tags=["Comments"])
app.include_router(versions.router, prefix="/agents", tags=["Versions"])
app.include_router(community.router, prefix="/contents", tags=["Community"])

@app.get("/")
def root():
    return {"message": "API Gateway"}

if __name__ == "__main__":
    uvicorn.run(app, port=PROXY_PORT)