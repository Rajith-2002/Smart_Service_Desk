from pydantic import BaseModel
from typing import Optional


# 🎫 CREATE REQUEST (Customer sends)
class TicketCreate(BaseModel):
    subject: str
    description: str


# 📤 RESPONSE (Send to frontend)
class TicketResponse(BaseModel):
    id: int
    ticket_no: str
    subject: str
    description: str
    file_path: Optional[str]
    status: str
    agent_reply: Optional[str]

    class Config:
        from_attributes = True