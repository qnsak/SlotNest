from __future__ import annotations

import importlib

from fastapi.testclient import TestClient


def test_healthz_returns_ok(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("DB_PATH", str(tmp_path / "slotnest.db"))
    monkeypatch.setenv("AUTO_MIGRATE", "false")

    import config.settings as settings_module

    importlib.reload(settings_module)

    import app.main as main_module

    importlib.reload(main_module)

    client = TestClient(main_module.app)
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
