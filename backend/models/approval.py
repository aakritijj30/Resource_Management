import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database.connection import Base
from datetime import datetime


class ApprovalDecisionEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Approval(Base):
    __tablename__ = "approvals"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    decision = Column(Enum(ApprovalDecisionEnum), nullable=False, default=ApprovalDecisionEnum.pending)
    comment = Column(Text, nullable=True)
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="approval")
    manager = relationship("User", back_populates="approvals", foreign_keys=[manager_id])
