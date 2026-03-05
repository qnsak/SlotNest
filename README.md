# SlotNest

SlotNest is a Web MVP booking system foundation using FastAPI (backend) and Vite + React (frontend). This stage is intentionally minimal and includes only the health endpoint and build tooling.

## Quick Start

```bash
make setup
make ci
```

## Run Backend

```bash
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

## Validate Project

```bash
make ci
```

## Future Deployment Model (Planned)

Releases with a `current` symlink, systemd service for the backend, nginx as reverse proxy, and SQLite for persistence.
