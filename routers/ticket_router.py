from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import SessionLocal
from models.ticket_model import Ticket
from models.user import User
import os
import shutil

router = APIRouter(prefix="/tickets", tags=["Tickets"])


# 🔌 DB Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


from services.ai_service import process_ticket  # 🔥 NEW IMPORT

# 🎫 CREATE TICKET
@router.post("/")
def create_ticket(
    user_id: int = Form(...),
    subject: str = Form(...),
    description: str = Form(...),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    # 🔥 DUPLICATE CHECK
    existing_ticket = db.query(Ticket).filter(
        Ticket.user_id == user_id,
        func.lower(Ticket.subject) == subject.lower()
    ).first()

    if existing_ticket:
        return {
            "error": "You have already raised a ticket with this subject"
        }

    file_path = None
    ai_summary = None
    category = None
    priority = None

    # 📎 File upload
    if file:
        upload_dir = "uploads/tickets"
        os.makedirs(upload_dir, exist_ok=True)

        file_location = f"{upload_dir}/{file.filename}"
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_path = file_location

    # 🤖 AI PROCESSING
    ai_summary, category, priority = process_ticket(
        file_path=file_path,
        subject=subject,
        description=description
    )

    # 🔥 OPTIONAL: normalize category (safety)
    if category:
        category = category.strip().upper()

    # 🎯 Generate ticket number based on department
    prefix_map = {
    "IT": "IT",
    "HR": "HR",
    "FACILITY": "FAC"
}

    prefix = prefix_map.get(category, "GEN")

    last_ticket = db.query(Ticket).filter(
        Ticket.category == category
    ).order_by(Ticket.id.desc()).first()

    if last_ticket:
        last_number = int(last_ticket.ticket_no.split("-")[-1])
        new_number = last_number + 1
    else:
        new_number = 1

    ticket_no = f"{prefix}-{str(new_number).zfill(3)}"

    # 💾 Save ticket
    new_ticket = Ticket(
        ticket_no=ticket_no,
        user_id=user_id,
        subject=subject,
        description=description,
        file_path=file_path,

        # 🔥 AI FIELDS
        ai_summary=ai_summary,
        category=category,
        priority=priority,

        status="open"
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {"message": "Ticket created successfully"}


# 📥 GET MY TICKETS
@router.get("/my")
def get_my_tickets(
    user_id: int = Query(...),
    db: Session = Depends(get_db)
):
    tickets = db.query(Ticket).filter(
        Ticket.user_id == user_id
    ).all()

    return tickets


# 🔍 GET SINGLE TICKET
@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        return None

    user = db.query(User).filter(User.id == ticket.user_id).first()

    data = {c.name: getattr(ticket, c.name) for c in ticket.__table__.columns}
    
    if user:
        data["customer_name"] = user.name
        data["customer_id"] = user.id

    return data