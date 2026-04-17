from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import SessionLocal
from models.ticket_model import Ticket
from models.agent import AgentProfile
from datetime import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/agent", tags=["Agent Tickets"])


# 🔌 DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------
# 📦 REQUEST SCHEMA
# -----------------------------
class ResponseSchema(BaseModel):
    ticket_id: int
    response: str


# -----------------------------
# ✅ AGENT RESPONSE + CLOSE
# -----------------------------
@router.post("/respond")
def respond_ticket(
    data: ResponseSchema,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == data.ticket_id).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == "closed":
        return {"message": "Ticket already closed"}

    ticket.agent_reply = data.response
    ticket.status = "closed"
    ticket.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Response sent and ticket closed"}


# -----------------------------
# 📊 DASHBOARD STATS
# -----------------------------
@router.get("/stats")
def get_stats(
    agent_id: int = Query(...),
    db: Session = Depends(get_db)
):

    agent_profile = db.query(AgentProfile).filter(
        AgentProfile.user_id == agent_id
    ).first()

    if not agent_profile:
        raise HTTPException(status_code=404, detail="Agent profile not found")

    total = db.query(Ticket).filter(
        Ticket.category == agent_profile.department
    ).count()

    open_count = db.query(Ticket).filter(
        Ticket.category == agent_profile.department,
        Ticket.status == "open"
    ).count()

    closed_count = db.query(Ticket).filter(
        Ticket.category == agent_profile.department,
        Ticket.status == "closed"
    ).count()

    return {
        "total": total,
        "open": open_count,
        "closed": closed_count
    }


# -----------------------------
# 📋 FILTERED TICKETS BY DEPARTMENT
# -----------------------------
@router.get("/tickets")
def get_all_tickets(
    agent_id: int = Query(...),
    db: Session = Depends(get_db)
):

    agent_profile = db.query(AgentProfile).filter(
        AgentProfile.user_id == agent_id
    ).first()

    if not agent_profile:
        raise HTTPException(status_code=404, detail="Agent profile not found")

    tickets = db.query(Ticket).filter(
        Ticket.category == agent_profile.department
    ).order_by(Ticket.created_at.asc()).all()

    result = []

    for t in tickets:
        result.append({
            "id": t.id,
            "ticket_no": t.ticket_no,
            "subject": t.subject,
            "status": t.status,
            "priority": t.priority,
            "time": t.created_at.strftime("%d %b %H:%M") if t.created_at else ""
        })

    return result

# -----------------------------
# 👤 GET AGENT PROFILE (DEPARTMENT)
# -----------------------------
@router.get("/profile")
def get_agent_profile(
    agent_id: int = Query(...),
    db: Session = Depends(get_db)
):

    agent = db.query(AgentProfile).filter(
        AgentProfile.user_id == agent_id
    ).first()

    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return {
        "department": agent.department
    }