from __future__ import annotations

import sqlite3


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS intervals (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id TEXT PRIMARY KEY,
            interval_id TEXT NOT NULL,
            booking_reference TEXT NOT NULL UNIQUE,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            canceled_at TEXT,
            FOREIGN KEY(interval_id) REFERENCES intervals(id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_intervals_date ON intervals(date);
        CREATE INDEX IF NOT EXISTS idx_bookings_interval ON bookings(interval_id);
        CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_active_interval
            ON bookings(interval_id)
            WHERE status = 'ACTIVE';
        """
    )
