from __future__ import annotations

from datetime import date

from domain.common import time as time_utils
from domain.common.errors import IntervalOverlapError, OutOfRangeError
from domain.interval.entities import Interval


def ensure_within_three_months(target: date, today: date) -> None:
    max_date = time_utils.add_months(today, 3)
    if target < today or target > max_date:
        raise OutOfRangeError()


def overlaps(a: Interval, b: Interval) -> bool:
    if a.date != b.date:
        return False
    return a.start_time < b.end_time and b.start_time < a.end_time


def ensure_no_overlap(existing: list[Interval], candidate: Interval) -> None:
    for interval in existing:
        if overlaps(interval, candidate):
            raise IntervalOverlapError()
