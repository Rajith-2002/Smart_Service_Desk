from passlib.context import CryptContext
from sqlalchemy.orm import Session
from models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# -------------------
# Password helpers
# -------------------

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str):
    return pwd_context.verify(plain, hashed)

# -------------------
# Register customer
# -------------------

def register_customer(
    db: Session,
    name: str,
    email: str,
    password: str
):
    hashed_password = hash_password(password)

    user = User(
        name=name,
        email=email,
        password=hashed_password,
        role="customer"
    )

    db.add(user)
    db.commit()        # 🔥 THIS WAS MISSING
    db.refresh(user)  # 🔥 IMPORTANT

    return user
