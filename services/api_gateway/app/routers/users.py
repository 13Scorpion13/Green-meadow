from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user, get_token_from_header
from app.services.user_service import (
    get_user_profile_from_user_service,
    get_developer_profile_from_user_service
)
from app.schemas.user import UserWithDeveloper

router = APIRouter()

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

# @router.get("/{user_id}")
# async def get_user_profile_endpoint(
#     user_id: str,
#     current_user: dict = Depends(get_current_user)
# ):
#     if current_user["user_id"] != user_id and current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Access denied")

#     user_data = await get_user_profile(user_id)
#     return user_data