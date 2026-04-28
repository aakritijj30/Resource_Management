import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database.connection import Base
from utils.timezone import now_local_naive


class RoleEnum(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.employee)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_local_naive)

    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    bookings = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id")
    approvals = relationship("Approval", back_populates="manager", foreign_keys="Approval.manager_id")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    waitlist_entries = relationship("WaitlistEntry", back_populates="user", cascade="all, delete-orphan")
