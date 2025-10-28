from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.developer import Developer
from app.schemas.developer import DeveloperCreate
from typing import Optional

async def get_developer_by_user_id(db: AsyncSession, user_id: str) -> Optional[Developer]:
    result = await db.execute(select(Developer).where(Developer.user_id == user_id))
    return result.scalar_one_or_none()

async def create_developer(db: AsyncSession, user_id: str, dev_in: DeveloperCreate):
    existing = await get_developer_by_user_id(db, user_id)
    if existing:
        raise ValueError("Developer profile already exists")

    db_dev = Developer(
        user_id=user_id,
        **dev_in.model_dump()
    )
    db.add(db_dev)
    await db.commit()
    await db.refresh(db_dev)
    return db_dev