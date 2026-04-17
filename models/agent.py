from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class AgentProfile(Base):
    __tablename__ = "agent_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False
    )

    phone = Column(String(15))
    address = Column(String(255))
    date_of_birth = Column(Date)

    department = Column(String(50), nullable=False)   # NEW FIELD

    joined_date = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="agent_profile",
        passive_deletes=True
    )