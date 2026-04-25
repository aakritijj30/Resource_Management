from sqlalchemy import Column, Integer, ForeignKey, Time, Float, Boolean, ARRAY, JSON
from sqlalchemy.orm import relationship
from database.connection import Base


class ResourcePolicy(Base):
    __tablename__ = "resource_policies"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), unique=True, nullable=False)
    max_duration_hours = Column(Float, nullable=False, default=8.0)
    min_duration_hours = Column(Float, nullable=False, default=0.5)
    office_hours_start = Column(Integer, nullable=False, default=9)   # hour 0-23
    office_hours_end = Column(Integer, nullable=False, default=18)    # hour 0-23
    allowed_days = Column(Integer, nullable=False, default=31)  # Mon-Fri (1<<0 | 1<<1 | 1<<2 | 1<<3 | 1<<4)
    require_justification = Column(Boolean, default=False)
    advance_booking_days = Column(Integer, default=30)  # max days ahead
    max_attendees = Column(Integer, nullable=True)
    allowed_department_ids = Column(JSON, nullable=True) # List of dept IDs that can book this

    resource = relationship("Resource", back_populates="policy")
