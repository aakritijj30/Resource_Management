from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract, Integer
from datetime import timedelta
from models.booking import Booking, BookingStatusEnum, AttendanceStatusEnum
from models.resource import Resource
from models.department import Department
from models.user import User
from schemas.report import ReportSummary, ResourceUsageStat, DeptUsageStat, TrendPoint, AnomalyInsight
from utils.helpers import duration_hours
from utils.timezone import now_local_naive


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
        trends=get_monthly_trends(db, department_id=department_id),
        anomalies=get_anomaly_insights(db, department_id=department_id),
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


def get_anomaly_insights(db: Session, department_id: int = None, window_days: int = 30):
    since = now_local_naive() - timedelta(days=window_days)
    insights: list[AnomalyInsight] = []

    bookings_query = (
        db.query(Booking)
        .options(joinedload(Booking.user), joinedload(Booking.resource))
        .filter(Booking.created_at >= since)
    )
    if department_id:
        bookings_query = bookings_query.join(User, Booking.user_id == User.id).filter(User.department_id == department_id)
    recent_bookings = bookings_query.all()

    by_user: dict[int, dict] = {}
    for booking in recent_bookings:
        if not booking.user:
            continue
        item = by_user.setdefault(
            booking.user_id,
            {"user": booking.user, "total": 0, "cancelled": 0, "completed": 0},
        )
        item["total"] += 1
        if booking.status == BookingStatusEnum.cancelled:
            item["cancelled"] += 1
        if booking.status == BookingStatusEnum.completed:
            item["completed"] += 1

        if booking.resource and booking.resource.capacity and booking.resource.capacity >= 4:
            utilization = booking.attendees / booking.resource.capacity
            if booking.status in [BookingStatusEnum.approved, BookingStatusEnum.completed] and utilization <= 0.4:
                insights.append(
                    AnomalyInsight(
                        category="underused_booked_room",
                        severity="medium" if utilization > 0.2 else "high",
                        signal_strength="strong",
                        title="Underused room booking",
                        subject=f"{booking.resource.name} booked for {booking.attendees} attendee(s)",
                        metric=f"{utilization:.0%} utilization of capacity {booking.resource.capacity}",
                        explanation="Booked attendance is well below room capacity, suggesting the room may be larger than needed.",
                        booking_id=booking.id,
                        user_id=booking.user_id,
                        resource_id=booking.resource_id,
                        resource_name=booking.resource.name,
                        user_name=booking.user.full_name,
                        period_days=window_days,
                    )
                )

    for user_id, stats in by_user.items():
        total = stats["total"]
        cancelled = stats["cancelled"]
        completed = stats["completed"]
        cancel_rate = (cancelled / total) if total else 0

        if cancelled >= 3 or (total >= 4 and cancel_rate >= 0.5):
            insights.append(
                AnomalyInsight(
                    category="frequent_cancellations",
                    severity="high" if cancelled >= 5 or cancel_rate >= 0.6 else "medium",
                    signal_strength="strong",
                    title="Frequent cancellations",
                    subject=stats["user"].full_name,
                    metric=f"{cancelled} cancellations out of {total} bookings ({cancel_rate:.0%})",
                    explanation="This user is cancelling an unusually high share of recent bookings.",
                    user_id=user_id,
                    user_name=stats["user"].full_name,
                    period_days=window_days,
                )
            )

        actual_no_shows = sum(1 for booking in recent_bookings if booking.user_id == user_id and booking.attendance_status == AttendanceStatusEnum.no_show)
        if actual_no_shows >= 2:
            insights.append(
                AnomalyInsight(
                    category="repeated_no_shows",
                    severity="high" if actual_no_shows >= 4 else "medium",
                    signal_strength="strong",
                    title="Repeated no-shows",
                    subject=stats["user"].full_name,
                    metric=f"{actual_no_shows} no-show booking(s) in the last {window_days} days",
                    explanation="Attendance records show this user missed multiple bookings after approval.",
                    user_id=user_id,
                    user_name=stats["user"].full_name,
                    period_days=window_days,
                )
            )

    severity_order = {"high": 0, "medium": 1, "low": 2}
    insights.sort(key=lambda item: (severity_order.get(item.severity, 3), item.category, item.subject))
    return insights[:12]
