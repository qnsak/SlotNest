from __future__ import annotations

from dataclasses import dataclass

STATUS_ACTIVE = "ACTIVE"
STATUS_CANCELED = "CANCELED"


@dataclass
class Booking:
    id: int
    interval_id: int
    booking_reference: str
    status: str = STATUS_ACTIVE

    def cancel(self) -> None:
        self.status = STATUS_CANCELED

    def is_active(self) -> bool:
        return self.status == STATUS_ACTIVE
