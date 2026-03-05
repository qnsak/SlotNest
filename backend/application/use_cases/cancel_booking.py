from __future__ import annotations

from dataclasses import dataclass

from domain.booking.entities import Booking
from domain.booking.repository import BookingRepository
from domain.common.errors import BookingAlreadyCanceledError, BookingNotFoundError


@dataclass
class CancelBookingCommand:
    booking_reference: str


def cancel_booking(booking_repo: BookingRepository, command: CancelBookingCommand) -> Booking:
    booking = booking_repo.get_by_reference(command.booking_reference)
    if booking is None:
        raise BookingNotFoundError()

    if not booking.is_active():
        raise BookingAlreadyCanceledError()

    booking.cancel()
    booking_repo.save(booking)
    return booking
