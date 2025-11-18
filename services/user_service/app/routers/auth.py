from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.user import User
from uuid import UUID
from app.schemas.auth import LoginRequest, Token
from app.services.auth_service import login_user, refresh_user_token, logout_user
from app.dependencies.auth import get_current_user
from app.utils.auth import generate_reset_token, store_reset_token, verify_reset_token, delete_reset_token
from app.utils.password import get_password_hash
from app.schemas.auth import ForgotPasswordRequest, ResetPasswordRequest
from app.utils.email import send_password_reset_email

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        tokens = await login_user(db, login_data)
        return tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
        
@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
async def forgot_password(
    forgot_request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == forgot_request.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        return

    reset_token = generate_reset_token(user.id)

    await store_reset_token(user.id, reset_token)

    try:
        await send_password_reset_email(user.email, reset_token)
    except Exception:
        pass

    return

@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    reset_request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    user_id_str = await verify_reset_token(reset_request.token)
    if not user_id_str:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    
    try:
        user_id = UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid token")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = get_password_hash(reset_request.new_password)

    await db.commit()

    await delete_reset_token(reset_request.token)

    return
        
@router.post("/refresh", response_model=Token)
async def refresh(refresh_token: str, db: AsyncSession = Depends(get_db)):
    try:
        tokens = await refresh_user_token(db, refresh_token)
        return tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
        
@router.post("/logout")
async def logout(user_id: str = Depends(get_current_user)):
    await logout_user(user_id)
    return {"message": "Successfully logged out"}