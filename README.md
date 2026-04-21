# Enterprise Booking System

A full-stack resource booking platform with role-based access control, conflict detection, approval workflows, maintenance management, and analytics.

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | FastAPI · SQLAlchemy · PostgreSQL · Alembic     |
| Auth     | JWT (python-jose) · bcrypt (passlib)            |
| Frontend | React 18 · Vite · Tailwind CSS · react-query   |
| Charts   | Recharts                                        |
| State    | Context API · Zustand (optional)               |

---

## Quick Start

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or use Docker)

### 2. Database
```bash
# Using Docker (recommended for local dev):
docker-compose up db -d

# Or create manually:
createdb enterprise_booking
```

### 3. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (macOS / Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux
# Then edit .env with your DATABASE_URL, SECRET_KEY

# Run the server (tables are auto-created on startup)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Seed demo data (optional, in a second terminal with venv active)
python database/seed.py

# Run tests (venv must be active)
pytest tests/ -v
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies API calls to backend on :8000)
npm run dev

# Build for production
npm run build
```

### 5. Access
| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |

---

## Demo Credentials

| Role     | Email                    | Password    |
|----------|--------------------------|-------------|
| Admin    | admin@company.com        | admin123    |
| Manager  | mgr.eng@company.com      | manager123  |
| Manager  | mgr.mkt@company.com      | manager123  |
| Employee | emp1@company.com         | emp123      |
| Employee | emp2@company.com         | emp123      |

---

## Full Rules & Business Logic

### Authentication
- JWT tokens with role + user ID embedded in payload
- Tokens expire in 60 minutes (configurable via `.env`)
- All endpoints (except `/auth/login` and `/health`) require a valid Bearer token

### Roles & Access
| Role     | Capabilities                                                                 |
|----------|------------------------------------------------------------------------------|
| `employee` | Browse resources, create bookings, cancel own bookings, view own audit trail |
| `manager`  | All employee access + view approval queue (own dept only), approve/reject   |
| `admin`    | Full system access + manage resources, set policies, maintenance, reports   |

### Booking State Machine
```
Draft → Pending → Approved → Completed
             ↓         ↓
          Rejected  Cancelled
```
- **Auto-approved** if `resource.approval_required = false`
- **Pending** if approval is required and a manager is assigned
- **Error** if no manager is assigned to the user's department
- **Rejected → Approved** transition is blocked (invalid state guard)

### Conflict Detection Pipeline (in order)
1. Resource active check
2. Policy validation (office hours, duration, day-of-week, advance days)
3. Maintenance block check → raises if overlap
4. Booking conflict check → raises if `new_start < exist_end AND new_end > exist_start`
5. Capacity check → sums concurrent attendees vs resource capacity

### Approval Guards
- Only the **assigned manager** can decide (or admin)
- **Double-action prevention**: re-checking `decision == pending` before acting
- **Slot re-check on approval**: another booking may have claimed the slot while pending

### Maintenance Blocks
- Creating a block **auto-cancels** all overlapping pending/approved bookings
- Cancelled bookings are logged with reason in audit trail
- Removing a block does **not** restore cancelled bookings

### Audit Trail
Every key action is logged: booking_created, booking_approved, booking_rejected, booking_cancelled, booking_completed, booking_auto_approved, resource_created, resource_updated, resource_deactivated, maintenance_created, maintenance_deleted, user_login, user_created, policy_updated.

---

## Docker (Full Stack)
```bash
docker-compose up --build
```
Starts PostgreSQL + Backend + Frontend together.

---

## Project Structure
See `architecture.md` for ER diagram and API design decisions.
See `edge_cases.md` for all documented edge cases.
