from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserUpdate,
    UserFullOut,
    ChangePasswordRequest
)
from app.services.user_service import (
    create_user,
    get_user_by_id,
    get_user_full,
    update_user,
    delete_user,
    change_user_password
)
from app.services.developer_service import delete_developer
from app.dependencies.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await create_user(db, user_in)
    return user

@router.post("/change-password")
async def change_password(
    change_password_request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        await change_user_password(
            db,
            str(current_user.id),
            change_password_request.old_password,
            change_password_request.new_password
        )
        return {"message": "Password changed successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/me", response_model=UserOut)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return current_user

@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/full", response_model=UserFullOut)
async def get_user_full_info(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    user = await get_user_full(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/me", response_model=UserOut)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await update_user(db, str(current_user.id), user_update)

@router.patch("/{user_id}", response_model=UserOut)
async def update_user_info(
    user_id: str,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update other users")
    
    try:
        user = await update_user(db, user_id, user_update)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@router.delete("/me")
async def delete_my_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await delete_developer(db, str(current_user.id))
    await delete_user(db, str(current_user.id))
    return {"message": "Account deleted"}    

@router.delete("/{user_id}")
async def delete_user_info(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete other users")
    
    try:
        result = await delete_user(db, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))