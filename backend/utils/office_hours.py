GLOBAL_OFFICE_HOURS_START = 9
GLOBAL_OFFICE_HOURS_END = 18


def format_hour_label(hour_24: int) -> str:
    hour_24 = hour_24 % 24
    suffix = "am" if hour_24 < 12 else "pm"
    hour_12 = hour_24 % 12 or 12
    return f"{hour_12}:00 {suffix}"


def office_hours_label() -> str:
    return f"{format_hour_label(GLOBAL_OFFICE_HOURS_START)} - {format_hour_label(GLOBAL_OFFICE_HOURS_END)}"
