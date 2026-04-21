from datetime import datetime
from zoneinfo import ZoneInfo
import os


APP_TIMEZONE_NAME = os.getenv("APP_TIMEZONE", "Asia/Kolkata")
APP_TIMEZONE = ZoneInfo(APP_TIMEZONE_NAME)


def now_local() -> datetime:
    """Return the current datetime in the application timezone."""
    return datetime.now(APP_TIMEZONE)


def now_local_naive() -> datetime:
    """Return the current application-timezone datetime without tzinfo for DB storage."""
    return now_local().replace(tzinfo=None)


def to_local_naive(value: datetime) -> datetime:
    """Normalize incoming datetimes to the application timezone and drop tzinfo."""
    if value.tzinfo is None:
        return value
    return value.astimezone(APP_TIMEZONE).replace(tzinfo=None)
