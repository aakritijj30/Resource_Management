import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database.connection import Base
from utils.timezone import now_local_naive


class WaitlistStatusEnum(str, enum.Enum):
    active = "active"
    fulfilled = "fulfilled"
    cancelled = "cancelled"
    expired = "expired"


class WaitlistEntry(Base):
    __tablename__ = "waitlist_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    purpose = Column(Text, nullable=False)
    attendees = Column(Integer, nullable=False, default=1)
    status = Column(Enum(WaitlistStatusEnum), nullable=False, default=WaitlistStatusEnum.active)
    created_at = Column(DateTime, default=now_local_naive, nullable=False)
    updated_at = Column(DateTime, default=now_local_naive, onupdate=now_local_naive, nullable=False)

    user = relationship("User", back_populates="waitlist_entries", foreign_keys=[user_id])
    resource = relationship("Resource", back_populates="waitlist_entries", foreign_keys=[resource_id])
    booking = relationship("Booking", foreign_keys=[booking_id])
