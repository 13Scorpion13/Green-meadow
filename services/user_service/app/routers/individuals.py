from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.individual import IndividualProfile
from app.schemas.individual import IndividualProfileOut

router = APIRouter()

@router.get("/me", response_model=IndividualProfileOut)
async def get_my_profile(
    user_id: str,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(IndividualProfile).where(IndividualProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile