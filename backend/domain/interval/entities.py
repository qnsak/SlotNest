from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time


@dataclass(frozen=True)
class Interval:
    id: int
    date: date
    start_time: time
    end_time: time
