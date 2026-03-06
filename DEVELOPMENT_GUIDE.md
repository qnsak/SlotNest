# DEVELOPMENT GUIDE

## 1. Prerequisites

- Python 3.14+
- Node.js + npm
- Unix-like shell

## 2. Initial Setup

```bash
make setup
```

This creates backend virtualenv, installs backend deps, and installs frontend deps.

## 3. Local Development Workflow

### 3.1 Configure environment

Optional `backend/.env` values:

```env
DB_PATH=backend/.data/slotnest.db
ADMIN_USERNAME=root
ADMIN_PASSWORD=changeme
DEBUG=false
AUTO_MIGRATE=false
```

### 3.2 Apply schema

```bash
make migrate
```

### 3.3 Run backend

```bash
make backend-run
```

### 3.4 Validate changes

```bash
make backend-lint
make backend-test
```

Full CI locally:

```bash
make ci
```

## 4. Migrations

Create a new revision:

```bash
make revision m="describe change"
```

Apply latest:

```bash
make migrate
```

Rules:

- do not introduce runtime `CREATE TABLE IF NOT EXISTS`
- always represent schema changes with Alembic revisions

## 5. Backend Coding Rules

- keep `domain` and `application` framework-agnostic
- keep business rules out of FastAPI routes
- use SQLAlchemy Core only (no ORM models/sessions)
- use `booking_reference` as public booking identifier
- keep API error envelope consistent

## 6. Testing Conventions

- use deterministic tests for domain rules
- API tests use `TestClient`, no live server
- for DB tests: migrate schema first, never rely on auto-create
- naming should map to acceptance criteria where possible

## 7. Frontend UI Conventions

Header/navigation rules (implemented in `frontend/src/app/layout/UserLayout.tsx` and `frontend/src/index.css`):

- Brand is the strongest hierarchy element:
  - primary text: `SlotNest`
  - secondary text: `預約` / `Booking`
- Primary navigation contains only core routes (`首頁`, `預約查詢`).
- Language switcher is a compact utility control on the right; do not render standalone "語言" text in header layout.
- Active route state is driven by `NavLink` (`is-active` class).
- Keep hover and active styles subtle; avoid heavy decorative effects.
- Keep keyboard accessibility with `:focus-visible` styles for nav links and language selector.

Header sizing/layout:

- Desktop header height: `64px`; mobile: `60px`.
- Shared container width token: `--sn-container-max` for both header and main content.
- Header is sticky (`position: sticky; top: 0`) to keep navigation available during scroll.

Validation for frontend changes:

```bash
make frontend-lint
make frontend-build
```

## 8. Git Workflow

Recommended branches:

- `main`: stable/deployable
- `feature/*`: feature work
- `hotfix/*`: urgent fixes from main

Recommended commit style:

- small, reversible commits
- run `make backend-lint backend-test` before each commit
- for frontend-only UI work, run `make frontend-lint frontend-build`

## 9. Troubleshooting

### Migration errors on startup

- ensure `AUTO_MIGRATE=false` in production-like runs
- run `make migrate` manually and retry

### SQLite lock contention

- app uses WAL + busy timeout pragmas
- verify one DB file path across processes

### Admin 401 errors

- confirm Basic Auth matches `ADMIN_USERNAME`/`ADMIN_PASSWORD`
