from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta

from domain.booking.repository import BookingRepository
from domain.common.time import add_months
from domain.interval.entities import Interval
from domain.interval.repository import IntervalRepository


@dataclass(frozen=True)
class ListAvailableIntervalsCommand:
    today: date
    from_date: date | None = None
    to_date: date | None = None


def list_available_intervals(
    interval_repo: IntervalRepository,
    booking_repo: BookingRepository,
    command: ListAvailableIntervalsCommand,
) -> list[Interval]:
    if command.from_date is None and command.to_date is None:
        from_date = command.today + timedelta(days=1)
        to_date = add_months(command.today, 3)
    else:
        from_date = command.from_date
        to_date = command.to_date

    if from_date is None or to_date is None:
        return []

    intervals = interval_repo.list_between(from_date, to_date)
    return [
        interval
        for interval in intervals
        if interval.date > command.today and not booking_repo.exists_active_by_interval(interval.id)
    ]
