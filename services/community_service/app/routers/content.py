from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.content import Content
from app.models.content_type import ContentType
from app.schemas.content import ContentCreate, ContentUpdate, ContentRead, ContentReadFull


async def get_content_or_404(db: Session, content_id: UUID) -> Content:
    stmt = select(Content).where(Content.id == content_id)
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    return content


router = APIRouter(prefix="/contents", tags=["contents"])


@router.post("/", response_model=ContentRead, status_code=status.HTTP_201_CREATED)
async def create_content(content_in: ContentCreate, db: Session = Depends(get_db)):
    # Проверка существования content_type
    stmt = select(ContentType.id).where(ContentType.id == content_in.content_type_id)
    result = await db.execute(stmt)
    content_type_exists = result.scalar_one_or_none()
    if not content_type_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content type not found"
        )

    db_content = Content(**content_in.dict())
    db.add(db_content)
    try:
        await db.commit()
        await db.refresh(db_content)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data integrity error (e.g., invalid content_type_id)"
        ) from e

    return db_content


@router.get("/{content_id}", response_model=ContentReadFull)
async def read_content(content_id: UUID, db: Session = Depends(get_db)):
    result = await get_content_or_404(db, content_id)
    return result


@router.get("/", response_model=list[ContentRead])
async def read_contents(
    skip: int = 0,
    limit: int = 100,
    content_type_id: int | None = None,
    user_id: UUID | None = None,
    db: Session = Depends(get_db)
):
    stmt = select(Content)

    if content_type_id is not None:
        stmt = stmt.where(Content.content_type_id == content_type_id)
    if user_id is not None:
        stmt = stmt.where(Content.user_id == user_id)

    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    contents = result.scalars().all()
    return contents


@router.put("/{content_id}", response_model=ContentRead)
async def update_content(
    content_id: UUID,
    content_in: ContentUpdate,
    db: Session = Depends(get_db)
):
    db_content = get_content_or_404(db, content_id)

    update_data = content_in.dict(exclude_unset=True)

    if "content_type_id" in update_data:  # ✅ Исправлено: было update_
        stmt = select(ContentType.id).where(ContentType.id == update_data["content_type_id"])
        exists = await db.execute(stmt).scalar_one_or_none()
        if not exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Content type not found"
            )

    for field, value in update_data.items():
        setattr(db_content, field, value)

    try:
        db.commit()
        db.refresh(db_content)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data integrity error during update"
        ) from e

    return db_content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(content_id: UUID, db: Session = Depends(get_db)):
    db_content = await get_content_or_404(db, content_id)
    db.delete(db_content)
    db.commit()
    return