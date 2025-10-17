from sqlalchemy.ext.asyncio import AsyncSession
from app.models.organization import OrganizationProfile
from app.schemas.organization import OrganizationProfileCreate

async def create_organization_profile(
    db: AsyncSession,
    user_id: str,
    profile_in: OrganizationProfileCreate
):
    db_profile = OrganizationProfile(
        user_id=user_id,
        **profile_in.model_dump()
    )
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile