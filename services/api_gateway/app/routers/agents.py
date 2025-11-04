from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user
from app.services.catalog_service import create_agent_in_catalog, get_agent_by_id
from app.services.user_service import verify_user_exists, get_user_profile
from app.schemas.agent import AgentCreate

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.post("/", response_model=dict)  # Пока используем dict, можно типизировать позже
async def create_agent(agent: AgentCreate, current_user: dict = Depends(get_current_user)):
    # 1. Проверить, что пользователь существует
    user_exists = await verify_user_exists(str(agent.user_id))
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found in User Service")

    # 2. Проверить, что текущий пользователь — владелец или админ
    if current_user["user_id"] != str(agent.user_id) and current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create agent for this user")

    # 3. Передать данные в Catalog Service
    try:
        agent_data = agent.model_dump(mode='json')
        created_agent = await create_agent_in_catalog(agent_data)
        return created_agent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{agent_id}")
async def get_agent(agent_id: str, current_user: dict = Depends(get_current_user)):
    try:
        agent_data = await get_agent_by_id(agent_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    user_id = agent_data.get("user_id")
    if user_id:
        try:
            user_info = await get_user_profile(user_id)
            agent_data["developer"] = {
                "first_name": user_info.get("first_name"),
                "last_name": user_info.get("last_name"),
                "github_profile": user_info.get("github_profile")
            }
        except Exception:
            # Если User Service недоступен — просто не добавляем developer
            agent_data["developer"] = None

    return agent_data