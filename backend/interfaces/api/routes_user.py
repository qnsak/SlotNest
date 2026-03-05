from __future__ import annotations

from datetime import date, time

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel

from application.use_cases.cancel_booking import CancelBookingCommand, cancel_booking
from application.use_cases.create_booking import CreateBookingCommand, create_booking
from application.use_cases.get_booking import GetBookingCommand, get_booking
from application.use_cases.list_intervals import ListIntervalsCommand, list_intervals
from infrastructure.persistence.sqlalchemy.booking_repo import SqlAlchemyBookingRepository
from infrastructure.persistence.sqlalchemy.interval_repo import SqlAlchemyIntervalRepository
from interfaces.api.deps import get_booking_repo, get_interval_repo

router = APIRouter(tags=["user"])


class IntervalResponse(BaseModel):
    id: int
    date: date
    start_time: time
    end_time: time


class BookingCreateRequest(BaseModel):
    interval_id: int


class BookingResponse(BaseModel):
    booking_reference: str
    interval_id: int
    status: str


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


@router.post("/bookings", response_model=BookingResponse)
def create_booking_endpoint(
    payload: BookingCreateRequest,
    booking_repo: SqlAlchemyBookingRepository = Depends(get_booking_repo),
) -> BookingResponse:
    booking = create_booking(booking_repo, CreateBookingCommand(interval_id=payload.interval_id))
    return BookingResponse(
        booking_reference=booking.booking_reference,
        interval_id=booking.interval_id,
        status=booking.status,
    )


@router.get("/bookings/{booking_reference}", response_model=BookingResponse)
def get_booking_endpoint(
    booking_reference: str,
    booking_repo: SqlAlchemyBookingRepository = Depends(get_booking_repo),
) -> BookingResponse:
    booking = get_booking(booking_repo, GetBookingCommand(booking_reference=booking_reference))
    return BookingResponse(
        booking_reference=booking.booking_reference,
        interval_id=booking.interval_id,
        status=booking.status,
    )


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
