from __future__ import annotations

from dataclasses import dataclass

from domain.booking.repository import BookingRepository
from domain.booking.entities import Booking


@dataclass
class CreateBookingCommand:
    interval_id: int


def create_booking(booking_repo: BookingRepository, command: CreateBookingCommand) -> Booking:
    return booking_repo.create_for_interval(command.interval_id)
