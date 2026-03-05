from datetime import date, time, timedelta

import pytest

from domain.common.errors import IntervalOverlapError, OutOfRangeError
from domain.interval.entities import Interval
from domain.interval import rules
from domain.common.time import add_months


def test_interval_within_three_months_accepts_bounds() -> None:
    today = date(2026, 3, 4)
    max_date = add_months(today, 3)

    rules.ensure_within_three_months(today, today)
    rules.ensure_within_three_months(max_date, today)


def test_interval_within_three_months_rejects_out_of_range() -> None:
    today = date(2026, 3, 4)
    too_early = date(2026, 3, 3)
    too_late = add_months(today, 3) + timedelta(days=1)

    with pytest.raises(OutOfRangeError):
        rules.ensure_within_three_months(too_early, today)

    with pytest.raises(OutOfRangeError):
        rules.ensure_within_three_months(too_late, today)


def test_interval_overlap_detection() -> None:
    target_date = date(2026, 3, 10)
    interval_a = Interval(
        id=1,
        date=target_date,
        start_time=time(10, 0),
        end_time=time(12, 0),
    )
    interval_b = Interval(
        id=2,
        date=target_date,
        start_time=time(11, 0),
        end_time=time(13, 0),
    )
    interval_c = Interval(
        id=3,
        date=target_date,
        start_time=time(12, 0),
        end_time=time(14, 0),
    )

    with pytest.raises(IntervalOverlapError):
        rules.ensure_no_overlap([interval_a], interval_b)

    rules.ensure_no_overlap([interval_a], interval_c)
