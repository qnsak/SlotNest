from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv


@dataclass(frozen=True)
class Settings:
    db_path: Path
    admin_username: str
    admin_password: str
    admin_session_secret: str
    admin_session_ttl_seconds: int
    debug: bool
    auto_migrate: bool

    @classmethod
    def load(cls) -> "Settings":
        base_dir = Path(__file__).resolve().parents[2]
        dotenv_path = base_dir / "backend" / ".env"
        if dotenv_path.exists():
            load_dotenv(dotenv_path=dotenv_path, override=False)

        db_path_raw = _get_env("DB_PATH", default=str(base_dir / "backend" / ".data" / "slotnest.db"))
        db_path = Path(db_path_raw)
        if not db_path.is_absolute():
            db_path = base_dir / db_path

        db_path = db_path.resolve()
        db_path.parent.mkdir(parents=True, exist_ok=True)

        return cls(
            db_path=db_path,
            admin_username=_get_env("ADMIN_USERNAME", default="root"),
            admin_password=_get_env("ADMIN_PASSWORD", default="changeme"),
            admin_session_secret=_get_env("ADMIN_SESSION_SECRET", default="slotnest-dev-admin-session-secret"),
            admin_session_ttl_seconds=_get_env_int("ADMIN_SESSION_TTL_SECONDS", default=3600),
            debug=_get_env_bool("DEBUG", default=False),
            auto_migrate=_get_env_bool("AUTO_MIGRATE", default=False),
        )

    @property
    def db_url(self) -> str:
        return f"sqlite:///{self.db_path.as_posix()}"


def _get_env(key: str, default: str) -> str:
    return os.getenv(key, default)


def _get_env_bool(key: str, default: bool) -> bool:
    value = _get_env(key, default=str(default))
    return value.strip().lower() in {"1", "true", "yes", "y", "on"}


def _get_env_int(key: str, default: int) -> int:
    value = _get_env(key, default=str(default))
    try:
        return int(value)
    except ValueError:
        return default


settings = Settings.load()
