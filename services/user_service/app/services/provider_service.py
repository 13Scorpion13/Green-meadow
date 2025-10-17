from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.provider import Provider
from app.models.user import User
from app.schemas.provider import ProviderCreate

async def create_provider(
    db: AsyncSession,
    user_id: str,
    provider_in: ProviderCreate
):
    # Проверка: пользователь существует и не является провайдером
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")

    if user.role == "provider":
        raise ValueError("User is already a provider")

    db_provider = Provider(
        user_id=user_id,
        **provider_in.model_dump()
    )
    user.role = "provider"
    db.add(db_provider)
    await db.commit()
    await db.refresh(db_provider)
    return db_provider