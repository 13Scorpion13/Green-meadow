from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..schemas.comment import CommentCreate, CommentUpdate, CommentRead, CommentReadFull
from ..models.comment import Comment
from ..database import get_db
import uuid
from ..utils.auth import get_current_user

router = APIRouter(prefix="/comments", tags=["comments"])

@router.post("/", response_model=CommentRead)
async def create_comment(
    comment_create: CommentCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    comment_data = comment_create.model_dump()
    comment_data["user_id"] = current_user["user_id"]
    
    db_comment = Comment(**comment_data)
    db.add(db_comment)
    await db.commit()
    await db.refresh(db_comment)
    return db_comment

@router.get("/", response_model=List[CommentRead])
async def read_comments(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comment).offset(skip).limit(limit))
    comments = result.scalars().all()
    return comments

@router.get("/{comment_id}", response_model=CommentReadFull)
async def read_comment(comment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment

@router.patch("/{comment_id}", response_model=CommentRead)
async def update_comment(
    comment_id: uuid.UUID,
    comment_update: CommentUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if str(comment.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this comment")
    
    for key, value in comment_update.dict(exclude_unset=True).items():
        setattr(comment, key, value)
        
    await db.commit()
    await db.refresh(comment)
    return comment

@router.delete("/{comment_id}", response_model=dict)
async def delete_comment(
    comment_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    comment = result.scalars().first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if str(comment.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    await db.delete(comment)
    await db.commit()
    return {"ok": True}
