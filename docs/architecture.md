# SlotNest Architecture Overview

This document describes the high-level system architecture, layering
model, data flow, and deployment model for **SlotNest**, a lightweight
appointment booking system.

------------------------------------------------------------------------

# 1. System Architecture

``` mermaid
flowchart TB

subgraph Client
User["User Browser / LIFF (future)"]
Admin["Admin Browser"]
end

subgraph Nginx
NG["Nginx Reverse Proxy"]
end

subgraph Backend
API["FastAPI API Layer"]
Auth["Admin Basic Auth"]
UseCase["Application Use Cases"]
Domain["Domain Layer"]
Repo["Repository Interface"]
end

subgraph Persistence
SA["SQLAlchemy Core"]
SQLite["SQLite Database"]
end

subgraph Migration
Alembic["Alembic Migration"]
end

subgraph Config
Env[".env"]
Settings["config/settings.py"]
end

User --> NG
Admin --> NG
NG --> API

API --> Auth
API --> UseCase

UseCase --> Domain
UseCase --> Repo

Repo --> SA
SA --> SQLite

Alembic --> SQLite

Env --> Settings
Settings --> API
Settings --> SA
```

------------------------------------------------------------------------

# 2. System Layers (Lightweight DDD)

SlotNest uses a **Lightweight Domain‑Driven Design (DDD)** structure.

## 2.1 Interfaces Layer

Location:

    backend/interfaces/api

Responsibilities:

-   FastAPI routers
-   Request validation
-   Response mapping
-   Authentication dependency
-   API error formatting

Example files:

    routes_user.py
    routes_admin.py
    deps.py
    admin_auth.py

This layer **must not contain business rules**.

------------------------------------------------------------------------

## 2.2 Application Layer

Location:

    backend/application/use_cases

Responsibilities:

-   Orchestrate business operations
-   Transaction boundaries
-   Invoke repositories
-   Coordinate domain rules

Example:

    create_booking.py
    cancel_booking.py
    create_interval.py
    delete_interval.py

------------------------------------------------------------------------

## 2.3 Domain Layer

Location:

    backend/domain

Responsibilities:

-   Business entities
-   Value objects
-   Domain rules
-   Repository interfaces

Example concepts:

    Booking
    AvailabilityInterval
    BookingRepository
    IntervalRepository

The domain layer **does not depend on**:

-   FastAPI
-   SQLAlchemy
-   SQLite
-   Environment configuration

------------------------------------------------------------------------

# 3. Persistence Layer

Location:

    backend/infrastructure/persistence/sqlalchemy

Technology:

    SQLAlchemy Core

Not using ORM.

Advantages:

-   Explicit SQL control
-   Clear transaction boundaries
-   Infrastructure remains separate from domain logic

Typical files:

    engine.py
    tables.py
    booking_repo.py
    interval_repo.py

------------------------------------------------------------------------

# 4. Database

Database:

    SQLite

Production path example:

    /var/lib/slotnest/slotnest.db

Runtime configuration:

    PRAGMA journal_mode=WAL;
    PRAGMA busy_timeout=5000;
    PRAGMA foreign_keys=ON;

Benefits:

-   Reliable concurrency handling
-   Reduced lock contention
-   Referential integrity enforcement

------------------------------------------------------------------------

# 5. Migration System

Tool:

    Alembic

Location:

    backend/alembic
    backend/alembic/versions

Responsibilities:

-   Schema version control
-   Safe database upgrades
-   Deployment migration coordination

Migration strategy:

    alembic revision -m "description"
    alembic upgrade head

Schema creation **must occur through migrations only**.

------------------------------------------------------------------------

# 6. Configuration System

Configuration is centralized.

Location:

    backend/config/settings.py

Environment variables loaded from:

    .env

Key configuration:

    DB_PATH
    ADMIN_USERNAME
    ADMIN_PASSWORD
    DEBUG

Other components **read settings through the config layer only**.

------------------------------------------------------------------------

# 7. Deployment Architecture

``` mermaid
flowchart TB

subgraph VM
Nginx["Nginx"]

subgraph Systemd
API["FastAPI Service"]
end

subgraph App
Current["/srv/slotnest/current"]
Release1["/srv/slotnest/releases/v1"]
Release2["/srv/slotnest/releases/v2"]
end

DB["/var/lib/slotnest/slotnest.db"]
end

Internet --> Nginx
Nginx --> API
API --> DB

Release1 --> Current
Release2 --> Current
```

Deployment model:

    release-based deployment

Structure:

    /srv/slotnest/releases/<version>
    /srv/slotnest/current -> symlink

Benefits:

-   Atomic deployments
-   Fast rollback
-   Safe upgrades

------------------------------------------------------------------------

# 8. Booking Flow

``` mermaid
sequenceDiagram

User->>API: POST /bookings
API->>UseCase: create_booking
UseCase->>Repo: check interval
UseCase->>Repo: check active booking
UseCase->>Repo: insert booking
Repo->>SQLite: INSERT
SQLite-->>Repo: OK
Repo-->>UseCase: booking_reference
UseCase-->>API: result
API-->>User: booking_reference
```

------------------------------------------------------------------------

# 9. Core Data Model

## availability_intervals

Fields:

    id
    date
    start_time
    end_time
    created_at

------------------------------------------------------------------------

## bookings

Fields:

    id
    booking_reference
    interval_id
    status
    created_at
    canceled_at

Status values:

    ACTIVE
    CANCELED

------------------------------------------------------------------------

# 10. Security Design

## Public Booking Identifier

User interactions rely on:

    booking_reference

Used for:

-   Booking lookup
-   Booking cancellation

Must be:

-   High entropy
-   Non‑guessable
-   Unique

------------------------------------------------------------------------

## Admin Access

Admin endpoints protected by:

    HTTP Basic Authentication

Credentials loaded from environment variables.

Future upgrade path:

    LINE LIFF authentication
    LINE user ID binding

------------------------------------------------------------------------

# 11. Architectural Advantages

### Clean Architecture

Framework dependencies remain at outer layers.

------------------------------------------------------------------------

### Database Portability

SQLite → PostgreSQL migration possible with minimal domain changes.

------------------------------------------------------------------------

### High Maintainability

Clear boundaries between:

-   API
-   Application logic
-   Domain rules
-   Infrastructure

------------------------------------------------------------------------

### Simple Deployment

Single VM deployment possible without containers.

------------------------------------------------------------------------

# 12. Engineering Value

Once implemented, SlotNest demonstrates:

-   Lightweight DDD architecture
-   Alembic migration workflow
-   SQLAlchemy Core persistence layer
-   Release-based deployment model
-   Config isolation strategy

This makes the project suitable for:

-   Engineering portfolio
-   Technical blog posts
-   System design interviews
