import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.connection import Base
from utils.timezone import now_local_naive


class ResourceTypeEnum(str, enum.Enum):
    conference_room = "conference_room"
    equipment = "equipment"
    vehicle = "vehicle"
    lab = "lab"
    other = "other"


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    type = Column(Enum(ResourceTypeEnum), nullable=False, default=ResourceTypeEnum.other)
    capacity = Column(Integer, nullable=False, default=1)
    location = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    approval_required = Column(Boolean, default=False)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_local_naive)
    # NULL = shared/common resource visible to all; set to dept id for dept-specific
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)

    department = relationship("Department", backref="resources", foreign_keys=[department_id])
    policy = relationship("ResourcePolicy", back_populates="resource", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="resource")
    maintenance_blocks = relationship("MaintenanceBlock", back_populates="resource", cascade="all, delete-orphan")
