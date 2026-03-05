from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import case, insert, select, update
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError

from domain.booking.entities import STATUS_CANCELED, Booking
from domain.booking.reference import generate_reference
from domain.common.errors import IntervalAlreadyBookedError, IntervalNotFoundError
from infrastructure.persistence.sqlalchemy.tables import availability_intervals, bookings


class SqlAlchemyBookingRepository:
    def __init__(self, engine: Engine) -> None:
        self._engine = engine

    def create_for_interval(self, interval_id: int) -> Booking:
        created_at = datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat()
        with self._engine.begin() as conn:
            exists = conn.execute(
                select(availability_intervals.c.id).where(availability_intervals.c.id == interval_id)
            ).scalar_one_or_none()
            if exists is None:
                raise IntervalNotFoundError()

            active_exists = conn.execute(
                select(bookings.c.id)
                .where(bookings.c.interval_id == interval_id)
                .where(bookings.c.status == "ACTIVE")
                .limit(1)
            ).scalar_one_or_none()
            if active_exists is not None:
                raise IntervalAlreadyBookedError()

            booking_reference = generate_reference()
            try:
                result = conn.execute(
                    insert(bookings).values(
                        interval_id=interval_id,
                        booking_reference=booking_reference,
                        status="ACTIVE",
                        created_at=created_at,
                        canceled_at=None,
                    )
                )
            except IntegrityError as exc:
                if "ux_bookings_active_interval" in str(exc.orig):
                    raise IntervalAlreadyBookedError() from exc
                raise

            booking_id = int(result.inserted_primary_key[0])

        return Booking(
            id=booking_id,
            interval_id=interval_id,
            booking_reference=booking_reference,
            status="ACTIVE",
        )

    def get_by_reference(self, booking_reference: str) -> Booking | None:
        with self._engine.connect() as conn:
            row = conn.execute(
                select(
                    bookings.c.id,
                    bookings.c.interval_id,
                    bookings.c.booking_reference,
                    bookings.c.status,
                ).where(bookings.c.booking_reference == booking_reference)
            ).mappings().one_or_none()
        if row is None:
            return None
        return _row_to_booking(row)

    def list_by_interval(self, interval_id: int) -> list[Booking]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                select(
                    bookings.c.id,
                    bookings.c.interval_id,
                    bookings.c.booking_reference,
                    bookings.c.status,
                )
                .where(bookings.c.interval_id == interval_id)
                .order_by(bookings.c.created_at)
            ).mappings().all()
        return [_row_to_booking(row) for row in rows]

    def list_by_date(self, target_date: date) -> list[Booking]:
        with self._engine.connect() as conn:
            rows = conn.execute(
                select(
                    bookings.c.id,
                    bookings.c.interval_id,
                    bookings.c.booking_reference,
                    bookings.c.status,
                )
                .select_from(bookings.join(availability_intervals, bookings.c.interval_id == availability_intervals.c.id))
                .where(availability_intervals.c.date == target_date.isoformat())
                .order_by(availability_intervals.c.start_time)
            ).mappings().all()
        return [_row_to_booking(row) for row in rows]

    def exists_active_by_interval(self, interval_id: int) -> bool:
        with self._engine.connect() as conn:
            value = conn.execute(
                select(bookings.c.id)
                .where(bookings.c.interval_id == interval_id)
                .where(bookings.c.status == "ACTIVE")
                .limit(1)
            ).scalar_one_or_none()
        return value is not None

    def save(self, booking: Booking) -> None:
        canceled_at = datetime.now(tz=timezone.utc).replace(microsecond=0).isoformat()
        with self._engine.begin() as conn:
            conn.execute(
                update(bookings)
                .where(bookings.c.booking_reference == booking.booking_reference)
                .values(
                    status=booking.status,
                    canceled_at=case(
                        (bookings.c.status != STATUS_CANCELED, canceled_at),
                        else_=bookings.c.canceled_at,
                    ),
                )
            )


def _row_to_booking(row) -> Booking:
    return Booking(
        id=int(row["id"]),
        interval_id=int(row["interval_id"]),
        booking_reference=row["booking_reference"],
        status=row["status"],
    )
