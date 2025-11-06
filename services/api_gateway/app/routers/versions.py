from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user, get_token_from_header
from app.schemas.version import VersionCreate, VersionUpdate, VersionRead
from app.services.version_service import (
    create_version_in_catalog_service,
    get_versions_by_agent_id_from_catalog_service,
    get_version_by_id_from_catalog_service,
    update_version_in_catalog_service,
    delete_version_in_catalog_service
)

router = APIRouter()

@router.post("/{agent_id}/versions", response_model=VersionRead)
async def add_version_to_agent(
    agent_id: str,
    version_create: VersionCreate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    version_data = version_create.model_dump(mode='json')
    version_data["agent_id"] = agent_id

    try:
        created_version = await create_version_in_catalog_service(version_data, token)
        return created_version
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}/versions", response_model=list[VersionRead])
async def get_versions_for_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        versions = await get_versions_by_agent_id_from_catalog_service(agent_id, token)
        return versions
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/versions/{version_id}", response_model=VersionRead)
async def get_version(
    version_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        version = await get_version_by_id_from_catalog_service(version_id, token)
        return version
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/versions/{version_id}", response_model=VersionRead)
async def update_version(
    version_id: str,
    version_update: VersionUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_version = await update_version_in_catalog_service(version_id, version_update.model_dump(mode='json'), token)
        return updated_version
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/versions/{version_id}")
async def delete_version(
    version_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        result = await delete_version_in_catalog_service(version_id, token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))