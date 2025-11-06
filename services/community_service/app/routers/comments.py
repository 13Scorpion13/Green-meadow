from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from app.database import get_db
from app.models.comments import Comment
from app.models.content import Content
from app.schemas.comments import CommentCreate, CommentUpdate, CommentRead, CommentReadFull
from app.utils.auth import get_current_user

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
async def create_comment(
    comment_in: CommentCreate,
    content_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content_result = await db.execute(select(Content).where(Content.id == content_id))
    content = content_result.scalar_one_or_none()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referenced content not found"
        )

    if comment_in.parent_comment_id:
        parent_result = await db.execute(
            select(Comment).where(Comment.id == comment_in.parent_comment_id)
        )
        if not parent_result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment not found"
            )

    db_comment = Comment(
        **comment_in.dict(),
        user_id=current_user["user_id"],
        content_id=content_id
    )
    db.add(db_comment)
    try:
        await db.commit()
        await db.refresh(db_comment)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data integrity error"
        )

    return db_comment


@router.get("/{comment_id}", response_model=CommentReadFull)
async def read_comment(
    comment_id: UUID,
    #current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comment = await get_comment_or_404(db, comment_id)
    return comment


@router.get("/", response_model=list[CommentRead])
async def read_comments(
    content_id: UUID = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stmt = select(Comment)
    if content_id:
        stmt = stmt.where(Comment.content_id == content_id)
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.put("/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: UUID,
    comment_in: CommentUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_comment = await get_comment_or_404(db, comment_id)

    if str(db_comment.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")

    update_data = comment_in.dict(exclude_unset=True)

    if "parent_comment_id" in update_data and update_data["parent_comment_id"] is not None:
        parent_stmt = select(Comment.id).where(Comment.id == update_data["parent_comment_id"])
        parent_result = await db.execute(parent_stmt)
        if parent_result.scalar_one_or_none() is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent comment not found"
            )

    for field, value in update_data.items():
        setattr(db_comment, field, value)

    try:
        await db.commit()
        await db.refresh(db_comment)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Data integrity error during update"
        ) from e

    return db_comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: UUID,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_comment = await get_comment_or_404(db, comment_id)

    if str(db_comment.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    await db.delete(db_comment)
    await db.commit()
    return