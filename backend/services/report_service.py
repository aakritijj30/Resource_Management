from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from models.booking import Booking, BookingStatusEnum
from models.resource import Resource
from models.department import Department
from models.user import User
from schemas.report import ReportSummary, ResourceUsageStat, DeptUsageStat, TrendPoint
from utils.helpers import duration_hours


def get_report_summary(db: Session) -> ReportSummary:
    total = db.query(func.count(Booking.id)).scalar()
    pending = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatusEnum.pending).scalar()
    approved = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatusEnum.approved).scalar()
    rejected = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatusEnum.rejected).scalar()
    cancelled = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatusEnum.cancelled).scalar()
    completed = db.query(func.count(Booking.id)).filter(Booking.status == BookingStatusEnum.completed).scalar()

    return ReportSummary(
        total_bookings=total or 0,
        pending_bookings=pending or 0,
        approved_bookings=approved or 0,
        rejected_bookings=rejected or 0,
        cancelled_bookings=cancelled or 0,
        completed_bookings=completed or 0,
        top_resources=get_top_resources(db),
        dept_usage=get_dept_usage(db),
        trends=get_monthly_trends(db)
    )


def get_top_resources(db: Session, limit: int = 5):
    rows = (
        db.query(Resource.id, Resource.name, func.count(Booking.id).label("total_bookings"))
        .join(Booking, Booking.resource_id == Resource.id)
        .filter(Booking.status.in_([BookingStatusEnum.approved, BookingStatusEnum.completed]))
        .group_by(Resource.id, Resource.name)
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


def get_dept_usage(db: Session):
    rows = (
        db.query(
            Department.id,
            Department.name,
            func.count(Booking.id).label("total"),
            func.sum((Booking.status == BookingStatusEnum.approved).cast(db.bind.dialect.name == "postgresql" and "int" or "integer")).label("approved"),
        )
        .join(User, User.department_id == Department.id)
        .join(Booking, Booking.user_id == User.id)
        .group_by(Department.id, Department.name)
        .all()
    )

    result = []
    for dept_id, dept_name, total, *_ in rows:
        approved_count = db.query(func.count(Booking.id)).join(User, Booking.user_id == User.id).filter(
            User.department_id == dept_id, Booking.status == BookingStatusEnum.approved
        ).scalar() or 0
        rejected_count = db.query(func.count(Booking.id)).join(User, Booking.user_id == User.id).filter(
            User.department_id == dept_id, Booking.status == BookingStatusEnum.rejected
        ).scalar() or 0
        cancelled_count = db.query(func.count(Booking.id)).join(User, Booking.user_id == User.id).filter(
            User.department_id == dept_id, Booking.status == BookingStatusEnum.cancelled
        ).scalar() or 0
        result.append(DeptUsageStat(
            department_id=dept_id,
            department_name=dept_name,
            total_bookings=total,
            approved_count=approved_count,
            rejected_count=rejected_count,
            cancelled_count=cancelled_count
        ))
    return result


def get_monthly_trends(db: Session, months: int = 6):
    rows = (
        db.query(
            extract("year", Booking.created_at).label("year"),
            extract("month", Booking.created_at).label("month"),
            func.count(Booking.id).label("total")
        )
        .group_by("year", "month")
        .order_by("year", "month")
        .limit(months)
        .all()
    )
    trends = []
    for row in rows:
        approved = db.query(func.count(Booking.id)).filter(
            extract("year", Booking.created_at) == row.year,
            extract("month", Booking.created_at) == row.month,
            Booking.status == BookingStatusEnum.approved
        ).scalar() or 0
        rejected = db.query(func.count(Booking.id)).filter(
            extract("year", Booking.created_at) == row.year,
            extract("month", Booking.created_at) == row.month,
            Booking.status == BookingStatusEnum.rejected
        ).scalar() or 0
        trends.append(TrendPoint(
            period=f"{int(row.year)}-{int(row.month):02d}",
            total_bookings=row.total,
            approved=approved,
            rejected=rejected
        ))
    return trends
