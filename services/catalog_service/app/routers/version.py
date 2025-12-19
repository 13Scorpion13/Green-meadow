import os
import shutil
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import select
from tempfile import NamedTemporaryFile
from ..schemas.version import VersionCreate, VersionUpdate, VersionRead
from ..models.version import Version, VersionStatusEnum
from ..models.agent import Agent
from ..database import get_db
import uuid
from uuid import UUID as UUIDType
from ..utils.auth import get_current_user

router = APIRouter(prefix="/versions", tags=["versions"])

UPLOAD_ROOT = Path("/app/uploads")
ARCHIVE_DIR = UPLOAD_ROOT / "archives"
ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

PUBLIC_UPLOAD_BASE_URL = os.getenv("PUBLIC_UPLOAD_BASE_URL", "/uploads")

@router.post("/{agent_id}/versions/", response_model=VersionRead)
async def create_version_with_archive(
    agent_id: uuid.UUID,
    version: str = Form(...),
    changelog: Optional[str] = Form(None),
    status: str = Form(...),
    project_path: Optional[str] = Form(None),
    archive: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    try:
        status_enum = VersionStatusEnum(status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status: {status}. Allowed: {list(VersionStatusEnum)}"
        )

    final_project_path = project_path

    if archive:
        if archive.content_type not in [
            "application/zip",
            "application/x-zip-compressed",
            "application/x-tar",
            "application/gzip",
            "application/x-gzip",
        ] and not archive.filename.lower().endswith(('.zip', '.tar', '.gz', '.tar.gz')):
            raise HTTPException(
                status_code=400,
                detail="Поддерживаются только .zip, .tar, .gz архивы"
            )

        ext = Path(archive.filename or "archive.zip").suffix.lower()
        safe_filename = f"{uuid.uuid4()}{ext}"
        file_abs_path = ARCHIVE_DIR / safe_filename

        try:
            with NamedTemporaryFile(delete=False) as tmp:
                shutil.copyfileobj(archive.file, tmp)
                tmp_path = Path(tmp.name)
            shutil.move(str(tmp_path), file_abs_path)
        except Exception as e:
            if tmp_path.exists():
                tmp_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка сохранения архива: {str(e)}"
            )
        finally:
            await archive.close()
        final_project_path = f"{PUBLIC_UPLOAD_BASE_URL}/archives/{safe_filename}"

    version_in = VersionCreate(
        agent_id=agent_id,
        version=version,
        changelog=changelog,
        status=status_enum,
        project_path=final_project_path,
    )

    db_version = Version(**version_in.model_dump())
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


@router.get("/archive/{agent_id}/project-path")
async def get_latest_archive_project_path(
    agent_id: str,
    db: AsyncSession = Depends(get_db)
):
    try:
        agent_uuid = UUIDType(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent_id format. Must be a valid UUID."
        )

    stmt = (
        select(Version.project_path)
        .where(Version.agent_id == agent_uuid)
        .order_by(Version.created_at.desc())
        .limit(1)
    )

    result = await db.execute(stmt)
    project_path = result.scalar_one_or_none()

    if project_path is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No archive with a project_path found for this agent"
        )

    return {"project_path": project_path}


UPLOAD_DIR = Path("uploads/archives")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/{agent_id}/versions/", response_model=VersionRead)
async def create_version(
    agent_id: uuid.UUID,
    version: str = Form(...),
    changelog: Optional[str] = Form(None),
    status: VersionStatusEnum = Form(...),
    project_path: Optional[str] = Form(None),
    archive: Optional[UploadFile] = File(None),  # ← файл
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Сохраняем файл, если загружен
    saved_archive_path = project_path  # fallback — внешняя ссылка

    if archive:
        if archive.content_type not in [
            'application/zip',
            'application/x-zip-compressed',
            'application/x-tar',
            'application/gzip'
        ]:
            raise HTTPException(400, "Неподдерживаемый тип файла")

        # Генерируем безопасное имя: agent_id + timestamp + расширение
        ext = Path(archive.filename).suffix if archive.filename else ".zip"
        filename = f"{agent_id}{ext}"
        file_path = UPLOAD_DIR / filename

        try:
            with open(file_path, "wb") as f:
                shutil.copyfileobj(archive.file, f)
            saved_archive_path = f"/uploads/archives/{filename}"  # путь для БД
        except Exception as e:
            raise HTTPException(500, f"Ошибка сохранения файла: {str(e)}")
        finally:
            archive.file.close()

    # Создаём запись в БД
    db_version = Version(
        agent_id=agent_id,
        version=version,
        changelog=changelog,
        status=status,
        project_path=saved_archive_path  # ← сохраняем путь к архиву/ссылке
    )
    db.add(db_version)
    await db.commit()
    await db.refresh(db_version)
    return db_version