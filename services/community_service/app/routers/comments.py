from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_active_user
from app import crud, models, schemas

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.post("/", response_model=schemas.CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    comment_in: schemas.CommentCreate,
):
    # Проверка: существует ли контент?
    content = crud.content.get(db, id=comment_in.content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Проверка: если указан parent_comment_id — существует ли он?
    if comment_in.parent_comment_id:
        parent = crud.comment.get(db, id=comment_in.parent_comment_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        if parent.content_id != comment_in.content_id:
            raise HTTPException(status_code=400, detail="Parent comment belongs to different content")

    comment_data = comment_in.dict()
    comment_data["user_id"] = current_user.id
    comment = crud.comment.create(db, obj_in=comment_data)
    return comment


@router.get("/{comment_id}", response_model=schemas.CommentReadFull)
def read_comment(
    *,
    db: Session = Depends(get_db),
    comment_id: UUID,
):
    comment = crud.comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    return comment


@router.put("/{comment_id}", response_model=schemas.CommentRead)
def update_comment(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    comment_id: UUID,
    comment_in: schemas.CommentUpdate,
):
    comment = crud.comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    comment = crud.comment.update(db, db_obj=comment, obj_in=comment_in)
    return comment


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    *,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    comment_id: UUID,
):
    comment = crud.comment.get(db, id=comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    crud.comment.remove(db, id=comment_id)
    return