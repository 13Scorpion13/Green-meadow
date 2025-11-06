from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user, get_token_from_header
from app.schemas.developer import DeveloperCreate, DeveloperUpdate
from app.services.developer_service import (
    create_developer_profile_in_user_service,
    get_developer_profile_from_user_service,
    update_developer_profile_in_user_service,
    delete_developer_profile_in_user_service
)

router = APIRouter()

@router.post("/", status_code=status.HTTP_201_CREATED)
async def become_developer(
    dev_in: DeveloperCreate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        dev_profile = await create_developer_profile_in_user_service(dev_in.model_dump(mode='json'), token)
        return dev_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_my_developer_profile(
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        dev_profile = await get_developer_profile_from_user_service(token)
        return dev_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/me")
async def update_my_developer_profile(
    dev_update: DeveloperUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_profile = await update_developer_profile_in_user_service(dev_update.model_dump(mode='json'), token)
        return updated_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/me")
async def delete_my_developer_profile(
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        result = await delete_developer_profile_in_user_service(token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))