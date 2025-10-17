from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.organization import OrganizationProfile
from app.schemas.organization import OrganizationProfileOut

router = APIRouter()

@router.get("/me", response_model=OrganizationProfileOut)
async def get_my_org_profile(
    user_id: str,  # из токена
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(OrganizationProfile).where(OrganizationProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()
    if not profile:
        raise HTTPException(status_code=404, detail="Organization profile not found")
    return profile