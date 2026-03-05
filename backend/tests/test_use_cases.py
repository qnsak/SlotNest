from __future__ import annotations

from datetime import date, time

import pytest

from application.use_cases.cancel_booking import CancelBookingCommand, cancel_booking
from application.use_cases.create_booking import CreateBookingCommand, create_booking
from application.use_cases.create_interval import CreateIntervalCommand, create_interval
from application.use_cases.delete_interval import DeleteIntervalCommand, delete_interval
from domain.booking.entities import Booking
from domain.booking.reference import generate_reference
from domain.common.errors import (
    BookingAlreadyCanceledError,
    IntervalAlreadyBookedError,
    IntervalHasBookingsError,
    IntervalNotFoundError,
)
from domain.interval.entities import Interval


class InMemoryIntervalRepo:
    def __init__(self, booking_repo: "InMemoryBookingRepo") -> None:
        self.items: dict[int, Interval] = {}
        self.booking_repo = booking_repo
        self._seq = 0

    def add(self, interval: Interval) -> Interval:
        self._seq += 1
        saved = Interval(
            id=self._seq,
            date=interval.date,
            start_time=interval.start_time,
            end_time=interval.end_time,
        )
        self.items[saved.id] = saved
        return saved

    def get(self, interval_id: int) -> Interval | None:
        return self.items.get(interval_id)

    def list_by_date(self, target_date) -> list[Interval]:
        return [interval for interval in self.items.values() if interval.date == target_date]

    def list_between(self, start, end) -> list[Interval]:
        return [interval for interval in self.items.values() if start <= interval.date <= end]

    def delete(self, interval_id: int) -> None:
        if interval_id not in self.items:
            raise IntervalNotFoundError()
        bookings = self.booking_repo.list_by_interval(interval_id)
        if any(booking.is_active() for booking in bookings):
            raise IntervalHasBookingsError()
        self.items.pop(interval_id, None)


class InMemoryBookingRepo:
    def __init__(self) -> None:
        self.items: dict[str, Booking] = {}
        self._seq = 0

    def create_for_interval(self, interval_id: int) -> Booking:
        if any(
            existing.interval_id == interval_id and existing.is_active()
            for existing in self.items.values()
        ):
            raise IntervalAlreadyBookedError()
        self._seq += 1
        booking = Booking(
            id=self._seq,
            interval_id=interval_id,
            booking_reference=generate_reference(),
        )
        self.items[booking.booking_reference] = booking
        return booking

    def get_by_reference(self, booking_reference: str) -> Booking | None:
        return self.items.get(booking_reference)

    def list_by_interval(self, interval_id: int) -> list[Booking]:
        return [booking for booking in self.items.values() if booking.interval_id == interval_id]

    def list_by_date(self, target_date) -> list[Booking]:  # noqa: ARG002
        return list(self.items.values())

    def exists_active_by_interval(self, interval_id: int) -> bool:
        return any(booking.interval_id == interval_id and booking.is_active() for booking in self.items.values())

    def save(self, booking: Booking) -> None:
        self.items[booking.booking_reference] = booking


def _create_sample_interval(interval_repo: InMemoryIntervalRepo) -> Interval:
    today = date(2026, 3, 4)
    command = CreateIntervalCommand(
        date=today,
        start_time=time(9, 0),
        end_time=time(10, 0),
        today=today,
    )
    return create_interval(interval_repo, command)


def test_create_booking_rejects_second_active_booking() -> None:
    booking_repo = InMemoryBookingRepo()
    interval_repo = InMemoryIntervalRepo(booking_repo)
    interval = _create_sample_interval(interval_repo)

    create_booking(
        booking_repo,
        CreateBookingCommand(interval_id=interval.id),
    )

    with pytest.raises(IntervalAlreadyBookedError):
        create_booking(
            booking_repo,
            CreateBookingCommand(interval_id=interval.id),
        )


def test_delete_interval_rejects_when_active_booking_exists() -> None:
    booking_repo = InMemoryBookingRepo()
    interval_repo = InMemoryIntervalRepo(booking_repo)
    interval = _create_sample_interval(interval_repo)

    create_booking(
        booking_repo,
        CreateBookingCommand(interval_id=interval.id),
    )

    with pytest.raises(IntervalHasBookingsError):
        delete_interval(interval_repo, DeleteIntervalCommand(interval_id=interval.id))


def test_cancel_booking_allows_interval_deletion() -> None:
    booking_repo = InMemoryBookingRepo()
    interval_repo = InMemoryIntervalRepo(booking_repo)
    interval = _create_sample_interval(interval_repo)

    booking = create_booking(
        booking_repo,
        CreateBookingCommand(interval_id=interval.id),
    )

    cancel_booking(booking_repo, CancelBookingCommand(booking_reference=booking.booking_reference))
    delete_interval(interval_repo, DeleteIntervalCommand(interval_id=interval.id))

    assert interval_repo.get(interval.id) is None


def test_cancel_booking_is_idempotent_error() -> None:
    booking_repo = InMemoryBookingRepo()
    interval_repo = InMemoryIntervalRepo(booking_repo)
    interval = _create_sample_interval(interval_repo)

    booking = create_booking(
        booking_repo,
        CreateBookingCommand(interval_id=interval.id),
    )

    cancel_booking(booking_repo, CancelBookingCommand(booking_reference=booking.booking_reference))

    with pytest.raises(BookingAlreadyCanceledError):
        cancel_booking(
            booking_repo,
            CancelBookingCommand(booking_reference=booking.booking_reference),
        )
