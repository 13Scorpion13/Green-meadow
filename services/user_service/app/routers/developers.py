from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.developer import DeveloperCreate, DeveloperUpdate, DeveloperOut
from app.services.developer_service import (
    get_developer_by_user_id,
    create_developer,
    update_developer,
    delete_developer
)
from app.dependencies.auth import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=DeveloperOut, status_code=status.HTTP_201_CREATED)
async def become_developer(
    dev_in: DeveloperCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role not in ["user", "creator"]:
        raise HTTPException(
            status_code=403,
            detail="Only users with role 'user' or 'creator' can become developers"
        )
        
    try:
        dev = await create_developer(db, str(current_user.id), dev_in)
        return dev
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/me", response_model=DeveloperOut)
async def get_my_developer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    dev = await get_developer_by_user_id(db, str(current_user.id))
    if not dev:
        raise HTTPException(status_code=404, detail="Developer profile not found")
    return dev
    
@router.get("/{user_id}", response_model=DeveloperOut)
async def get_developer_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    dev = await get_developer_by_user_id(db, user_id)
    if not dev:
        raise HTTPException(status_code=404, detail="Developer profile not found")
    return dev
    
@router.patch("/me", response_model=DeveloperOut)
async def update_my_developer_profile(
    dev_update: DeveloperUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    dev = await update_developer(db, str(current_user.id), dev_update)
    if not dev:
        raise HTTPException(status_code=404, detail="Developer profile not found")
    return dev

@router.patch("/{user_id}", response_model=DeveloperOut)
async def update_developer_info(
    user_id: str,
    user_update: DeveloperUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update other developers")
    
    try:
        user = await update_developer(db, user_id, user_update)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/me")
async def delete_my_developer_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    deleted = await delete_developer(db, str(current_user.id))
    if not deleted:
        raise HTTPException(status_code=404, detail="Developer profile not found")
    return {"message": "Developer profile deleted"}

@router.delete("/{user_id}")
async def delete_developer_info(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete other developers")
    
    try:
        result = await delete_developer(db, user_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))