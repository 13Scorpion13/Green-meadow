from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.content_type import ContentType
from app.schemas.content_type import ContentTypeBase, ContentTypeRead


router = APIRouter(prefix="/content-types", tags=["content-types"])


async def get_content_type_or_404(db: Session, content_type_id: int) -> ContentType:
    stmt = select(ContentType).where(ContentType.id == content_type_id)
    result = await db.execute(stmt)
    content_type = result.scalar_one_or_none()
    if not content_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content type not found"
        )
    return content_type


@router.get("/", response_model=list[ContentTypeRead])
async def read_content_types(db: Session = Depends(get_db)):
    stmt = select(ContentType)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{content_type_id}", response_model=ContentTypeRead)
async def read_content_type(content_type_id: int, db: Session = Depends(get_db)):
    result = await get_content_type_or_404(db, content_type_id)
    return result