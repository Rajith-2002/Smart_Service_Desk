from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal
from models.faq import FAQ
from schemas.faq_schema import FAQResponse, FAQCreate, FAQUpdate


router = APIRouter(tags=["FAQs"])


# -------------------------------
# DB Dependency
# -------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# PUBLIC APIs (HOME PAGE)
# =========================================================

# -------------------------------
# GET: Initial FAQs
# -------------------------------
@router.get("/faqs", response_model=List[FAQResponse])
def get_faqs(db: Session = Depends(get_db)):

    faqs = (
        db.query(FAQ)
        .filter(FAQ.is_active == True)
        .order_by(FAQ.created_at.desc())
        .limit(5)
        .all()
    )

    return faqs


# -------------------------------
# SEARCH FAQs
# -------------------------------
@router.get("/faqs/search", response_model=List[FAQResponse])
def search_faqs(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db)
):

    faqs = (
        db.query(FAQ)
        .filter(FAQ.is_active == True)
        .filter(FAQ.question.ilike(f"%{q}%"))
        .limit(5)
        .all()
    )

    return faqs


# =========================================================
# ADMIN FAQ MANAGEMENT APIs
# =========================================================

# -------------------------------
# GET ALL FAQs (Admin)
# -------------------------------
@router.get("/admin/faqs", response_model=List[FAQResponse])
def get_all_faqs(db: Session = Depends(get_db)):

    return db.query(FAQ).order_by(FAQ.created_at.desc()).all()


# -------------------------------
# GET SINGLE FAQ
# -------------------------------
@router.get("/admin/faqs/{faq_id}", response_model=FAQResponse)
def get_single_faq(faq_id: int, db: Session = Depends(get_db)):

    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()

    if not faq:
        raise HTTPException(404, "FAQ not found")

    return faq


# -------------------------------
# ADD FAQ
# -------------------------------
@router.post("/admin/faqs")
def create_faq(data: FAQCreate, db: Session = Depends(get_db)):

    new_faq = FAQ(
        question=data.question,
        answer=data.answer,
        created_by=1,   # Replace with logged admin later
        is_active=True
    )

    db.add(new_faq)
    db.commit()

    return {"message": "FAQ added successfully"}


# -------------------------------
# UPDATE FAQ + STATUS
# -------------------------------
@router.put("/admin/faqs/{faq_id}")
def update_faq(faq_id: int, data: FAQUpdate, db: Session = Depends(get_db)):

    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()

    if not faq:
        raise HTTPException(404, "FAQ not found")

    old_status = faq.is_active

    faq.question = data.question
    faq.answer = data.answer
    faq.is_active = data.is_active

    db.commit()

    if old_status and not data.is_active:
        msg = "FAQ deactivated successfully"
    elif not old_status and data.is_active:
        msg = "FAQ activated successfully"
    else:
        msg = "FAQ updated successfully"

    return {"message": msg}


# -------------------------------
# DELETE FAQ
# -------------------------------
@router.delete("/admin/faqs/{faq_id}")
def delete_faq(faq_id: int, db: Session = Depends(get_db)):

    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()

    if not faq:
        raise HTTPException(404, "FAQ not found")

    db.delete(faq)
    db.commit()

    return {"message": "FAQ deleted successfully"}

@router.get("/admin/faq-count")
def get_faq_count(db: Session = Depends(get_db)):
    count = db.query(FAQ).count()
    return {"count": count}