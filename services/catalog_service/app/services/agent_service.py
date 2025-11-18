# catalog_service/app/services/agent_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from app.models.agent import Agent
from app.schemas.agent import AgentCreate, AgentUpdate, AgentRead, AgentReadFull
from app.utils.cache import (  # 👈 ИМПОРТ
    get_agent_from_cache,
    set_agent_in_cache,
    delete_agent_from_cache,
    get_user_agents_from_cache,
    set_user_agents_in_cache,
    delete_user_agents_from_cache
)
import uuid

# --- Функции для работы с агентами ---

async def create_agent(db: AsyncSession, user_id: str, agent_in: AgentCreate) -> Agent:
    """
    Создаёт новый агент.
    """
    db_agent = Agent(
        user_id=user_id,
        **agent_in.model_dump()
    )
    db.add(db_agent)
    await db.commit()
    await db.refresh(db_agent)
    return db_agent

async def get_agent_by_id(db: AsyncSession, agent_id: uuid.UUID) -> Optional[AgentReadFull]:
    """
    Получает агента по ID с кэшированием.
    """
    agent_id_str = str(agent_id)

    # ✅ Проверяем кэш
    cached_agent = await get_agent_from_cache(agent_id_str)
    if cached_agent:
        return AgentReadFull.model_validate(cached_agent)

    # Читаем из БД
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        return None

    # Преобразуем в схему
    agent_out = AgentReadFull.model_validate(agent)

    # ✅ Кэшируем: сериализуем через model_dump
    await set_agent_in_cache(agent_id_str, agent_out.model_dump(mode='json'))

    return agent_out

async def get_agents_list(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None
) -> List[AgentRead]:
    """
    Получает список агентов с фильтрацией.
    """
    query = select(Agent)

    if category_id:
        query = query.where(Agent.category_id == category_id)
    if min_rating is not None:
        query = query.where(Agent.avg_raiting >= min_rating)
    if max_price is not None:
        query = query.where(Agent.price <= max_price)
    if search:
        search_lower = f"%{search.lower()}%"
        query = query.where(
            (Agent.name.ilike(search_lower)) | (Agent.description.ilike(search_lower))
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    agents_orm = result.scalars().all()

    agents_out = [AgentRead.model_validate(agent) for agent in agents_orm]

    return agents_out

async def get_my_agents(
    db: AsyncSession,
    user_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[AgentRead]:
    # ✅ Проверяем кэш
    cached_agents = await get_user_agents_from_cache(user_id, skip, limit)
    if cached_agents:
        agents_list = cached_agents.get("agents", [])
        return [AgentRead.model_validate(agent_data) for agent_data in agents_list]

    # Читаем из БД
    stmt = select(Agent).where(Agent.user_id == user_id).offset(skip).limit(limit)
    result = await db.execute(stmt)
    agents_orm = result.scalars().all()
    
    agents_out = [AgentRead.model_validate(agent) for agent in agents_orm]

    # ✅ Кэшируем список
    agents_data = [agent.model_dump(mode='json') for agent in agents_out]
    await set_user_agents_in_cache(user_id, skip, limit, {"agents": agents_data})

    return agents_out

async def update_agent(db: AsyncSession, agent_id: str, agent_update: AgentUpdate, current_user: dict) -> Optional[Agent]:
    """
    Обновляет агента. current_user используется для проверки прав.
    """
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        return None

    # Проверяем права (лучше бы это было в роутере, но для простоты оставим тут)
    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise ValueError("Not authorized to update this agent")

    update_data = agent_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(agent, key, value)

    await db.commit()
    await db.refresh(agent)

    # ✅ УДАЛЯЕМ КЭШ: агент обновлён
    await delete_agent_from_cache(agent_id)
    await delete_user_agents_from_cache(current_user["user_id"])

    return agent

async def delete_agent(db: AsyncSession, agent_id: str, current_user: dict) -> bool:
    """
    Удаляет агента. current_user используется для проверки прав.
    """
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        return False

    # Проверяем права (лучше бы это было в роутере, но для простоты оставим тут)
    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise ValueError("Not authorized to delete this agent")

    await db.delete(agent)
    await db.commit()

    # ✅ УДАЛЯЕМ КЭШ: агент удалён
    await delete_agent_from_cache(agent_id)
    await delete_user_agents_from_cache(current_user["user_id"])

    return True