from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Query, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from minio import Minio
from minio.error import S3Error
from datetime import timedelta
from uuid import UUID
import os
import secrets
import mimetypes
from app.database import get_db
from app.utils.auth import get_current_user
from app.services.agent_media import create_agent_media, get_agent_media_by_agent_id
from app.schemas.agent_media import AgentMediaResponse, AgentMediaCreate
from app.models.agent import Agent
from app.utils.minio_client import minio_client
from app.config import get_settings

settings = get_settings()

router = APIRouter(prefix="/agents/{agent_id}/media", tags=["agent_media"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-matroska"}
MAX_FILE_SIZE = 50 * 1024 * 1024

def get_minio_client():
    return minio_client

@router.post("/", response_model=AgentMediaResponse)
async def upload_agent_media(
    agent_id: UUID,
    file: UploadFile = File(...),
    is_primary: bool = Form(False),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    minio_client: Minio = Depends(get_minio_client)
):
    agent_result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = agent_result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if str(agent.user_id) != current_user["user_id"] and current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    content_type = file.content_type
    if content_type not in ALLOWED_IMAGE_TYPES and content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    if file.size is None or file.size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large or size unknown")

    media_type = "image" if content_type in ALLOWED_IMAGE_TYPES else "video"

    extension = mimetypes.guess_extension(content_type) or ".bin"
    object_name = f"agents/{agent_id}/{secrets.token_urlsafe(16)}{extension}"

    try:
        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=object_name,
            data=file.file,
            length=file.size,
            content_type=content_type
        )
    except S3Error as e:
        raise HTTPException(status_code=500, detail=f"MinIO upload failed: {str(e)}")
    finally:
        await file.close()

    media_in = {
        "agent_id": agent_id,
        "media_type": media_type,
        "file_path": object_name,
        "is_primary": is_primary
    }
    db_media = await create_agent_media(db, AgentMediaCreate(**media_in))

    return db_media

@router.get("/", response_model=list[AgentMediaResponse])
async def get_agent_media_list(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    media_list = await get_agent_media_by_agent_id(db, agent_id)
    return media_list

@router.get("/signed")
async def get_signed_media_urls(
    agent_id: UUID,
    db: AsyncSession = Depends(get_db),
    minio_client: Minio = Depends(get_minio_client)
):
    agent_result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = agent_result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    media_list = await get_agent_media_by_agent_id(db, agent_id)
    signed_media = []

    for media in media_list:
        try:
            url = minio_client.presigned_get_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=media.file_path,
                expires=timedelta(hours=1)
            )
            signed_media.append({
                "id": str(media.id),
                "type": media.media_type,
                "url": url,
                "is_primary": media.is_primary
            })
        except S3Error as e:
            print(f"Ошибка генерации signed URL для {media.file_path}: {e}")
            continue

    return signed_media