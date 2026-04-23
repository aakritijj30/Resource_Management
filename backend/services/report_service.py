from sqlalchemy.orm import Session
from sqlalchemy import func, extract, Integer
from models.booking import Booking, BookingStatusEnum
from models.resource import Resource
from models.department import Department
from models.user import User
from schemas.report import ReportSummary, ResourceUsageStat, DeptUsageStat, TrendPoint
from utils.helpers import duration_hours


def get_report_summary(db: Session, department_id: int = None) -> ReportSummary:
    def base_query(status=None):
        q = db.query(func.count(Booking.id))
        if department_id:
            q = q.join(User, Booking.user_id == User.id).filter(User.department_id == department_id)
        if status:
            q = q.filter(Booking.status == status)
        return q

    return ReportSummary(
        total_bookings=base_query().scalar() or 0,
        pending_bookings=base_query(BookingStatusEnum.pending).scalar() or 0,
        approved_bookings=base_query(BookingStatusEnum.approved).scalar() or 0,
        rejected_bookings=base_query(BookingStatusEnum.rejected).scalar() or 0,
        cancelled_bookings=base_query(BookingStatusEnum.cancelled).scalar() or 0,
        completed_bookings=base_query(BookingStatusEnum.completed).scalar() or 0,
        top_resources=get_top_resources(db, department_id=department_id),
        dept_usage=get_dept_usage(db, department_id=department_id),
        trends=get_monthly_trends(db, department_id=department_id)
    )


def get_top_resources(db: Session, limit: int = 5, department_id: int = None):
    q = (
        db.query(Resource.id, Resource.name, func.count(Booking.id).label("total_bookings"))
        .join(Booking, Booking.resource_id == Resource.id)
        .filter(Booking.status.in_([BookingStatusEnum.approved, BookingStatusEnum.completed]))
    )
    if department_id:
        q = q.join(User, Booking.user_id == User.id).filter(User.department_id == department_id)
    
    rows = (
        q.group_by(Resource.id, Resource.name)
        .order_by(func.count(Booking.id).desc())
        .limit(limit)
        .all()
    )
    return [
        ResourceUsageStat(
            resource_id=r.id,
            resource_name=r.name,
            total_bookings=r.total_bookings,
            total_hours=0.0  # simplified
        )
        for r in rows
    ]


def get_dept_usage(db: Session, department_id: int = None):
    q = db.query(Department.id, Department.name).join(User, User.department_id == Department.id)
    if department_id:
        q = q.filter(Department.id == department_id)
    
    rows = q.group_by(Department.id, Department.name).all()

    result = []
    for dept_id, dept_name in rows:
        def count_by_status(status=None):
            sq = db.query(func.count(Booking.id)).join(User, Booking.user_id == User.id).filter(User.department_id == dept_id)
            if status:
                sq = sq.filter(Booking.status == status)
            return sq.scalar() or 0

        total = count_by_status()
        if total == 0 and department_id is None:
            continue

        result.append(DeptUsageStat(
            department_id=dept_id,
            department_name=dept_name,
            total_bookings=total,
            approved_count=count_by_status(BookingStatusEnum.approved),
            rejected_count=count_by_status(BookingStatusEnum.rejected),
            cancelled_count=count_by_status(BookingStatusEnum.cancelled)
        ))
    return result


def get_monthly_trends(db: Session, months: int = 6, department_id: int = None):
    q = db.query(
        extract("year", Booking.created_at).label("year"),
        extract("month", Booking.created_at).label("month"),
        func.count(Booking.id).label("total")
    )
    if department_id:
        q = q.join(User, Booking.user_id == User.id).filter(User.department_id == department_id)
    
    rows = (
        q.group_by("year", "month")
        .order_by("year", "month")
        .limit(months)
        .all()
    )
    trends = []
    for row in rows:
        def count_trend(status):
            sq = db.query(func.count(Booking.id)).filter(
                extract("year", Booking.created_at) == row.year,
                extract("month", Booking.created_at) == row.month,
                Booking.status == status
            )
            if department_id:
                sq = sq.join(User, Booking.user_id == User.id).filter(User.department_id == department_id)
            return sq.scalar() or 0

        trends.append(TrendPoint(
            period=f"{int(row.year)}-{int(row.month):02d}",
            total_bookings=row.total,
            approved=count_trend(BookingStatusEnum.approved),
            rejected=count_trend(BookingStatusEnum.rejected)
        ))
    return trends
