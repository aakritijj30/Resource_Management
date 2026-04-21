import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.connection import Base
from utils.timezone import now_local_naive


class RoleEnum(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"


class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    manager_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=True)
    created_at = Column(DateTime, default=now_local_naive)

    users = relationship("User", back_populates="department", foreign_keys="User.department_id")
    manager = relationship("User", foreign_keys=[manager_id], post_update=True)
