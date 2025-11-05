from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user, get_token_from_header
from app.services.catalog_service import create_agent_in_catalog, get_agent_by_id
from app.services.user_service import verify_user_exists
from app.schemas.agent import AgentCreate

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.post("/", response_model=dict)
async def create_agent(
    agent: AgentCreate,
    # current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    agent_data = agent.model_dump(mode='json')
    
    try:
        created_agent = await create_agent_in_catalog(agent_data, token)
        return created_agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.get("/{agent_id}")
# async def get_agent(agent_id: str, current_user: dict = Depends(get_current_user)):
#     try:
#         agent_data = await get_agent_by_id(agent_id)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

#     user_id = agent_data.get("user_id")
#     if user_id:
#         try:
#             user_info = await get_user_profile(user_id)
#             agent_data["developer"] = {
#                 "first_name": user_info.get("first_name"),
#                 "last_name": user_info.get("last_name"),
#                 "github_profile": user_info.get("github_profile")
#             }
#         except Exception:
#             agent_data["developer"] = None

#     return agent_data