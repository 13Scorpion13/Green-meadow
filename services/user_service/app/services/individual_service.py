from sqlalchemy.ext.asyncio import AsyncSession
from app.models.individual import IndividualProfile
from app.schemas.individual import IndividualProfileCreate

async def create_individual_profile(
    db: AsyncSession,
    user_id: str,
    profile_in: IndividualProfileCreate
):
    db_profile = IndividualProfile(
        user_id=user_id,
        **profile_in.model_dump()
    )
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)
    return db_profile