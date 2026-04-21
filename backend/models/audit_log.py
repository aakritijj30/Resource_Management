import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from database.connection import Base
from utils.timezone import now_local_naive


class AuditActionEnum(str, enum.Enum):
    booking_created = "booking_created"
    booking_cancelled = "booking_cancelled"
    booking_completed = "booking_completed"
    booking_approved = "booking_approved"
    booking_rejected = "booking_rejected"
    booking_auto_approved = "booking_auto_approved"
    resource_created = "resource_created"
    resource_updated = "resource_updated"
    resource_deactivated = "resource_deactivated"
    maintenance_created = "maintenance_created"
    maintenance_deleted = "maintenance_deleted"
    user_login = "user_login"
    user_created = "user_created"
    policy_updated = "policy_updated"


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    action = Column(Enum(AuditActionEnum), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=True)
    detail = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=now_local_naive, nullable=False)

    user = relationship("User", back_populates="audit_logs")
    booking = relationship("Booking", back_populates="audit_logs")
