from __future__ import annotations

import sqlite3
from datetime import date, time

from domain.common.errors import IntervalHasBookingsError, IntervalNotFoundError
from domain.interval.entities import Interval


class SqliteIntervalRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def add(self, interval: Interval) -> None:
        with self._conn:
            self._conn.execute(
                "INSERT INTO intervals (id, date, start_time, end_time) VALUES (?, ?, ?, ?)",
                (
                    interval.id,
                    interval.date.isoformat(),
                    interval.start_time.isoformat(timespec="minutes"),
                    interval.end_time.isoformat(timespec="minutes"),
                ),
            )

    def get(self, interval_id: str) -> Interval | None:
        row = self._conn.execute(
            "SELECT id, date, start_time, end_time FROM intervals WHERE id = ?",
            (interval_id,),
        ).fetchone()
        if row is None:
            return None
        return _row_to_interval(row)

    def list_by_date(self, target_date: date) -> list[Interval]:
        rows = self._conn.execute(
            "SELECT id, date, start_time, end_time FROM intervals WHERE date = ? ORDER BY start_time",
            (target_date.isoformat(),),
        ).fetchall()
        return [_row_to_interval(row) for row in rows]

    def list_between(self, start: date, end: date) -> list[Interval]:
        rows = self._conn.execute(
            """
            SELECT id, date, start_time, end_time
            FROM intervals
            WHERE date BETWEEN ? AND ?
            ORDER BY date, start_time
            """,
            (start.isoformat(), end.isoformat()),
        ).fetchall()
        return [_row_to_interval(row) for row in rows]

    def delete(self, interval_id: str) -> None:
        with self._conn:
            row = self._conn.execute(
                "SELECT id FROM intervals WHERE id = ?",
                (interval_id,),
            ).fetchone()
            if row is None:
                raise IntervalNotFoundError()

            active = self._conn.execute(
                "SELECT 1 FROM bookings WHERE interval_id = ? AND status = 'ACTIVE' LIMIT 1",
                (interval_id,),
            ).fetchone()
            if active is not None:
                raise IntervalHasBookingsError()

            self._conn.execute("DELETE FROM intervals WHERE id = ?", (interval_id,))


def _row_to_interval(row: sqlite3.Row) -> Interval:
    return Interval(
        id=row["id"],
        date=date.fromisoformat(row["date"]),
        start_time=time.fromisoformat(row["start_time"]),
        end_time=time.fromisoformat(row["end_time"]),
    )
