from __future__ import annotations

import importlib
from datetime import date, timedelta
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from domain.common.time import add_months


def _run_migrations() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    cfg = Config(str(backend_dir / "alembic.ini"))
    cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    command.upgrade(cfg, "head")


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "slotnest.db"
    monkeypatch.setenv("DB_PATH", str(db_path))
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_PASSWORD", "secret")
    monkeypatch.setenv("DEBUG", "false")
    monkeypatch.setenv("AUTO_MIGRATE", "false")

    import config.settings as settings_module

    importlib.reload(settings_module)
    _run_migrations()

    import app.main as main_module

    importlib.reload(main_module)

    with TestClient(main_module.app) as test_client:
        yield test_client


def _admin_login(client: TestClient) -> None:
    response = client.post("/admin/login", json={"username": "admin", "password": "secret"})
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def _create_interval(client: TestClient, target_date: date) -> int:
    _admin_login(client)
    response = client.post(
        "/admin/intervals",
        json={
            "date": target_date.isoformat(),
            "start_time": "09:00",
            "end_time": "10:00",
        },
    )
    assert response.status_code == 200
    return response.json()["id"]


def test_admin_requires_basic_auth(client: TestClient) -> None:
    response = client.get("/admin/intervals?from=2026-03-04&to=2026-03-05")
    assert response.status_code == 401
    assert response.json()["code"] == "UNAUTHORIZED"


def test_create_interval_and_reject_overlap(client: TestClient) -> None:
    today = date.today()

    interval_id = _create_interval(client, today)
    assert interval_id > 0

    _admin_login(client)
    response = client.post(
        "/admin/intervals",
        json={
            "date": today.isoformat(),
            "start_time": "09:30",
            "end_time": "10:30",
        },
    )
    assert response.status_code == 409
    assert response.json()["code"] == "INTERVAL_OVERLAP"


def test_create_interval_out_of_range(client: TestClient) -> None:
    today = date.today()
    too_late = add_months(today, 3) + timedelta(days=1)

    _admin_login(client)
    response = client.post(
        "/admin/intervals",
        json={
            "date": too_late.isoformat(),
            "start_time": "09:00",
            "end_time": "10:00",
        },
    )
    assert response.status_code == 409
    assert response.json()["code"] == "OUT_OF_RANGE"


def test_create_interval_invalid_time_range(client: TestClient) -> None:
    today = date.today()

    _admin_login(client)
    response = client.post(
        "/admin/intervals",
        json={
            "date": today.isoformat(),
            "start_time": "10:00",
            "end_time": "09:00",
        },
    )
    assert response.status_code == 400
    body = response.json()
    assert body["code"] == "INVALID_INTERVAL_TIME"
    assert body["message"] == "start_time must be before end_time"


def test_create_booking_and_reject_second_booking(client: TestClient) -> None:
    today = date.today()
    interval_id = _create_interval(client, today)

    response = client.post("/bookings", json={"interval_id": interval_id})
    assert response.status_code == 200
    booking_reference = response.json()["booking_reference"]

    response = client.post("/bookings", json={"interval_id": interval_id})
    assert response.status_code == 409
    assert response.json()["code"] == "INTERVAL_ALREADY_BOOKED"

    assert booking_reference


def test_delete_interval_blocked_when_active_booking_exists(client: TestClient) -> None:
    today = date.today()
    interval_id = _create_interval(client, today)
    client.post("/bookings", json={"interval_id": interval_id})

    _admin_login(client)
    response = client.delete(f"/admin/intervals/{interval_id}")
    assert response.status_code == 409
    assert response.json()["code"] == "INTERVAL_HAS_BOOKINGS"


def test_booking_get_and_cancel(client: TestClient) -> None:
    today = date.today()
    interval_id = _create_interval(client, today)

    response = client.post("/bookings", json={"interval_id": interval_id})
    booking_reference = response.json()["booking_reference"]

    get_response = client.get(f"/bookings/{booking_reference}")
    assert get_response.status_code == 200
    assert get_response.json()["status"] == "ACTIVE"

    cancel_response = client.post(f"/bookings/{booking_reference}/cancel")
    assert cancel_response.status_code == 200
    assert cancel_response.json()["status"] == "CANCELED"

    get_response = client.get(f"/bookings/{booking_reference}")
    assert get_response.json()["status"] == "CANCELED"
