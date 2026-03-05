# DEPLOYMENT GUIDE

## 1. Deployment Model

Current recommended model:

- single VM/server
- FastAPI app served by Uvicorn (system service)
- reverse proxy via Nginx
- SQLite database file on persistent disk

## 2. Required Inputs

- application code on target host
- Python virtual environment
- environment variables (or `backend/.env`)
- writable directory for `DB_PATH`

Example env:

```env
DB_PATH=/var/lib/slotnest/slotnest.db
ADMIN_USERNAME=<strong-user>
ADMIN_PASSWORD=<strong-password>
DEBUG=false
AUTO_MIGRATE=false
```

## 3. Release Procedure

1. Fetch and checkout release commit/tag.
2. Install backend dependencies.
3. Run migrations (`alembic upgrade head` / `make migrate`).
4. Restart backend service.
5. Verify health endpoint.

## 4. Build and Install

From repo root:

```bash
make backend-install
```

Or directly:

```bash
backend/.venv/bin/pip install -r backend/requirements.txt
```

## 5. Database Migration in Deployment

Run before switching traffic:

```bash
make migrate
```

Policy:

- schema is migration-managed only
- production startup should not depend on `AUTO_MIGRATE`

## 6. Runtime Process

Uvicorn command example:

```bash
backend/.venv/bin/uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Use systemd/supervisor for process management and restart policy.

## 7. Reverse Proxy

Nginx should:

- terminate TLS
- proxy to backend Uvicorn endpoint
- set basic operational limits/timeouts

## 8. Post-Deploy Verification

- `GET /healthz` returns `{"status":"ok"}`
- admin endpoints require Basic Auth
- booking create/get/cancel path works with `booking_reference`
- logs show no migration/runtime errors

## 9. Rollback Strategy

If release fails:

1. rollback application code to previous known-good version
2. if migration is backward-compatible, keep DB at current schema
3. if non-compatible migration exists, require explicit rollback plan per migration

## 10. Operational Notes

- back up SQLite file regularly
- monitor disk usage and DB file growth
- rotate app/proxy logs
- rotate admin credentials periodically
