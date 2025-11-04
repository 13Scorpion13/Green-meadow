from fastapi import APIRouter, Depends, HTTPException
from app.utils.auth import get_current_user
from app.services.user_service import get_user_profile

router = APIRouter()

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    user_data = await get_user_profile(current_user["user_id"])
    return user_data

@router.get("/{user_id}")
async def get_user_profile_endpoint(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    if current_user["user_id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    user_data = await get_user_profile(user_id)
    return user_data