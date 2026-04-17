from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from database import Base
from datetime import datetime


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_no = Column(String(20), unique=True, index=True)

    # ✅ FOREIGN KEY ADDED
    user_id = Column(Integer, ForeignKey("users.id"), index=True)

    subject = Column(String(255))
    description = Column(Text)

    file_path = Column(String(255))

    ai_summary = Column(Text)
    category = Column(String(50))
    priority = Column(String(20))

    status = Column(String(20), default="open")
    agent_reply = Column(Text)

    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow)