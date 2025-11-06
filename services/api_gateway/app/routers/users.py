from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user, get_token_from_header
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import (
    register_user_in_user_service,
    get_user_profile_from_user_service,
    get_other_profile_from_user_service,
    get_developer_profile_from_user_service,
    update_user_profile_in_user_service,
    delete_user_account_in_user_service
)
from app.schemas.user import UserWithDeveloper, UserUpdate

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_new_user(user_in: UserCreate):
    try:
        user = await register_user_in_user_service(user_in.model_dump(mode='json'))
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me", response_model=UserWithDeveloper)
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        user_profile = await get_user_profile_from_user_service(token)
        developer_profile = None
        try:
            dev = await get_developer_profile_from_user_service(token)
            developer_profile = dev
        except Exception:
            developer_profile = None

        return UserWithDeveloper(
            **user_profile,
            developer=developer_profile
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # user_data = await get_user_profile(current_user["user_id"])
    # return user_data

@router.patch("/me")
async def update_my_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_profile = await update_user_profile_in_user_service(user_update.model_dump(mode='json'), token)
        return updated_profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/me")
async def delete_my_account(
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        result = await delete_user_account_in_user_service(token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/profile", response_model=UserWithDeveloper)
async def get_user_profile_by_id(
    request: dict,
    #current_user: dict = Depends(get_current_user)
):
    user_id = request.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")

    try:
        profile = await get_other_profile_from_user_service(user_id)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{user_id}", response_model=UserWithDeveloper)
async def get_user_profile(
    user_id: str
):
    try:
        profile = await get_other_profile_from_user_service(user_id)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))