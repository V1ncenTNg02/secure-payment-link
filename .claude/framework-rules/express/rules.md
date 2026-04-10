---
paths:
  - "backend/src/**/*.ts"
  - "backend/src/**/*.js"
  - "backend/**/*.test.*"
---

# Backend Rules

## API Design
- Base path: `/api/v1`
- Endpoints:
  - `POST /api/v1/payment-links` — create link
  - `GET  /api/v1/payment-links/:token` — fetch link details
  - `POST /api/v1/payment-links/:token/claim` — claim link
- Response envelope: `{ success: boolean, data?: any, error?: string }`
- HTTP status codes: 200, 201, 400, 404, 409 (already claimed), 500

## Database
- Migrations in `src/db/migrations/` named `001_initial.sql`, `002_claim_tracking.sql`, etc.
- Never modify existing migration files — always create a new one
- Run `npm run migrate` to apply; migrations are idempotent
- Use `better-sqlite3` synchronous API — no async DB calls needed

## Security
- Validate request body with Zod before any DB operation
- Parameterized queries only — `db.prepare('...').run(params)`
- Never include `pin_hash` in GET or POST response bodies
- `claimed_at` is set server-side with `new Date().toISOString()` — never trust client

## Logging
- Use `console.debug('[API:create]', { token, paymentType, amount })` on link creation
- Use `console.debug('[API:claim]', { token, claimedAt })` on claim
- These console logs are picked up by the frontend DevTools via the browser (task 6 requirement)
