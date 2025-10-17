from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import create_user
from app.services.individual_service import create_individual_profile
from app.services.organization_service import create_organization_profile
from app.schemas.individual import IndividualProfileCreate
from app.schemas.organization import OrganizationProfileCreate

router = APIRouter()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_in: UserCreate,
    profile: IndividualProfileCreate | OrganizationProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await create_user(db, user_in)

    if user_in.type == "individual":
        if not isinstance(profile, IndividualProfileCreate):
            raise HTTPException(status_code=400, detail="Expected individual profile")
        await create_individual_profile(db, str(user.id), profile)
    else:
        if not isinstance(profile, OrganizationProfileCreate):
            raise HTTPException(status_code=400, detail="Expected organization profile")
        await create_organization_profile(db, str(user.id), profile)

    return user