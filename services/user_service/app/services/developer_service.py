from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.developer import Developer
from app.models.user import User
from app.schemas.developer import DeveloperCreate, DeveloperUpdate, DeveloperOut
from app.utils.cache import (
    get_developer_from_cache,
    set_developer_in_cache,
    delete_developer_from_cache
)
from typing import Optional

async def get_developer_by_user_id(db: AsyncSession, user_id: str) -> Optional[DeveloperOut]:
    cached_dev = await get_developer_from_cache(user_id)
    if cached_dev:
        return DeveloperOut.model_validate(cached_dev)
    
    result = await db.execute(select(Developer).where(Developer.user_id == user_id))
    dev = result.scalar_one_or_none()
    if not dev:
        return None
    
    dev_out = DeveloperOut.model_validate(dev)
    
    await set_developer_in_cache(user_id, dev_out.model_dump(mode='json'))
    
    return dev

async def create_developer(db: AsyncSession, user_id: str, dev_in: DeveloperCreate) -> Developer:
    existing = await get_developer_by_user_id(db, user_id)
    if existing:
        raise ValueError("Developer profile already exists")
    
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user or user.role not in ["user", "creator"]:
        raise ValueError("Only users with role 'user' or 'creator' can become developers")

    db_dev = Developer(
        user_id=user_id,
        **dev_in.model_dump()
    )
    db.add(db_dev)
    await db.commit()
    await db.refresh(db_dev)
    
    await delete_developer_from_cache(user_id)
    
    return db_dev

async def update_developer(db: AsyncSession, user_id: str, dev_update: DeveloperUpdate) -> Optional[Developer]:
    db_dev = await get_developer_by_user_id(db, user_id)
    if not db_dev:
        return None

    update_data = dev_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dev, key, value)

    await db.commit()
    await db.refresh(db_dev)
    
    await delete_developer_from_cache(user_id)
    
    return db_dev

async def delete_developer(db: AsyncSession, user_id: str) -> bool:
    db_dev = await get_developer_by_user_id(db, user_id)
    if not db_dev:
        return False

    await db.delete(db_dev)
    await db.commit()
    
    await delete_developer_from_cache(user_id)
    
    return True