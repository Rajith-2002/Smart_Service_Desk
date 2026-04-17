from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal

from models.user import User
from models.agent import AgentProfile

from schemas.agent import AgentCreate, AgentResponse

from datetime import datetime
from typing import List
from services.auth_service import hash_password

router = APIRouter()


# ================= DB SESSION =================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ================= CREATE AGENT =================
@router.post("/agents")
def create_agent(data: AgentCreate, db: Session = Depends(get_db)):

    # 🔍 Check email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        if existing_user.role == "agent":
            raise HTTPException(
                status_code=400,
                detail="Agent with this email already exists"
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=f"This email is already registered as a {existing_user.role}"
            )

    # ================= STEP 1: CREATE USER =================
    new_user = User(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role="agent"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # ================= STEP 2: CREATE AGENT PROFILE =================
    agent_profile = AgentProfile(
        user_id=new_user.id,
        phone=data.phone,
        address=data.address,
        date_of_birth=data.date_of_birth,
        department=data.department,
        joined_date=datetime.utcnow()
    )

    db.add(agent_profile)
    db.commit()

    return {"message": "Agent created successfully"}


# ================= GET ALL AGENTS =================
@router.get("/agents", response_model=List[AgentResponse])
def get_agents(db: Session = Depends(get_db)):

    agents = db.query(User).filter(User.role == "agent").all()

    result = []

    for user in agents:
        profile = user.agent_profile

        result.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_active": user.is_active,
            "phone": profile.phone if profile else None,
            "address": profile.address if profile else None,
            "date_of_birth": profile.date_of_birth if profile else None,
            "joined_date": profile.joined_date if profile else None,
            "department": profile.department if profile else None   # NEW
        })

    return result


@router.delete("/agents/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == agent_id, User.role == "agent").first()

    if not user:
        raise HTTPException(status_code=404, detail="Agent not found")

    db.delete(user)
    db.commit()

    return {"message": "Agent deleted successfully"}


@router.put("/agents/{agent_id}/status")
def toggle_agent_status(agent_id: int, data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == agent_id, User.role == "agent").first()

    if not user:
        raise HTTPException(status_code=404, detail="Agent not found")

    user.is_active = data.get("is_active")

    db.commit()

    return {"message": "Agent status updated successfully"}


@router.put("/agents/{agent_id}")
def update_agent(agent_id: int, data: dict, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == agent_id, User.role == "agent").first()
    profile = db.query(AgentProfile).filter(AgentProfile.user_id == agent_id).first()

    if not user or not profile:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Update user
    user.name = data.get("name", user.name)
    user.email = data.get("email", user.email)

    # Update profile
    profile.phone = data.get("phone", profile.phone)
    profile.address = data.get("address", profile.address)
    profile.date_of_birth = data.get("date_of_birth", profile.date_of_birth)
    profile.department = data.get("department", profile.department)   # NEW

    db.commit()

    return {"message": "Agent updated successfully"}


@router.get("/agents/count")
def get_agent_count(db: Session = Depends(get_db)):
    count = db.query(User).filter(User.role == "agent").count()
    return {"count": count}