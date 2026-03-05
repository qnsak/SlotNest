from __future__ import annotations

from dataclasses import dataclass

from domain.booking.entities import Booking
from domain.booking.repository import BookingRepository
from domain.common.errors import BookingNotFoundError


@dataclass(frozen=True)
class GetBookingCommand:
    booking_reference: str


def get_booking(booking_repo: BookingRepository, command: GetBookingCommand) -> Booking:
    booking = booking_repo.get_by_reference(command.booking_reference)
    if booking is None:
        raise BookingNotFoundError()
    return booking
