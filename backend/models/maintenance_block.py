from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from database.connection import Base
from datetime import datetime


class MaintenanceBlock(Base):
    __tablename__ = "maintenance_blocks"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    reason = Column(Text, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resource = relationship("Resource", back_populates="maintenance_blocks")
    creator = relationship("User", foreign_keys=[created_by])
