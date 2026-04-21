import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, Text
from sqlalchemy.orm import relationship
from database.connection import Base


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
    is_active = Column(Boolean, default=True)

    policy = relationship("ResourcePolicy", back_populates="resource", uselist=False, cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="resource")
    maintenance_blocks = relationship("MaintenanceBlock", back_populates="resource", cascade="all, delete-orphan")
