from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from uuid import UUID

from app.database import get_db
from app.models.content import Content
from app.models.content_type import ContentType
from app.schemas.content import ContentCreate, ContentUpdate, ContentRead, ContentReadFull
from app.utils.auth import get_current_user


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
async def create_content(
    content_in: ContentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = select(ContentType.id).where(ContentType.id == content_in.content_type_id)
    result = await db.execute(stmt)
    content_type_exists = result.scalar_one_or_none()
    if not content_type_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Content type not found"
        )

    db_content = Content(
        **content_in.dict(),
        user_id=current_user["user_id"]
    )
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
async def read_content(
    content_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Content)
        .options(selectinload(Content.content_type))
        .options(selectinload(Content.comments))
        .where(Content.id == content_id)
    )
    result = await db.execute(stmt)
    content = result.scalar_one_or_none()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content


@router.get("/", response_model=list[ContentRead])
async def read_contents(
    skip: int = 0,
    limit: int = 100,
    content_type_id: int | None = None,
    user_id: UUID | None = None,
    current_user: dict = Depends(get_current_user),
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

@router.get("/dis", response_model=list[ContentRead])
async def get_contents_filtered(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    content_type_id: int | None = Query(None, description="Filter by content type ID"),
    user_id: str | None = Query(None, description="Filter by user ID"),
    agent_id: str | None = Query(None, description="Filter by agent ID"),
    content_type_name: str | None = Query(None, description="Filter by content type name (e.g., 'discussion')"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Content)

    if content_type_id is not None:
        query = query.where(Content.content_type_id == content_type_id)

    if content_type_name is not None:
        stmt = select(ContentType.id).where(ContentType.name == content_type_name)
        result = await db.execute(stmt)
        content_type_id_from_name = result.scalar_one_or_none()
        if content_type_id_from_name:
            query = query.where(Content.content_type_id == content_type_id_from_name)
        else:
            return []

    if user_id is not None:
        query = query.where(Content.user_id == user_id)

    if agent_id is not None:
        query = query.where(Content.agent_id == agent_id)

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    contents = result.scalars().all()
    return contents

@router.put("/{content_id}", response_model=ContentRead)
async def update_content(
    content_id: UUID,
    content_in: ContentUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_content = await get_content_or_404(db, content_id)

    if str(db_content.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this content")

    update_data = content_in.dict(exclude_unset=True)

    if "content_type_id" in update_data:
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
async def delete_content(
    content_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_content = await get_content_or_404(db, content_id)

    if str(db_content.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this content")

    db.delete(db_content)
    await db.commit()
    return