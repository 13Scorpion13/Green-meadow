from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user, get_token_from_header
from app.schemas.content import ContentCreate, ContentUpdate, ContentRead
from app.schemas.community_comment import CommentCreate, CommentUpdate, CommentRead
from app.services.community_service import (
    create_content_in_community_service,
    get_content_by_id_from_community_service,
    get_contents_from_community_service,
    update_content_in_community_service,
    delete_content_in_community_service,
    create_comment_in_community_service,
    get_comments_by_content_id_from_community_service,
    update_comment_in_community_service,
    delete_comment_in_community_service
)

router = APIRouter()

@router.post("/", response_model=ContentRead)
async def create_content(
    content_create: ContentCreate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    content_data = content_create.model_dump(mode='json')

    try:
        created_content = await create_content_in_community_service(content_data, token)
        return created_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{content_id}", response_model=ContentRead)
async def get_content(
    content_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        content = await get_content_by_id_from_community_service(content_id, token)
        return content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[ContentRead])
async def get_contents(
    skip: int = 0,
    limit: int = 100,
    content_type_id: int | None = None,
    user_id: str | None = None,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        contents = await get_contents_from_community_service(skip, limit, content_type_id, user_id, token)
        return contents
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{content_id}", response_model=ContentRead)
async def update_content(
    content_id: str,
    content_update: ContentUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_content = await update_content_in_community_service(content_id, content_update.model_dump(mode='json'), token)
        return updated_content
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{content_id}")
async def delete_content(
    content_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        result = await delete_content_in_community_service(content_id, token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{content_id}/comments", response_model=CommentRead)
async def add_comment_to_content(
    content_id: str,
    comment_create: CommentCreate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    comment_data = comment_create.model_dump(mode='json')

    try:
        created_comment = await create_comment_in_community_service(comment_data, content_id, token)
        return created_comment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{content_id}/comments", response_model=list[CommentRead])
async def get_comments_for_content(
    content_id: str,
    #current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        comments = await get_comments_by_content_id_from_community_service(content_id, token)
        return comments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/comments/{comment_id}", response_model=CommentRead)
async def update_my_comment(
    comment_id: str,
    comment_update: CommentUpdate,
    current_user: dict = Depends(get_current_user),
    token: str = Depends(get_token_from_header)
):
    try:
        updated_comment = await update_comment_in_community_service(comment_id, comment_update.model_dump(mode='json'), token)
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
        result = await delete_comment_in_community_service(comment_id, token)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))