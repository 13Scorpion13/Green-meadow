from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate,
    UserOut,
    UserUpdate,
    UserFullOut
)
from app.services.user_service import (
    create_user,
    get_user_full,
    update_user,
    delete_user
)

router = APIRouter()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await create_user(db, user_in)
    return user

@router.get("/{user_id}", response_model=UserOut)
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
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

@router.patch("/{user_id}", response_model=UserOut)
async def update_user_info(
    user_id: str,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    try:
        user = await update_user(db, user_id, user_update)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    
@router.delete("/{user_id}")
async def delete_user_info(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        result = await delete_user(db, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))