from __future__ import annotations

from datetime import date
from typing import Protocol

from domain.interval.entities import Interval


class IntervalRepository(Protocol):
    def add(self, interval: Interval) -> Interval: ...

    def get(self, interval_id: int) -> Interval | None: ...

    def list_by_date(self, target_date: date) -> list[Interval]: ...

    def list_between(self, start: date, end: date) -> list[Interval]: ...

    def delete(self, interval_id: int) -> None: ...
