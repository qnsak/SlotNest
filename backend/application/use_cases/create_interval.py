from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time

from domain.common.errors import InvalidIntervalTimeError
from domain.interval import rules
from domain.interval.entities import Interval
from domain.interval.repository import IntervalRepository


@dataclass
class CreateIntervalCommand:
    date: date
    start_time: time
    end_time: time
    today: date


def create_interval(repo: IntervalRepository, command: CreateIntervalCommand) -> Interval:
    if command.start_time >= command.end_time:
        raise InvalidIntervalTimeError("start_time must be before end_time")

    rules.ensure_within_three_months(command.date, command.today)

    existing = repo.list_by_date(command.date)
    interval = Interval(
        id=0,
        date=command.date,
        start_time=command.start_time,
        end_time=command.end_time,
    )
    rules.ensure_no_overlap(existing, interval)
    return repo.add(interval)
