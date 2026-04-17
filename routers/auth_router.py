from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from schemas.user_schema import RegisterSchema, LoginSchema
from services.auth_service import (
    hash_password,
    verify_password,
    register_customer
)

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
# CUSTOMER REGISTRATION
# --------------------

import re
from fastapi import HTTPException

@router.post("/register")
def register_user(data: RegisterSchema, db: Session = Depends(get_db)):
    # ---------------------------
    # 🔥 EXISTING USER CHECK
    # ---------------------------
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # ---------------------------
    # 🔥 NAME VALIDATION
    # ---------------------------
    if not data.name.strip():
        raise HTTPException(400, "Name is required")

    if data.name.startswith(" "):
        raise HTTPException(400, "Name should not start with space")

    if not re.match(r"^[A-Za-z ]+$", data.name):
        raise HTTPException(400, "Name must contain only letters")

    if data.name.strip().isdigit():
        raise HTTPException(400, "Name cannot be number")

    if len(data.name.strip()) < 3:
        raise HTTPException(400, "Name must be at least 3 characters")


    # ---------------------------
    # 🔥 EMAIL VALIDATION
    # ---------------------------
    if not data.email.strip():
        raise HTTPException(400, "Email is required")

    if re.match(r"^[0-9]", data.email):
        raise HTTPException(400, "Email should not start with number")

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", data.email):
        raise HTTPException(400, "Invalid email format")


    # ---------------------------
    # 🔥 PASSWORD VALIDATION
    # ---------------------------
    if not data.password:
        raise HTTPException(400, "Password is required")

    if data.password.startswith(" "):
        raise HTTPException(400, "Password should not start with space")

    if len(data.password.strip()) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")


    


    # ---------------------------
    # ✅ CREATE USER
    # ---------------------------
    user = register_customer(
        db=db,
        name=data.name,
        email=data.email,
        password=data.password
    )

    return {
        "message": "Registration successful",
        "role": user.role,
        "id": user.id,
    }

# --------------------
# COMMON LOGIN
# --------------------

@router.post("/login")
def login_user(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ NEW CHECK (IMPORTANT)
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User is disabled")

    return {
        "message": "Login success",
        "role": user.role,
        "id": user.id
    }
