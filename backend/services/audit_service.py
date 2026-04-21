from sqlalchemy.orm import Session
from datetime import datetime, timezone
from models.audit_log import AuditLog, AuditActionEnum
from typing import Optional


def log_action(
    db: Session,
    user_id: int,
    action: AuditActionEnum,
    entity_type: str,
    entity_id: Optional[int] = None,
    detail: Optional[dict] = None,
    booking_id: Optional[int] = None
) -> None:
    log = AuditLog(
        user_id=user_id,
        booking_id=booking_id or (entity_id if entity_type == "booking" else None),
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        detail=detail,
        timestamp=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db.add(log)
    # Note: caller is responsible for db.commit()
