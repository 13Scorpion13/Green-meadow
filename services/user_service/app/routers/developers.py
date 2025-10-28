from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.developer import DeveloperCreate, DeveloperOut
from app.services.developer_service import create_developer

router = APIRouter()

@router.post("/", response_model=DeveloperOut, status_code=status.HTTP_201_CREATED)
async def become_developer(
    dev_in: DeveloperCreate,
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        dev = await create_developer(db, user_id, dev_in)
        return dev
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))