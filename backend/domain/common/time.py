from __future__ import annotations

import calendar
from datetime import date


def add_months(value: date, months: int) -> date:
    if months == 0:
        return value

    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    last_day = calendar.monthrange(year, month)[1]
    day = min(value.day, last_day)
    return date(year, month, day)
