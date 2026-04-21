from fastapi import HTTPException, status


class BookingConflictError(HTTPException):
    def __init__(self, detail: str = "Time slot conflicts with an existing booking"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class CapacityExceededError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail="Resource is at full capacity for this time slot")


class PolicyViolationError(HTTPException):
    def __init__(self, detail: str = "Booking violates resource policy"):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=detail)


class MaintenanceBlockError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail="Resource is under maintenance during the requested time")


class InvalidStateTransitionError(HTTPException):
    def __init__(self, from_state: str, to_state: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid state transition: {from_state} -> {to_state}"
        )


class NoManagerAssignedError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="No manager assigned to your department. Contact admin.")


class ResourceNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")


class BookingNotFoundError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")


class UnauthorizedAccessError(HTTPException):
    def __init__(self):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to perform this action")
