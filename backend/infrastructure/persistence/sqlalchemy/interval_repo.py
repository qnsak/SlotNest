from __future__ import annotations

from datetime import date, datetime, time, timezone

from sqlalchemy import delete, insert, select
from sqlalchemy.engine import Engine

from domain.common.errors import IntervalHasBookingsError, IntervalNotFoundError
from domain.interval.entities import Interval
from infrastructure.persistence.sqlalchemy.tables import availability_intervals, bookings


class SqlAlchemyIntervalRepository:
    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def add(self, interval: Interval) -> Interval:
        created_at = datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat()
        with self._engine.begin() as conn:
            result = conn.execute(
                insert(availability_intervals).values(
                    date=interval.date.isoformat(),
                    start_time=interval.start_time.isoformat(timespec="minutes"),
                    end_time=interval.end_time.isoformat(timespec="minutes"),
                    created_at=created_at,
                )
            )
            interval_id = int(result.inserted_primary_key[0])
        return Interval(
            id=interval_id,
            date=interval.date,
            start_time=interval.start_time,
            end_time=interval.end_time,
        )

    def get(self, interval_id: int) -> Interval | None:
        with self._engine.connect() as conn:
            row = conn.execute(
                select(
                    availability_intervals.c.id,
                    availability_intervals.c.date,
                    availability_intervals.c.start_time,
                    availability_intervals.c.end_time,
                ).where(availability_intervals.c.id == interval_id)
            ).mappings().one_or_none()
        if row is None:
            return None
        return _row_to_interval(row)

    def list_by_date(self, target_date: date) -> list[Interval]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                select(
                    availability_intervals.c.id,
                    availability_intervals.c.date,
                    availability_intervals.c.start_time,
                    availability_intervals.c.end_time,
                )
                .where(availability_intervals.c.date == target_date.isoformat())
                .order_by(availability_intervals.c.start_time)
            ).mappings().all()
        return [_row_to_interval(row) for row in rows]

    def list_between(self, start: date, end: date) -> list[Interval]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                select(
                    availability_intervals.c.id,
                    availability_intervals.c.date,
                    availability_intervals.c.start_time,
                    availability_intervals.c.end_time,
                )
                .where(availability_intervals.c.date.between(start.isoformat(), end.isoformat()))
                .order_by(availability_intervals.c.date, availability_intervals.c.start_time)
            ).mappings().all()
        return [_row_to_interval(row) for row in rows]

    def delete(self, interval_id: int) -> None:
        with self._engine.begin() as conn:
            exists = conn.execute(
                select(availability_intervals.c.id).where(availability_intervals.c.id == interval_id)
            ).scalar_one_or_none()
            if exists is None:
                raise IntervalNotFoundError()

            active_booking = conn.execute(
                select(bookings.c.id)
                .where(bookings.c.interval_id == interval_id)
                .where(bookings.c.status == "ACTIVE")
                .limit(1)
            ).scalar_one_or_none()
            if active_booking is not None:
                raise IntervalHasBookingsError()

            conn.execute(delete(availability_intervals).where(availability_intervals.c.id == interval_id))


def _row_to_interval(row) -> Interval:
    return Interval(
        id=int(row["id"]),
        date=date.fromisoformat(row["date"]),
        start_time=time.fromisoformat(row["start_time"]),
        end_time=time.fromisoformat(row["end_time"]),
    )
