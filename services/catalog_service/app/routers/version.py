from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..schemas.version import VersionCreate, VersionUpdate, VersionRead, VersionReadFull
from ..models.version import Version
from ..models.agent import Agent
from ..database import get_db
import uuid
from ..utils.auth import get_current_user

router = APIRouter(prefix="/versions", tags=["versions"])

@router.post("/", response_model=VersionRead)
async def create_version(
    version_create: VersionCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    agent_id = version_create.agent_id

    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create version for this agent")

    db_version = Version(**version_create.dict())
    db.add(db_version)
    await db.commit()
    await db.refresh(db_version)
    return db_version

@router.get("/", response_model=list[VersionRead])
async def get_versions(
    agent_id: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Version)
    if agent_id:
        query = query.where(Version.agent_id == agent_id)
    result = await db.execute(query.offset(skip).limit(limit))
    versions = result.scalars().all()
    return versions

@router.get("/{version_id}", response_model=VersionRead)
async def get_version(
    version_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Version).where(Version.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version


@router.put("/{version_id}", response_model=VersionRead)
async def update_version(
    version_id: uuid.UUID,
    version_update: VersionUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Version).where(Version.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    stmt = select(Agent).where(Agent.id == version.agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this version")

    for key, value in version_update.dict(exclude_unset=True).items():
        setattr(version, key, value)

    await db.commit()
    await db.refresh(version)
    return version

@router.delete("/{version_id}", response_model=dict)
async def delete_version(
    version_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Version).where(Version.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    stmt = select(Agent).where(Agent.id == version.agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this version")

    await db.delete(version)
    await db.commit()
    return {"message": "Version deleted"}
