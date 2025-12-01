# crud/agent_media.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from uuid import UUID
from app.models.agent_media import AgentMedia
from app.schemas.agent_media import AgentMediaCreate, AgentMediaUpdate

async def create_agent_media(db: AsyncSession, media: AgentMediaCreate) -> AgentMedia:
    db_media = AgentMedia(**media.model_dump())
    db.add(db_media)
    await db.commit()
    await db.refresh(db_media)
    return db_media

async def get_agent_media_by_agent_id(db: AsyncSession, agent_id: UUID) -> list[AgentMedia]:
    stmt = select(AgentMedia).where(AgentMedia.agent_id == agent_id)
    result = await db.execute(stmt)
    return result.scalars().all()

async def get_agent_media_by_id(db: AsyncSession, media_id: UUID) -> AgentMedia | None:
    stmt = select(AgentMedia).where(AgentMedia.id == media_id)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def delete_agent_media(db: AsyncSession, media_id: UUID) -> bool:
    stmt = delete(AgentMedia).where(AgentMedia.id == media_id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0