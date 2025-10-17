from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.provider import ProviderCreate, ProviderOut
from app.services.provider_service import create_provider

router = APIRouter()

@router.post("/", response_model=ProviderOut, status_code=status.HTTP_201_CREATED)
async def become_provider(
    user_id: str,  # из токена
    provider_in: ProviderCreate,
    db: AsyncSession = Depends(get_db)
):
    try:
        provider = await create_provider(db, user_id, provider_in)
        return provider
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))