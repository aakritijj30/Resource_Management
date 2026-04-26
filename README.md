# 🏰 Enterprise Resource Management System (ERMS)

A premium, full-stack resource management platform designed for modern enterprises. This system streamlines how employees book office resources (parking, meeting rooms, hardware) while giving managers and admins complete control over policies, approvals, and maintenance.

---

## 🎨 Visual Identity
The system features a **"Dusted Rose and Beige"** design system, providing a cinematic, high-end aesthetic that feels professional yet modern. It uses liquid-motion backgrounds, glassmorphism, and smooth animations to provide a premium user experience.

---

## 🚀 Tech Stack

### Backend (The Brain)
- **FastAPI**: A high-performance Python framework for building APIs.
- **SQLAlchemy**: Powerful Object-Relational Mapping (ORM) to handle database queries.
- **PostgreSQL**: Robust, enterprise-grade relational database.
- **JWT Auth**: Secure token-based authentication with role-based access.

### Frontend (The Face)
- **React 18 & Vite**: Lightning-fast frontend development and rendering.
- **Tailwind CSS**: Modern, utility-first styling for a custom, premium look.
- **React Query (TanStack)**: Advanced data fetching, caching, and state synchronization.
- **Lucide Icons**: Crisp, professional iconography.

---

## 🎭 User Portals

### 👤 Employee Portal
Designed for simplicity and speed. Employees can:
- **Browse Resources**: View a beautiful catalog of available rooms, parking slots, and equipment.
- **Smart Booking**: Select dates and times with real-time conflict checking.
- **My Bookings**: Manage personal schedules, view status (Pending/Approved), and cancel upcoming slots.
- **Automatic Notifications**: Get alerted if a manager approves or rejects a request.

### 👥 Manager Portal
Focused on department oversight. Managers can:
- **Approval Queue**: View and process booking requests from their specific department.
- **Priority Override**: As requested, managers can book over existing employee slots using their "Manager Priority," which triggers a confirmation alert and auto-notifies the employee.
- **Team Insights**: View all departmental activity in a dedicated "Team Bookings" view.
- **Resource Analytics**: See how their department is utilizing company assets.

### ⚙️ Admin Portal (Operations Command Center)
The ultimate control center. Admins can:
- **Resource Management**: Add, edit, or deactivate resources and upload images.
- **Rules Engine (Policies)**: Set global or resource-specific rules (e.g., "Max 4 hours per booking," "Office hours only," or "Limit parking slot capacity").
- **Maintenance Command**: Block resources for repairs. Creating a block automatically cancels conflicting bookings and alerts the users.
- **Global Reports**: Access deep-dive analytics on resource utilization across the whole organization.
- **System Logs**: View a full audit trail of every action taken in the system.

---

## 📊 Database Schema & Relationships

The system uses a relational database structure to ensure data integrity:
1.  **Users**: Stores credentials, roles (admin, manager, employee), and department links.
2.  **Departments**: Groups users and assigns a specific Manager as the "Head" for approvals.
3.  **Resources**: Stores resource details (Name, Type, Location, Physical Capacity).
4.  **Bookings**: The core transaction record linking a User to a Resource for a specific time window.
5.  **Approvals**: A secondary layer linked to Bookings that tracks manager decisions and comments.
6.  **Policies**: Configuration records for each resource that define limits like max duration or capacity.
7.  **Maintenance Blocks**: Time-based restrictions that override all other bookings.
8.  **Audit Logs**: A permanent record of "Who did what and when."

---

## 🌱 The Seed System (`seed.py`)
The `backend/database/seed.py` file is a powerful utility for developers. 
- **What it does**: It wipes the current database and populates it with a "Perfect Enterprise" scenario.
- **What it creates**: It generates 32+ resources (Parking, Labs, Conference Rooms), multiple departments (Digital Transformation, Engineering, Marketing), and realistic users for every role.
- **Why it's useful**: It allows you to test the entire system (approvals, conflicts, reports) with pre-made data immediately after setup.

---

## 🛠️ How to Run the Project

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Create a virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file based on .env.example
# Ensure your DATABASE_URL is set correctly

# Seed the database (Highly Recommended for first run)
python database/seed.py

# Start the server
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Accessing the App
- **Frontend**: `http://localhost:5173`
- **API Documentation**: `http://localhost:8000/docs`

---

## 🔐 Demo Credentials (via Seed)
- **Admin**: `admin@company.com` / `admin123`
- **Manager**: `mgr.eng@company.com` / `manager123`
- **Employee**: `emp.digital@company.com` / `emp123`
