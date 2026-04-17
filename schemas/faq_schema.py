from pydantic import BaseModel
from datetime import datetime


# =========================================================
# RESPONSE MODEL
# =========================================================
class FAQResponse(BaseModel):
    id: int
    question: str
    answer: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# =========================================================
# CREATE MODEL
# =========================================================
class FAQCreate(BaseModel):
    question: str
    answer: str


# =========================================================
# UPDATE MODEL
# =========================================================
class FAQUpdate(BaseModel):
    question: str
    answer: str
    is_active: bool
