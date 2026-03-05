class DomainError(Exception):
    code = "DOMAIN_ERROR"

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.code)


class OutOfRangeError(DomainError):
    code = "OUT_OF_RANGE"


class IntervalOverlapError(DomainError):
    code = "INTERVAL_OVERLAP"


class IntervalAlreadyBookedError(DomainError):
    code = "INTERVAL_ALREADY_BOOKED"


class IntervalHasBookingsError(DomainError):
    code = "INTERVAL_HAS_BOOKINGS"


class IntervalNotFoundError(DomainError):
    code = "INTERVAL_NOT_FOUND"


class BookingNotFoundError(DomainError):
    code = "BOOKING_NOT_FOUND"


class BookingAlreadyCanceledError(DomainError):
    code = "BOOKING_ALREADY_CANCELED"
