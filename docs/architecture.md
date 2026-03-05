# Architecture Overview

SlotNest is a Web MVP booking system with a FastAPI backend and a Vite + React frontend.
This document captures the initial foundation only (no business logic or database yet).

## Components
- Backend API: FastAPI app served by Uvicorn.
- Frontend UI: React app bundled with Vite.

## Boundaries (M1)
- No persistence layer.
- No authentication.
- Health endpoint only: `GET /healthz`.
