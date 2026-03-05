from __future__ import annotations

from collections.abc import Callable
from datetime import date

from fastapi import Depends
from sqlalchemy.engine import Engine

from config import settings as settings_module
from config.settings import Settings
from infrastructure.persistence.sqlalchemy.booking_repo import SqlAlchemyBookingRepository
from infrastructure.persistence.sqlalchemy.engine import get_engine as _get_engine
from infrastructure.persistence.sqlalchemy.interval_repo import SqlAlchemyIntervalRepository


def get_settings() -> Settings:
    return settings_module.settings


def get_engine(settings_obj: Settings = Depends(get_settings)) -> Engine:
    return _get_engine(settings_obj)


def get_interval_repo(engine: Engine = Depends(get_engine)) -> SqlAlchemyIntervalRepository:
    return SqlAlchemyIntervalRepository(engine)


def get_booking_repo(engine: Engine = Depends(get_engine)) -> SqlAlchemyBookingRepository:
    return SqlAlchemyBookingRepository(engine)


def get_today_provider() -> Callable[[], date]:
    return date.today
