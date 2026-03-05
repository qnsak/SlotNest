from __future__ import annotations

from collections.abc import Callable
from datetime import date, time

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from application.use_cases.cancel_booking import CancelBookingCommand, cancel_booking
from application.use_cases.create_interval import CreateIntervalCommand, create_interval
from application.use_cases.delete_interval import DeleteIntervalCommand, delete_interval
from application.use_cases.list_bookings import ListBookingsByDateCommand, list_bookings_by_date
from application.use_cases.list_intervals import ListIntervalsCommand, list_intervals
from infrastructure.persistence.sqlalchemy.booking_repo import SqlAlchemyBookingRepository
from infrastructure.persistence.sqlalchemy.interval_repo import SqlAlchemyIntervalRepository
from interfaces.api.admin_auth import require_admin
from interfaces.api.deps import get_booking_repo, get_interval_repo, get_today_provider

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


class IntervalCreateRequest(BaseModel):
    date: date
    start_time: time
    end_time: time


class IntervalResponse(BaseModel):
    id: int
    date: date
    start_time: time
    end_time: time


class BookingResponse(BaseModel):
    booking_reference: str
    interval_id: int
    status: str


@router.post("/intervals", response_model=IntervalResponse)
def create_interval_endpoint(
    payload: IntervalCreateRequest,
    interval_repo: SqlAlchemyIntervalRepository = Depends(get_interval_repo),
    today_provider: Callable[[], date] = Depends(get_today_provider),
) -> IntervalResponse:
    interval = create_interval(
        interval_repo,
        CreateIntervalCommand(
            date=payload.date,
            start_time=payload.start_time,
            end_time=payload.end_time,
            today=today_provider(),
        ),
    )
    return IntervalResponse(
        id=interval.id,
        date=interval.date,
        start_time=interval.start_time,
        end_time=interval.end_time,
    )


@router.get("/intervals", response_model=list[IntervalResponse])
def list_intervals_endpoint(
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    interval_repo: SqlAlchemyIntervalRepository = Depends(get_interval_repo),
) -> list[IntervalResponse]:
    intervals = list_intervals(interval_repo, ListIntervalsCommand(from_date=from_date, to_date=to_date))
    return [
        IntervalResponse(
            id=interval.id,
            date=interval.date,
            start_time=interval.start_time,
            end_time=interval.end_time,
        )
        for interval in intervals
    ]


@router.delete("/intervals/{interval_id}")
def delete_interval_endpoint(
    interval_id: int,
    interval_repo: SqlAlchemyIntervalRepository = Depends(get_interval_repo),
) -> dict[str, str]:
    delete_interval(interval_repo, DeleteIntervalCommand(interval_id=interval_id))
    return {"status": "ok"}


@router.get("/bookings", response_model=list[BookingResponse])
def list_bookings_endpoint(
    target_date: date = Query(..., alias="date"),
    booking_repo: SqlAlchemyBookingRepository = Depends(get_booking_repo),
) -> list[BookingResponse]:
    bookings = list_bookings_by_date(booking_repo, ListBookingsByDateCommand(target_date=target_date))
    return [
        BookingResponse(
            booking_reference=booking.booking_reference,
            interval_id=booking.interval_id,
            status=booking.status,
        )
        for booking in bookings
    ]


@router.post("/bookings/{booking_reference}/cancel", response_model=BookingResponse)
def cancel_booking_endpoint(
    booking_reference: str,
    booking_repo: SqlAlchemyBookingRepository = Depends(get_booking_repo),
) -> BookingResponse:
    booking = cancel_booking(booking_repo, CancelBookingCommand(booking_reference=booking_reference))
    return BookingResponse(
        booking_reference=booking.booking_reference,
        interval_id=booking.interval_id,
        status=booking.status,
    )
