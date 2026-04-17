from pydantic import BaseModel, EmailStr
from datetime import date, datetime


class AgentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str | None = None
    address: str | None = None
    date_of_birth: date | None = None
    department: str   # NEW


class AgentResponse(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool

    phone: str | None
    address: str | None
    date_of_birth: date | None
    joined_date: datetime | None
    department: str   # NEW

    model_config = {
        "from_attributes": True
    }