from pydantic import BaseModel
from typing import List, Optional


class ResourceUsageStat(BaseModel):
    resource_id: int
    resource_name: str
    total_bookings: int
    total_hours: float


class DeptUsageStat(BaseModel):
    department_id: int
    department_name: str
    total_bookings: int
    approved_count: int
    rejected_count: int
    cancelled_count: int


class TrendPoint(BaseModel):
    period: str   # e.g. "2024-01", "2024-W04"
    total_bookings: int
    approved: int
    rejected: int


class ReportSummary(BaseModel):
    total_bookings: int
    pending_bookings: int
    approved_bookings: int
    rejected_bookings: int
    cancelled_bookings: int
    completed_bookings: int
    top_resources: List[ResourceUsageStat]
    dept_usage: List[DeptUsageStat]
    trends: List[TrendPoint]
