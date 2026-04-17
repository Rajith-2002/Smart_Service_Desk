from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
from datetime import datetime
from sqlalchemy.orm import relationship
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

    is_active = Column(Boolean, default=True)  # ✅ Enable / Disable user
    created_at = Column(DateTime, default=datetime.utcnow)  # ✅ Auto timestamp
    agent_profile = relationship(
    "AgentProfile",
    back_populates="user",
    cascade="all, delete-orphan",  # 🔥 MAIN FIX
    uselist=False
)