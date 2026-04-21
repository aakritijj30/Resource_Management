from datetime import datetime, timezone
from fastapi import HTTPException, status


def times_overlap(start1: datetime, end1: datetime, start2: datetime, end2: datetime) -> bool:
    """
    Returns True if two time ranges overlap.
    Uses: new_start < exist_end AND new_end > exist_start
    """
    return start1 < end2 and end1 > start2


# def validate_future_datetime(dt: datetime) -> None:
#     if dt <= datetime.now(timezone.utc).replace(tzinfo=None):
#         raise HTTPException(
#             status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
#             detail="Booking start time must be in the future"
#         )
def validate_future_datetime(dt: datetime) -> None:
    # If incoming datetime is naive → assume UTC (or change if needed)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    now_utc = datetime.now(timezone.utc)

    if dt <= now_utc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Booking start time must be in the future"
        )


def validate_time_range(start: datetime, end: datetime) -> None:
    if end <= start:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="End time must be after start time"
        )


def duration_hours(start: datetime, end: datetime) -> float:
    return (end - start).total_seconds() / 3600


def day_bitmask(dt: datetime) -> int:
    """Monday=bit1, Sunday=bit7 (1-indexed bitmask for weekdays)"""
    return 1 << dt.weekday()
