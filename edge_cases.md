# Edge Cases — All Handled

## Booking Creation

| Edge Case | Handling |
|---|---|
| Start time in the past | `validate_future_datetime()` raises 422 |
| Start time is today but already passed | Treated the same as a past datetime and rejected with 422 |
| End time before start time | `validate_time_range()` raises 422 |
| Resource inactive at booking time | Checked before any other validation → 404 |
| Exact boundary overlap (`new_start == exist_end`) | Uses strict `<` / `>` not `<=` — boundary slots DO NOT conflict |
| Overlapping pending booking | Treated as a conflict (blocked) to prevent overbooking pending approvals |
| Attendees exceed resource capacity | `check_capacity()` sums concurrent approved attendees + new request vs capacity |
| Booking during maintenance window | `check_maintenance_block()` runs before booking creation |
| Policy: booking before `office_hours_start` or after `office_hours_end` | `enforce_policy()` checks start hour and end hour |
| Policy: duration too short or too long | Min/max duration checked in hours |
| Policy: booking on disallowed weekday | Day bitmask comparison |
| Policy: booking too far in advance | `advance_booking_days` exceeded → 422 |
| No manager assigned to department | `NoManagerAssignedError` with admin notification instruction |
| Resource has no policy | `get_policy()` returns None → no restrictions applied |

## Approval Workflow

| Edge Case | Handling |
|---|---|
| Manager tries to approve own dept booking twice | `decision == pending` guard before update → raises `InvalidStateTransitionError` |
| Wrong manager tries to decide | `manager_id` mismatch guard → `UnauthorizedAccessError` |
| Slot taken while booking was pending | Re-runs `check_booking_conflict()` at approve time → auto-rejects with BookingConflictError |
| Booking already rejected → approve attempt | `InvalidStateTransitionError` (Rejected → Approved blocked) |
| Booking already approved → reject attempt | `InvalidStateTransitionError` (Approved → Rejected blocked) |
| No manager assigned at time of approval routing | Caught at booking creation — error returned before approval record is created |

## Cancellation

| Edge Case | Handling |
|---|---|
| Cancel a completed booking | InvalidStateTransitionError |
| Cancel an already-cancelled booking | InvalidStateTransitionError |
| Cancel a booking that has already started | Checked via `start_time <= now()` → 422 |
| Employee cancels another user's booking | `UnauthorizedAccessError` (only owner or admin) |
| Admin cancels any booking | Allowed regardless of ownership |

## Maintenance Blocks

| Edge Case | Handling |
|---|---|
| Maintenance block created over existing approved bookings | All overlapping approved/pending bookings are auto-cancelled with audit log entry |
| Maintenance block starts in the past | Rejected with 422 |
| Maintenance block end time before start time | Rejected with 422 |
| Booking attempted during maintenance window | `check_maintenance_block()` raises `MaintenanceBlockError` |
| Maintenance block removed | Cancelled bookings are NOT restored (by design — data integrity) |
| Overlapping maintenance blocks | Allowed — multiple blocks can cover same range |

## State Machine Summary

```
Valid transitions:
  pending   → approved   ✅
  pending   → rejected   ✅
  pending   → cancelled  ✅ (employee before start)
  approved  → cancelled  ✅ (employee before start)
  approved  → completed  ✅ (auto after end_time)

Invalid transitions (guarded):
  rejected  → approved   ❌
  approved  → rejected   ❌
  cancelled → any        ❌
  completed → any        ❌
```
