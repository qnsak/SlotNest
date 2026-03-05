from __future__ import annotations

from dataclasses import dataclass
from datetime import date

from domain.interval.entities import Interval
from domain.interval.repository import IntervalRepository


@dataclass(frozen=True)
class ListIntervalsCommand:
    from_date: date
    to_date: date


def list_intervals(repo: IntervalRepository, command: ListIntervalsCommand) -> list[Interval]:
    return repo.list_between(command.from_date, command.to_date)
