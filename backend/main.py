from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import Base, engine, SessionLocal
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.resources import router as resources_router
from routers.bookings import router as bookings_router
from routers.approvals import router as approvals_router
from routers.maintenance import router as maintenance_router
from routers.reports import router as reports_router
from routers.departments import router as departments_router

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


@app.on_event("startup")
def on_startup():
    """Create all tables on startup (use Alembic in production)."""
    Base.metadata.create_all(bind=engine)
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
    finally:
        db.close()


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "enterprise-booking-system"}
