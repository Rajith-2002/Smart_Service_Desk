from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from schemas.user_schema import UserResponseSchema, UserStatusUpdateSchema

router = APIRouter()


# --------------------
# DB Dependency
# --------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --------------------
# GET ALL USERS
# --------------------
@router.get("/users", response_model=list[UserResponseSchema])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.role == "customer").all()
    return users


# --------------------
# ENABLE / DISABLE USER
# --------------------
@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    data: UserStatusUpdateSchema,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = data.is_active
    db.commit()

    return {"message": "User status updated"}