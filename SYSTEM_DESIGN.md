# SYSTEM DESIGN

## 1. Purpose

SlotNest is a lightweight booking system MVP.

Core goals:

- admins manage availability intervals
- users create, query, and cancel bookings
- booking lookup/cancel uses public `booking_reference`

## 2. High-Level Architecture

Request path:

- client -> FastAPI interfaces layer
- interfaces -> application use cases
- application -> domain rules + repository contracts
- repository adapters -> SQLAlchemy Core -> SQLite

Schema evolution path:

- Alembic revisions -> SQLite schema

## 3. Layered Boundaries (Lightweight DDD)

### 3.1 Interfaces (`backend/interfaces/api`)

Responsibilities:

- HTTP routing
- auth dependency (Basic Auth for `/admin/*`)
- request/response DTO mapping
- dependency wiring

Non-responsibilities:

- business rule decisions

### 3.2 Application (`backend/application/use_cases`)

Responsibilities:

- orchestrate use cases
- call domain rules and repository interfaces
- enforce workflow-level behavior

### 3.3 Domain (`backend/domain`)

Responsibilities:

- entities
- domain rules
- domain errors
- repository interfaces

Constraints:

- framework/database agnostic

### 3.4 Infrastructure (`backend/infrastructure/persistence/sqlalchemy`)

Responsibilities:

- SQLAlchemy Core table mapping
- repository implementations
- explicit transaction handling via engine/connection scopes

## 4. Data Model

### availability_intervals

- `id` INTEGER PK AUTOINCREMENT
- `date` TEXT (YYYY-MM-DD)
- `start_time` TEXT (HH:MM)
- `end_time` TEXT (HH:MM)
- `created_at` TEXT

### bookings

- `id` INTEGER PK AUTOINCREMENT
- `booking_reference` TEXT UNIQUE (public identifier)
- `interval_id` INTEGER FK -> `availability_intervals.id`
- `status` TEXT (`ACTIVE` or `CANCELED`)
- `created_at` TEXT
- `canceled_at` TEXT nullable

## 5. Core Business Rules

- interval date must be within `today..today+3 months` (`OUT_OF_RANGE`)
- same-day intervals must not overlap (`INTERVAL_OVERLAP`)
- interval with ACTIVE booking cannot be deleted (`INTERVAL_HAS_BOOKINGS`)
- each interval allows only one ACTIVE booking (`INTERVAL_ALREADY_BOOKED`)
- canceling canceled booking returns predictable error (`BOOKING_ALREADY_CANCELED`)

## 6. API Surface

System:

- `GET /healthz`

User:

- `GET /intervals`
- `POST /bookings`
- `GET /bookings/{booking_reference}`
- `POST /bookings/{booking_reference}/cancel`

Admin (Basic Auth):

- `POST /admin/intervals`
- `GET /admin/intervals`
- `DELETE /admin/intervals/{interval_id}`
- `GET /admin/bookings`
- `POST /admin/bookings/{booking_reference}/cancel`

## 7. Error Contract

Unified error envelope:

```json
{
  "code": "...",
  "message": "...",
  "details": {}
}
```

Mapping:

- `UNAUTHORIZED` -> 401
- `*_NOT_FOUND` -> 404
- business-rule conflicts -> 409

## 8. Configuration & Runtime

Single config entrypoint: `backend/config/settings.py`.

- loads `backend/.env` (dev convenience)
- owns env parsing and defaults
- exposes computed DB URL

Key env vars:

- `DB_PATH`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `DEBUG`
- `AUTO_MIGRATE`

## 9. Migration Strategy

- runtime must not auto-create schema
- all schema changes via Alembic revisions
- default startup assumes schema already migrated
- optional dev behavior: `AUTO_MIGRATE=true` runs `upgrade head` at startup

## 10. Testing Strategy

- pytest + FastAPI TestClient
- tests provision temp SQLite DB via `tmp_path`
- tests run Alembic `upgrade head` before API tests
- acceptance coverage includes AC-01..AC-05 from spec
