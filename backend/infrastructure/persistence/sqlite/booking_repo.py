from __future__ import annotations

import sqlite3
from datetime import date

from domain.booking.entities import Booking
from domain.common.errors import IntervalAlreadyBookedError


class SqliteBookingRepository:
    def __init__(self, conn: sqlite3.Connection) -> None:
        self._conn = conn

    def add(self, booking: Booking) -> None:
        with self._conn:
            active = self._conn.execute(
                "SELECT 1 FROM bookings WHERE interval_id = ? AND status = 'ACTIVE' LIMIT 1",
                (booking.interval_id,),
            ).fetchone()
            if active is not None:
                raise IntervalAlreadyBookedError()

            self._conn.execute(
                """
                INSERT INTO bookings (id, interval_id, booking_reference, status)
                VALUES (?, ?, ?, ?)
                """,
                (
                    booking.id,
                    booking.interval_id,
                    booking.booking_reference,
                    booking.status,
                ),
            )

    def get_by_reference(self, booking_reference: str) -> Booking | None:
        row = self._conn.execute(
            """
            SELECT id, interval_id, booking_reference, status
            FROM bookings
            WHERE booking_reference = ?
            """,
            (booking_reference,),
        ).fetchone()
        if row is None:
            return None
        return _row_to_booking(row)

    def list_by_interval(self, interval_id: str) -> list[Booking]:
        rows = self._conn.execute(
            """
            SELECT id, interval_id, booking_reference, status
            FROM bookings
            WHERE interval_id = ?
            ORDER BY created_at
            """,
            (interval_id,),
        ).fetchall()
        return [_row_to_booking(row) for row in rows]

    def list_by_date(self, target_date: date) -> list[Booking]:
        rows = self._conn.execute(
            """
            SELECT b.id, b.interval_id, b.booking_reference, b.status
            FROM bookings b
            JOIN intervals i ON i.id = b.interval_id
            WHERE i.date = ?
            ORDER BY i.start_time
            """,
            (target_date.isoformat(),),
        ).fetchall()
        return [_row_to_booking(row) for row in rows]

    def save(self, booking: Booking) -> None:
        with self._conn:
            self._conn.execute(
                """
                UPDATE bookings
                SET status = ?,
                    canceled_at = CASE WHEN ? = 'CANCELED' THEN CURRENT_TIMESTAMP ELSE canceled_at END
                WHERE booking_reference = ?
                """,
                (booking.status, booking.status, booking.booking_reference),
            )


def _row_to_booking(row: sqlite3.Row) -> Booking:
    return Booking(
        id=row["id"],
        interval_id=row["interval_id"],
        booking_reference=row["booking_reference"],
        status=row["status"],
    )
