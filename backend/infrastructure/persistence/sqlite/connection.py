from __future__ import annotations

import sqlite3
from typing import Iterable

from config.settings import Settings


def connect(settings: Settings) -> sqlite3.Connection:
    conn = sqlite3.connect(settings.db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    _apply_pragmas(conn)
    return conn


def _apply_pragmas(conn: sqlite3.Connection) -> None:
    pragmas: Iterable[str] = (
        "PRAGMA journal_mode=WAL;",
        "PRAGMA busy_timeout=5000;",
        "PRAGMA foreign_keys=ON;",
        "PRAGMA synchronous=NORMAL;",
    )
    for pragma in pragmas:
        conn.execute(pragma)
