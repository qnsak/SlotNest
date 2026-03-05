from __future__ import annotations

from sqlalchemy import ForeignKey, Index, Integer, MetaData, Table, Column, Text
from sqlalchemy.sql import expression

metadata = MetaData()

availability_intervals = Table(
    "availability_intervals",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("date", Text, nullable=False),
    Column("start_time", Text, nullable=False),
    Column("end_time", Text, nullable=False),
    Column("created_at", Text, nullable=False),
    sqlite_autoincrement=True,
)

bookings = Table(
    "bookings",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column(
        "interval_id",
        Integer,
        ForeignKey("availability_intervals.id", ondelete="RESTRICT"),
        nullable=False,
    ),
    Column("booking_reference", Text, nullable=False, unique=True),
    Column("status", Text, nullable=False),
    Column("created_at", Text, nullable=False),
    Column("canceled_at", Text, nullable=True),
    sqlite_autoincrement=True,
)

Index("ix_availability_intervals_date", availability_intervals.c.date)
Index("ix_bookings_interval_id", bookings.c.interval_id)
Index("ix_bookings_status", bookings.c.status)
Index(
    "ux_bookings_active_interval",
    bookings.c.interval_id,
    unique=True,
    sqlite_where=expression.text("status = 'ACTIVE'"),
)
