# SlotNest

SlotNest is a booking MVP with:

- Backend: FastAPI + SQLite + Alembic + SQLAlchemy Core (no ORM)
- Frontend: React + Vite
- Architecture: lightweight DDD boundaries (`domain` / `application` are framework-agnostic)

Primary product/API spec lives in [`docs/spec.md`](docs/spec.md). Public booking identifier decisions live in [`docs/adr/0001-public-identifier-booking-reference.md`](docs/adr/0001-public-identifier-booking-reference.md).

## Project Structure

- `backend/`: API, domain/application layers, persistence, migrations, tests
- `frontend/`: web UI (Vite)
- `docs/`: specs and ADRs

Key backend directories:

- `backend/app/`: FastAPI app entrypoint
- `backend/config/`: centralized settings loader
- `backend/domain/`: pure domain logic and errors
- `backend/application/use_cases/`: use-case orchestration
- `backend/infrastructure/persistence/sqlalchemy/`: SQLAlchemy Core repositories
- `backend/alembic/`: migration config and revisions
- `backend/tests/`: pytest suite

## Quick Start

```bash
make setup
make migrate
make backend-run
```

Health check:

```bash
curl http://127.0.0.1:8000/healthz
```

Expected response:

```json
{"status":"ok"}
```

## Common Commands

```bash
make backend-lint
make backend-test
make migrate
make revision m="add booking note"
make ci
```

`make ci` runs: backend lint/test + frontend lint/build.

## Backend Environment Variables

Configure in `backend/.env` (optional in dev). Loaded only by `backend/config/settings.py`.

- `DB_PATH` (default: `backend/.data/slotnest.db`)
- `ADMIN_USERNAME` (default: `root`)
- `ADMIN_PASSWORD` (default: `changeme`)
- `DEBUG` (default: `false`)
- `AUTO_MIGRATE` (default: `false`)

Notes:

- `DB_PATH` parent directory is auto-created.
- Database URL is derived as `sqlite:///<absolute-path>`.
- In production, keep `AUTO_MIGRATE=false` and run migrations explicitly.

## Migration Policy

- Runtime must not auto-create tables.
- Schema changes must go through Alembic revisions.
- Apply schema with `make migrate`.

Current baseline migration creates:

- `availability_intervals`
- `bookings`
- FK/unique/index constraints (including one ACTIVE booking per interval)

## API Overview

System:

- `GET /healthz`

User:

- `GET /intervals?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `POST /bookings`
- `GET /bookings/{booking_reference}`
- `POST /bookings/{booking_reference}/cancel`

Admin (HTTP Basic Auth):

- `POST /admin/intervals`
- `GET /admin/intervals?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `DELETE /admin/intervals/{interval_id}`
- `GET /admin/bookings?date=YYYY-MM-DD`
- `POST /admin/bookings/{booking_reference}/cancel`

`booking_reference` is the public identifier for booking get/cancel flows.

## Error Contract

All API errors use a unified envelope:

```json
{
  "code": "...",
  "message": "...",
  "details": {}
}
```

Examples:

- `UNAUTHORIZED` -> 401
- `*_NOT_FOUND` -> 404
- business rule conflicts (`INTERVAL_OVERLAP`, `INTERVAL_ALREADY_BOOKED`, `INTERVAL_HAS_BOOKINGS`, `BOOKING_ALREADY_CANCELED`, `OUT_OF_RANGE`) -> 409

## Development Workflow

Branch strategy (current recommendation):

- `main`: deployable trunk
- `feature/*`: normal work
- `hotfix/*`: urgent fixes from `main`

Commit strategy:

- Keep commits small and reversible.
- Validate each step with:

```bash
make backend-lint backend-test
```
