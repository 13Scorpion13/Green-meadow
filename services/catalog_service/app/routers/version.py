from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..schemas.version import VersionCreate, VersionUpdate, VersionRead, VersionReadFull
from ..models.version import Version
from ..database import get_db
import uuid

router = APIRouter(prefix="/versions", tags=["versions"])

@router.post("/", response_model=VersionRead)
async def create_version(version: VersionCreate, db: AsyncSession = Depends(get_db)):
    db_version = Version(**version.dict())
    db.add(db_version)
    await db.commit()
    await db.refresh(db_version)
    return db_version

@router.get("/", response_model=List[VersionRead])
async def read_versions(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Version).offset(skip).limit(limit))
    versions = result.scalars().all()
    return versions

@router.get("/{version_id}", response_model=VersionReadFull)
async def read_version(version_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Version).where(Version.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    return version

@router.put("/{version_id}", response_model=VersionRead)
async def update_version(version_id: uuid.UUID, version_update: VersionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Version).where(Version.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    for key, value in version_update.dict(exclude_unset=True).items():
        setattr(version, key, value)
    await db.commit()
    await db.refresh(version)
    return version

@router.delete("/{version_id}", response_model=dict)
async def delete_version(version_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Version).where(Version.id == version_id))
    version = result.scalars().first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")
    await db.delete(version)
    await db.commit()
    return {"ok": True}
