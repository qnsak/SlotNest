from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from domain.booking.entities import Booking
from domain.booking.repository import BookingRepository


@dataclass(frozen=True)
class ListBookingsByDateCommand:
    target_date: date


def list_bookings_by_date(
    booking_repo: BookingRepository,
    command: ListBookingsByDateCommand,
) -> list[Booking]:
    return booking_repo.list_by_date(command.target_date)
