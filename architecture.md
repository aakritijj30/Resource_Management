# Architecture

## Entity Relationship Diagram

```mermaid
erDiagram
    DEPARTMENT {
        int id PK
        string name
        int manager_id FK
    }
    USER {
        int id PK
        string email
        string full_name
        string hashed_password
        enum role
        int department_id FK
        bool is_active
    }
    RESOURCE {
        int id PK
        string name
        enum type
        int capacity
        string location
        bool approval_required
        bool is_active
    }
    RESOURCE_POLICY {
        int id PK
        int resource_id FK
        float max_duration_hours
        float min_duration_hours
        int office_hours_start
        int office_hours_end
        int allowed_days
        bool require_justification
        int advance_booking_days
    }
    BOOKING {
        int id PK
        int user_id FK
        int resource_id FK
        datetime start_time
        datetime end_time
        string purpose
        int attendees
        enum status
    }
    APPROVAL {
        int id PK
        int booking_id FK
        int manager_id FK
        enum decision
        string comment
        datetime decided_at
    }
    MAINTENANCE_BLOCK {
        int id PK
        int resource_id FK
        datetime start_time
        datetime end_time
        string reason
        int created_by FK
    }
    AUDIT_LOG {
        int id PK
        int user_id FK
        int booking_id FK
        enum action
        string entity_type
        int entity_id
        json detail
        datetime timestamp
    }

    DEPARTMENT ||--o{ USER : "has members"
    DEPARTMENT ||--o| USER : "managed by"
    USER ||--o{ BOOKING : "creates"
    USER ||--o{ APPROVAL : "decides"
    RESOURCE ||--o| RESOURCE_POLICY : "has policy"
    RESOURCE ||--o{ BOOKING : "booked for"
    RESOURCE ||--o{ MAINTENANCE_BLOCK : "blocked by"
    BOOKING ||--o| APPROVAL : "requires"
    BOOKING ||--o{ AUDIT_LOG : "tracked in"
    USER ||--o{ AUDIT_LOG : "generates"
```

---

## API Design Decisions

### Why SQLAlchemy + PostgreSQL (not NoSQL)?
Bookings have strong relational requirements (FKs, joins, transactions). PostgreSQL's MVCC ensures conflict-free concurrent booking reads/writes.

### Why separate `conflict_service` and `booking_service`?
Conflict detection logic is independently testable and reusable. If we add recurring bookings later, the conflict engine doesn't need to change.

### Why bitmask for `allowed_days`?
A 7-bit integer encodes all weekday rules in a single DB column, avoids arrays, and allows fast bitwise checks without any JOIN.

### JWT payload
We embed `user_id` and `role` in the token to avoid a DB lookup on every request. Role is validated against DB on actions that require current state (e.g. is_active check).

### Approval routing
When a booking requires approval, we look up `department.manager_id` at creation time. This means if a manager changes, old pending bookings still route to the previous manager. This is by design (audit integrity).

### Soft-delete for resources
Resources are deactivated (`is_active = False`) rather than deleted. This preserves historical booking records and audit logs.

---

## Tradeoffs

| Decision | Pros | Cons |
|---|---|---|
| Single approval per booking | Simple, predictable | No multi-level approval |
| Policy stored in DB (not code) | Admin-configurable at runtime | Slightly more complex service layer |
| JWT (stateless) | Scalable, no session store needed | Can't revoke tokens mid-flight |
| React + Vite | Fast dev, small bundle | SSR not included |
| react-query for server state | Auto-cache invalidation, stale-while-revalidate | Learning curve |
