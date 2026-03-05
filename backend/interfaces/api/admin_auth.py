from __future__ import annotations

import base64
import hashlib
import hmac
import json
import secrets
import time

from fastapi import Depends, HTTPException, Request, status

from config.settings import Settings
from interfaces.api.deps import get_settings

ADMIN_SESSION_COOKIE = "slotnest_admin_session"


def verify_admin_credentials(username: str, password: str, settings: Settings) -> bool:
    username_ok = secrets.compare_digest(username, settings.admin_username)
    password_ok = secrets.compare_digest(password, settings.admin_password)
    return username_ok and password_ok


def create_admin_session_token(username: str, settings: Settings) -> str:
    payload = {
        "username": username,
        "exp": int(time.time()) + settings.admin_session_ttl_seconds,
    }
    payload_bytes = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
    signature = hmac.new(
        settings.admin_session_secret.encode("utf-8"),
        payload_b64.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()
    return f"{payload_b64}.{signature}"


def _verify_admin_session_token(token: str, settings: Settings) -> bool:
    try:
        payload_b64, signature = token.split(".", maxsplit=1)
    except ValueError:
        return False

    expected = hmac.new(
        settings.admin_session_secret.encode("utf-8"),
        payload_b64.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()

    if not secrets.compare_digest(signature, expected):
        return False

    padding = "=" * (-len(payload_b64) % 4)
    try:
        payload_raw = base64.urlsafe_b64decode((payload_b64 + padding).encode("utf-8"))
        payload = json.loads(payload_raw.decode("utf-8"))
    except (ValueError, json.JSONDecodeError):
        return False

    exp = payload.get("exp")
    username = payload.get("username")
    if not isinstance(exp, int) or not isinstance(username, str):
        return False

    if exp < int(time.time()):
        return False

    return secrets.compare_digest(username, settings.admin_username)


def require_admin_session(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> None:
    token = request.cookies.get(ADMIN_SESSION_COOKIE)
    if not token or not _verify_admin_session_token(token, settings):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED",
        )


def build_admin_cookie_kwargs(settings: Settings, *, secure: bool) -> dict[str, object]:
    return {
        "key": ADMIN_SESSION_COOKIE,
        "httponly": True,
        "samesite": "lax",
        "secure": secure,
        "path": "/admin",
        "max_age": settings.admin_session_ttl_seconds,
    }


def require_admin_basic_for_bootstrap(
    username: str,
    password: str,
    settings: Settings,
) -> None:
    if not verify_admin_credentials(username, password, settings):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="UNAUTHORIZED")
