from __future__ import annotations

from datetime import date

from typing import Protocol

from domain.booking.entities import Booking


class BookingRepository(Protocol):
    def create_for_interval(self, interval_id: int) -> Booking: ...

    def get_by_reference(self, booking_reference: str) -> Booking | None: ...

    def list_by_interval(self, interval_id: int) -> list[Booking]: ...

    def list_by_date(self, target_date: date) -> list[Booking]: ...

    def exists_active_by_interval(self, interval_id: int) -> bool: ...

    def save(self, booking: Booking) -> None: ...
