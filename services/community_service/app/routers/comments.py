from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from app.database import get_db
from app.models.comments import Comment
from app.models.content import Content  # перенесли импорт наверх
from app.schemas.comments import CommentCreate, CommentUpdate, CommentRead, CommentReadFull

router = APIRouter(prefix="/comments", tags=["comments"])


async def get_comment_or_404(db: Session, comment_id: UUID) -> Comment:
    stmt = select(Comment).where(Comment.id == comment_id)
    result = await db.execute(stmt)
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )
    return comment


@router.post("/", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(comment_in: CommentCreate, db: Session = Depends(get_db)):
    # Проверка существования content
    content_stmt = select(Content.id).where(Content.id == comment_in.content_id)
    content_result = await db.execute(content_stmt)
    if content_result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referenced content not found"
        )

    # Проверка parent_comment, если указан
    if comment_in.parent_comment_id:
        parent_stmt = select(Comment.id).where(Comment.id == comment_in.parent_comment_id)
        parent_result = await db.execute(parent_stmt)
        if parent_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment not found"
            )

    db_comment = Comment(**comment_in.dict())
    db.add(db_comment)
    try:
        await db.commit()
        await db.refresh(db_comment)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data integrity error"
        ) from e

    return db_comment


@router.get("/{comment_id}", response_model=CommentReadFull)
async def read_comment(comment_id: UUID, db: Session = Depends(get_db)):
    comment = await get_comment_or_404(db, comment_id)
    return comment


@router.get("/", response_model=list[CommentRead])
async def read_comments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    stmt = select(Comment).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.put("/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: UUID,
    comment_in: CommentUpdate,
    db: Session = Depends(get_db)
):
    db_comment = await get_comment_or_404(db, comment_id)

    update_data = comment_in.dict(exclude_unset=True)

    # Проверка parent_comment при обновлении
    if "parent_comment_id" in update_data and update_data["parent_comment_id"] is not None:
        parent_stmt = select(Comment.id).where(Comment.id == update_data["parent_comment_id"])
        parent_result = await db.execute(parent_stmt)
        if parent_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment not found"
            )

    # Обновление полей
    for field, value in update_data.items():
        setattr(db_comment, field, value)

    try:
        await db.commit()
        await db.refresh(db_comment)
    except IntegrityError as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data integrity error during update"
        ) from e

    return db_comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(comment_id: UUID, db: Session = Depends(get_db)):
    db_comment = await get_comment_or_404(db, comment_id)
    await db.delete(db_comment)
    await db.commit()
    # Ничего не возвращаем для 204