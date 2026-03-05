from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from alembic import command
from alembic.config import Config
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from config import settings as settings_module
from domain.common.errors import DomainError
from interfaces.api.routes_admin import router as admin_router
from interfaces.api.routes_user import router as user_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    loaded = settings_module.Settings.load()
    settings_module.settings = loaded
    app.debug = loaded.debug

    if loaded.auto_migrate:
        _run_migrations()
    yield


app = FastAPI(
    title="SlotNest API",
    version="0.1.0",
    debug=settings_module.settings.debug,
    lifespan=lifespan,
)


def _run_migrations() -> None:
    backend_dir = Path(__file__).resolve().parents[1]
    alembic_ini = backend_dir / "alembic.ini"
    cfg = Config(str(alembic_ini))
    cfg.set_main_option("script_location", str(backend_dir / "alembic"))
    command.upgrade(cfg, "head")


@app.exception_handler(DomainError)
def handle_domain_error(request: Request, exc: DomainError) -> JSONResponse:  # noqa: ARG001
    status_map = {
        "OUT_OF_RANGE": status.HTTP_409_CONFLICT,
        "INTERVAL_OVERLAP": status.HTTP_409_CONFLICT,
        "INTERVAL_ALREADY_BOOKED": status.HTTP_409_CONFLICT,
        "INTERVAL_HAS_BOOKINGS": status.HTTP_409_CONFLICT,
        "BOOKING_ALREADY_CANCELED": status.HTTP_409_CONFLICT,
        "INVALID_INTERVAL_TIME": status.HTTP_400_BAD_REQUEST,
        "INTERVAL_NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "BOOKING_NOT_FOUND": status.HTTP_404_NOT_FOUND,
    }
    http_status = status_map.get(exc.code, status.HTTP_400_BAD_REQUEST)
    return JSONResponse(status_code=http_status, content={"code": exc.code, "message": str(exc)})


@app.exception_handler(HTTPException)
def handle_http_exception(request: Request, exc: HTTPException) -> JSONResponse:  # noqa: ARG001
    code = "UNAUTHORIZED" if exc.status_code == status.HTTP_401_UNAUTHORIZED else "HTTP_ERROR"
    message = exc.detail if isinstance(exc.detail, str) else code
    if isinstance(exc.detail, dict):
        detail_code = exc.detail.get("code")
        detail_message = exc.detail.get("message")
        code = detail_code if isinstance(detail_code, str) else code
        message = detail_message if isinstance(detail_message, str) else message
        payload = {"code": code, "message": message}
        detail_extra = exc.detail.get("details")
        if isinstance(detail_extra, dict):
            payload["details"] = detail_extra
        return JSONResponse(status_code=exc.status_code, content=payload)
    payload = {"code": code, "message": message}
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.exception_handler(RequestValidationError)
def handle_validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:  # noqa: ARG001
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "code": "VALIDATION_ERROR",
            "message": "Invalid request",
            "details": {"errors": exc.errors()},
        },
    )


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(user_router)
app.include_router(admin_router)
