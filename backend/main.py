from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.connection import Base, engine
from routers.auth import router as auth_router
from routers.users import router as users_router
from routers.resources import router as resources_router
from routers.bookings import router as bookings_router
from routers.approvals import router as approvals_router
from routers.maintenance import router as maintenance_router
from routers.reports import router as reports_router

# Import all models so Alembic and create_all can see them
import models  # noqa

app = FastAPI(
    title="Enterprise Booking System",
    description="Role-based resource booking with conflict detection, approval workflows, and audit trails.",
    version="1.0.0",
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resources_router)
app.include_router(bookings_router)
app.include_router(approvals_router)
app.include_router(maintenance_router)
app.include_router(reports_router)


@app.on_event("startup")
def on_startup():
    """Create all tables on startup (use Alembic in production)."""
    Base.metadata.create_all(bind=engine)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "enterprise-booking-system"}
