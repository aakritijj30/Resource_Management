from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from database.connection import Base, engine, SessionLocal
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.resources import router as resources_router
from routers.bookings import router as bookings_router
from routers.approvals import router as approvals_router
from routers.maintenance import router as maintenance_router
from routers.reports import router as reports_router
from routers.departments import router as departments_router
from routers.notifications import router as notifications_router
from routers.waitlists import router as waitlists_router


# Import all models so Alembic and create_all can see them
import models  # noqa
from models.resource_policy import ResourcePolicy
from utils.office_hours import GLOBAL_OFFICE_HOURS_START, GLOBAL_OFFICE_HOURS_END

app = FastAPI(
    title="Enterprise Booking System",
    description="Role-based resource booking with conflict detection, approval workflows, and audit trails.",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(departments_router)
app.include_router(resources_router)
app.include_router(bookings_router)
app.include_router(approvals_router)
app.include_router(maintenance_router)
app.include_router(reports_router)
app.include_router(notifications_router)
app.include_router(waitlists_router)



@app.on_event("startup")
def on_startup():
    """Create all tables on startup (use Alembic in production)."""
    Base.metadata.create_all(bind=engine)
    _ensure_department_id_column()
    _ensure_audit_action_enum()
    _ensure_booking_attendance_columns()
    _ensure_resource_policies_columns()
    db = SessionLocal()
    try:
        policies = db.query(ResourcePolicy).all()
        dirty = False
        for policy in policies:
            if policy.office_hours_start != GLOBAL_OFFICE_HOURS_START or policy.office_hours_end != GLOBAL_OFFICE_HOURS_END:
                policy.office_hours_start = GLOBAL_OFFICE_HOURS_START
                policy.office_hours_end = GLOBAL_OFFICE_HOURS_END
                dirty = True
        if dirty:
            db.commit()
    except Exception as e:
        print(f"DEBUG: Skipping policy sync: {e}")
        db.rollback()
    finally:
        db.close()


def _ensure_department_id_column():
    """
    Backfill older databases that were created before resources.department_id existed.
    """
    db = SessionLocal()
    try:
        # Check if table exists first to avoid crashes
        from sqlalchemy import inspect
        inspector = inspect(db.bind)
        if not inspector.has_table("resources"):
            return

        resource_columns = {col["name"] for col in inspector.get_columns("resources")}
        if "department_id" not in resource_columns:
            db.execute(text("ALTER TABLE resources ADD COLUMN department_id INTEGER"))
            db.commit()
    except Exception as e:
        print(f"DEBUG: Skipping department_id check: {e}")
        db.rollback()
    finally:
        db.close()


def _ensure_resource_policies_columns():
    db = SessionLocal()
    try:
        inspector = inspect(db.bind)
        # Handle cases where the table doesn't exist yet gracefully
        if not inspector.has_table("resource_policies"):
            return
            
        columns = {col["name"] for col in inspector.get_columns("resource_policies")}
        if "max_attendees" not in columns:
            db.execute(text("ALTER TABLE resource_policies ADD COLUMN max_attendees INTEGER"))
        if "allowed_department_ids" not in columns:
            db.execute(text("ALTER TABLE resource_policies ADD COLUMN allowed_department_ids JSON"))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def _ensure_audit_action_enum():
    """
    Backfill older Postgres enum types with any missing audit action values.
    """
    db = SessionLocal()
    try:
        # Check if we are on Postgres first
        if "postgresql" in str(db.bind.url):
            for enum_value in ["booking_updated", "resource_reactivated"]:
                db.execute(
                    text(
                        "ALTER TYPE auditactionenum "
                        f"ADD VALUE IF NOT EXISTS '{enum_value}'"
                    )
                )
            db.commit()
    except Exception as e:
        print(f"DEBUG: Skipping audit enum check (likely already exists or not Postgres): {e}")
        db.rollback()
    finally:
        db.close()


def _ensure_booking_attendance_columns():
    db = SessionLocal()
    try:
        inspector = inspect(db.bind)
        if not inspector.has_table("bookings"):
            return

        columns = {col["name"] for col in inspector.get_columns("bookings")}
        if "attendance_status" not in columns:
            db.execute(text("ALTER TABLE bookings ADD COLUMN attendance_status VARCHAR(50) DEFAULT 'unknown'"))
        if "checked_in_at" not in columns:
            db.execute(text("ALTER TABLE bookings ADD COLUMN checked_in_at TIMESTAMP"))
        if "attendance_marked_by" not in columns:
            db.execute(text("ALTER TABLE bookings ADD COLUMN attendance_marked_by INTEGER"))
        if "attendance_marked_at" not in columns:
            db.execute(text("ALTER TABLE bookings ADD COLUMN attendance_marked_at TIMESTAMP"))
        db.commit()
    except Exception as e:
        print(f"DEBUG: Skipping booking attendance column check: {e}")
        db.rollback()
    finally:
        db.close()


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "enterprise-booking-system"}
