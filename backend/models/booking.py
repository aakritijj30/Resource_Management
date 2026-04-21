import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database.connection import Base
from utils.timezone import now_local_naive


class BookingStatusEnum(str, enum.Enum):
    draft = "draft"
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"
    completed = "completed"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(Text, nullable=False)
    attendees = Column(Integer, default=1)
    status = Column(Enum(BookingStatusEnum), nullable=False, default=BookingStatusEnum.pending)
    created_at = Column(DateTime, default=now_local_naive)
    updated_at = Column(DateTime, default=now_local_naive, onupdate=now_local_naive)

    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    resource = relationship("Resource", back_populates="bookings")
    approval = relationship("Approval", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="booking")
