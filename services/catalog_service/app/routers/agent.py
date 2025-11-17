from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from ..schemas.agent import AgentCreate, AgentUpdate, AgentRead, AgentReadFull
from ..models.agent import Agent
from ..database import get_db
from app.utils.auth import get_current_user
import uuid

router = APIRouter(prefix="/agents", tags=["agents"])

@router.post("/", response_model=AgentRead)
async def create_agent(
    agent: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_agent = Agent(
        user_id=current_user["user_id"],
        **agent.model_dump()
    )
    db.add(db_agent)
    await db.commit()
    await db.refresh(db_agent)
    return db_agent

@router.get("/", response_model=list[AgentRead])
async def get_agents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    category_id: Optional[str] = Query(None),
    min_rating: Optional[float] = Query(None, ge=0.0, le=5.0),
    max_price: Optional[float] = Query(None, gt=0),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    query = select(Agent)

    if category_id:
        query = query.where(Agent.category_id == category_id)
    if min_rating is not None:
        query = query.where(Agent.avg_raiting >= min_rating)
    if max_price is not None:
        query = query.where(Agent.price <= max_price)
    if search:
        search_lower = f"%{search.lower()}%"
        query = query.where(
            (Agent.name.ilike(search_lower)) | (Agent.description.ilike(search_lower))
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    agents = result.scalars().all()
    return agents

# @router.get("/", response_model=List[AgentRead])
# async def read_agents(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
#     result = await db.execute(select(Agent).offset(skip).limit(limit))
#     agents = result.scalars().all()
#     return agents

# @router.get("/user", response_model=list[AgentRead])
# async def get_agents(
#     user_id: str = Query(None),
#     #current_user: dict = Depends(get_current_user),  # ← проверяет токен
#     db: AsyncSession = Depends(get_db)
# ):
#     query = select(Agent)
#     if user_id:
#         query = query.where(Agent.user_id == user_id)

#     result = await db.execute(query)
#     agents = result.scalars().all()
#     return agents

@router.get("/my", response_model=list[AgentRead])
async def get_my_agents(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=1000),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Agent).where(Agent.user_id == current_user["user_id"]).offset(skip).limit(limit)
    result = await db.execute(stmt)
    agents = result.scalars().all()
    return agents

@router.get("/{agent_id}", response_model=AgentReadFull)
async def read_agent(agent_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Agent).where(Agent.id == agent_id))
    agent = result.scalars().first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.patch("/{agent_id}", response_model=AgentRead)
async def update_agent(
    agent_id: str,
    agent_update: AgentUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this agent")
    
    for key, value in agent_update.dict(exclude_unset=True).items():
        setattr(agent, key, value)
    await db.commit()
    await db.refresh(agent)
    return agent

@router.delete("/{agent_id}", response_model=dict)
async def delete_agent(
    agent_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Agent).where(Agent.id == agent_id)
    result = await db.execute(stmt)
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if str(agent.user_id) != current_user["user_id"] and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this agent")
    
    await db.delete(agent)
    await db.commit()
    return {"message": "Agent deleted"}
