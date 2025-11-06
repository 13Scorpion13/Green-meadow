from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.utils.auth import get_current_user, get_token_from_header
from app.services.catalog_service import (
    create_agent_in_catalog,
    get_agents_by_user_id_from_catalog_service,
    update_agent_in_catalog_service,
    delete_agent_in_catalog_service,
    get_agents_with_developers_from_catalog_service
)
from app.services.user_service import verify_user_exists
from app.schemas.agent import AgentCreate, AgentRead, AgentUpdate, AgentReadFull

router = APIRouter()

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

@router.get("/", response_model=List[AgentReadFull])
async def get_agents_list(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, le=1000, description="Max number of records to return"),
    category_id: Optional[str] = Query(None, description="Filter by category ID"),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0, description="Minimum average rating"),
    max_price: Optional[float] = Query(None, gt=0, description="Maximum price"),
    search: Optional[str] = Query(None, description="Search in name or description"),
    token: Optional[str] = Depends(get_token_from_header)  # ← может быть None, если эндпоинт публичный
):
    try:
        agents = await get_agents_with_developers_from_catalog_service(
            skip=skip,
            limit=limit,
            category_id=category_id,
            min_rating=min_rating,
            max_price=max_price,
            search=search,
            token=token
        )
        return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}/agents", response_model=list[AgentRead])
async def get_user_agents(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        agents = await get_agents_by_user_id_from_catalog_service(user_id)
        return agents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.patch("/{agent_id}", response_model=AgentRead)
async def update_my_agent(
    agent_id: str,
    agent_update: AgentUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_agent = await update_agent_in_catalog_service(agent_id, agent_update.model_dump(mode='json'), token)
        return updated_agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{agent_id}")
async def delete_my_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        result = await delete_agent_in_catalog_service(agent_id, token)
        return result
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