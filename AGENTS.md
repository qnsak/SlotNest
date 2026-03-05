# Repository Guidelines

## Project Structure & Module Organization
- `docs/spec.md` is the source of truth for the MVP scope, API surface, and acceptance criteria.
- `docs/0001-public-identifier-booking-reference.md` records a key architecture decision about `booking_reference`.
- `docs/adr/` is reserved for future ADRs.
- No application source code has been committed yet; plan new code under `src/` and tests under `tests/` unless the repo structure is updated.

## Build, Test, and Development Commands
- No build, test, or dev commands are defined in this workspace yet.
- When you add tooling, document the canonical commands (for example: `make ci`, `npm test`, `pnpm dev`) here and in `docs/spec.md` if they impact acceptance criteria.

## Coding Style & Naming Conventions
- Documentation uses Markdown with clear headings and short sections; keep changes ASCII unless a spec requires otherwise.
- Follow the naming rules in `docs/spec.md`: internal primary keys are `id`, public identifiers are `booking_reference`.
- Use explicit status values (`ACTIVE`, `CANCELED`) as defined in the spec.

## Testing Guidelines
- There is no test suite yet. The MVP must cover AC-01 through AC-05 from `docs/spec.md` with automated tests once implementation begins.
- Prefer test names that mirror the acceptance criteria (example: `AC-02 rejects overlapping intervals`).

## Commit & Pull Request Guidelines
- Git history is not available in this workspace, so no commit convention can be inferred.
- Until a standard is set, use short, imperative commit messages (example: `Add interval overlap validation`).
- PRs should include: a summary of changes, the spec/ADR sections impacted, and screenshots or curl examples for API changes.

## Security & Configuration Notes
- Admin endpoints require at least Basic Auth in v1; document the credential handling approach when implemented.
- `booking_reference` must be high-entropy and unique; avoid exposing internal primary keys in any public API paths.
