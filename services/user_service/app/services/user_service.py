from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.user import User
from app.models.developer import Developer
from app.schemas.user import UserCreate, UserUpdate, UserFullOut, UserOut
from app.utils.auth import delete_refresh_token
from app.utils.password import get_password_hash, verify_password
from app.utils.cache import (
    get_user_from_cache,
    set_user_in_cache,
    get_user_full_from_cache,
    set_user_full_in_cache,
    delete_user_full_from_cache,
    delete_user_from_cache
)
from typing import Optional

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()

async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[UserOut]:
    cached_user = await get_user_from_cache(user_id)
    if cached_user:
        return UserOut.model_validate(cached_user)

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        return None

    user_out = UserOut.model_validate(user)

    await set_user_in_cache(user_id, user_out.model_dump(mode='json'))

    return user_out

async def get_user_full(db: AsyncSession, user_id: str) -> Optional[UserFullOut]:
    cached_user = await get_user_full_from_cache(user_id)
    if cached_user:
        developer_data = cached_user.pop("developer", None)
        if developer_data:
            from app.schemas.developer import DeveloperOut
            cached_user["developer"] = DeveloperOut(**developer_data)
        return UserFullOut(**cached_user)
    stmt = (
        select(User)
        .options(
            selectinload(User.developer_profile)
        )
        .where(User.id == user_id)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        return None
    
    user_out = UserFullOut(
        id=user.id,
        email=user.email,
        nickname=user.nickname,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        avatar_url=user.avatar_url,
        developer=user.developer_profile
    )

    await set_user_full_in_cache(user_id, user_out.model_dump(mode='json'))
        
    return user_out

async def create_user(db: AsyncSession, user_in: UserCreate):
    if await get_user_by_email(db, user_in.email):
        raise ValueError("Email already registered")

    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        nickname=user_in.nickname,
        password_hash=hashed_password,
        role=user_in.role,
        is_active=True,
        avatar_url=None
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user(db: AsyncSession, user_id: str, user_update: UserUpdate):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    await db.commit()
    await db.refresh(user)
    
    await delete_user_from_cache(user_id)
    #await delete_user_full_from_cache(user_id)
    
    return user

async def change_user_password(db: AsyncSession, user_id: str, old_password: str, new_password: str):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    if not verify_password(old_password, user.password_hash):
        raise ValueError("Incorrect old password")

    hashed_new_password = get_password_hash(new_password)

    user.password_hash = hashed_new_password
    await db.commit()
    await db.refresh(user)

    await delete_refresh_token(user_id)

    return user

async def delete_user(db: AsyncSession, user_id: str):
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")
    
    await db.delete(user)
    await db.commit()
    
    await delete_user_from_cache(user_id)
    #await delete_user_full_from_cache(user_id)
    
    return {"message": "User deleted"}