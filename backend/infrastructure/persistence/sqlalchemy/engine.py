from __future__ import annotations

from functools import lru_cache

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine

from config.settings import Settings


@lru_cache(maxsize=8)
def _build_engine(db_url: str) -> Engine:
    engine = create_engine(db_url, future=True)

    @event.listens_for(engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, connection_record) -> None:  # type: ignore[no-untyped-def]  # noqa: ARG001
        cursor = dbapi_connection.cursor()
        try:
            cursor.execute("PRAGMA journal_mode=WAL;")
            cursor.execute("PRAGMA busy_timeout=5000;")
            cursor.execute("PRAGMA foreign_keys=ON;")
            cursor.execute("PRAGMA synchronous=NORMAL;")
        finally:
            cursor.close()

    return engine


def get_engine(settings: Settings) -> Engine:
    return _build_engine(settings.db_url)
