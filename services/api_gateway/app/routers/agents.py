from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from typing import List, Optional
from app.utils.auth import get_current_user, get_token_from_header
from app.services.catalog_service import (
    create_agent_in_catalog,
    upload_media_to_catalog,
    get_agent_media_from_catalog,
    get_signed_media_from_catalog,
    get_agents_by_user_id_from_catalog_service,
    update_agent_in_catalog_service,
    delete_agent_in_catalog_service,
    get_agents_with_developers_from_catalog_service,
    get_user_agents_from_catalog_service,
    get_agent_by_id_from_catalog_service
)
from app.services.community_service import get_discussions_by_agent_id_from_community_service
from app.services.user_service import verify_user_exists
from app.schemas.agent import AgentCreate, AgentRead, AgentUpdate, AgentReadFull
from app.schemas.content import ContentRead

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
    
@router.post("/{agent_id}/media", response_model=dict)
async def upload_agent_media(
    agent_id: str,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    token: str = Depends(get_token_from_header)
):
    try:
        media_response = await upload_media_to_catalog(
            agent_id=agent_id,
            file=file,
            is_primary=is_primary,
            token=token
        )
        return media_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{agent_id}/media", response_model=list)
async def get_agent_media(
    agent_id: str,
    token: str = Depends(get_token_from_header)
):
    try:
        media_list = await get_agent_media_from_catalog(agent_id, token)
        return media_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{agent_id}/media/signed")
async def get_signed_media_urls(
    agent_id: str,
    token: str = Depends(get_token_from_header)
):
    try:
        media_list = await get_signed_media_from_catalog(agent_id, token)
        return media_list
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
    
@router.get("/my", response_model=List[AgentRead])
async def get_my_agents(
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000)
):
    try:
        agents = await get_user_agents_from_catalog_service(
            user_id=str(current_user["user_id"]),
            token=token,
            skip=skip,
            limit=limit
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
    
@router.get("/{agent_id}", response_model=AgentReadFull)
async def get_agent_details(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        agent = await get_agent_by_id_from_catalog_service(agent_id, token)
        return agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/{agent_id}/discussions", response_model=list[ContentRead])
async def get_agent_discussions(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        discussions = await get_discussions_by_agent_id_from_community_service(agent_id, token)
        return discussions
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