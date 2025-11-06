from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user, get_token_from_header
from app.schemas.comment import CommentCreate, CommentUpdate, CommentRead
from app.services.comment_service import (
    create_comment_in_catalog_service,
    get_comments_by_agent_id_from_catalog_service,
    update_comment_in_catalog_service,
    delete_comment_in_catalog_service
)

router = APIRouter()

@router.post("/{agent_id}/comments", response_model=CommentRead)
async def add_comment_to_agent(
    agent_id: str,
    comment_create: CommentCreate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    comment_data = comment_create.model_dump(mode='json')
    comment_data["agent_id"] = agent_id
    # comment_data["user_id"] = current_user["user_id"]

    try:
        created_comment = await create_comment_in_catalog_service(comment_data, token)
        return created_comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}/comments", response_model=list[CommentRead])
async def get_comments_for_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        comments = await get_comments_by_agent_id_from_catalog_service(agent_id, token)
        return comments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/comments/{comment_id}", response_model=CommentRead)
async def update_my_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_comment = await update_comment_in_catalog_service(comment_id, comment_update.model_dump(mode='json'), token)
        return updated_comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/comments/{comment_id}")
async def delete_my_comment(
    comment_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        result = await delete_comment_in_catalog_service(comment_id, token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))