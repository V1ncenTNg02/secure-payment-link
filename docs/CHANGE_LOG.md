# Change Log

All changes made by Claude to this project are recorded here, newest first.
Format enforced by `.claude/rules/changelog.md`.

---

## Changes

### Task 4 — Persistence verification tests
- **Time:** 2026-04-10T11:45:00
- **Type:** `test`
- **Summary:**
  - **Before:** `migrate.test.js` had separate describe blocks each calling `pool.end()`, which caused a "Called end on pool more than once" error. No test verified that migration 002 applied correctly or that `claimed_at` defaults to `NULL`.
  - **After:** `migrate.test.js` restructured into a single parent `Migrations` describe block with one `afterAll` pool teardown. Added `002_claim_tracking` nested describe with 3 tests: nullable `claimed_at` column exists, `claimed_at` is `NULL` for new rows, and `002_claim_tracking.sql` is tracked in `_migrations`. Existing AC-05 requirements were already met: `paymentLinks.test.js` test 3 asserts `payment_type`, `amount`, `currency` match stored values; `claim.test.js` asserts `claimed_at` is set after claiming. 22 backend + 38 frontend tests — all green (60 total).

---

### Task 5 — Claim tracking: migration, API endpoints, and ClaimPaymentLink view
- **Time:** 2026-04-10T11:30:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No `claimed_at` column. No routes for reading or claiming a payment link. No claim UI.
  - **After:** `002_claim_tracking.sql` adds `claimed_at TIMESTAMPTZ NULL` to `payment_links`. `GET /api/v1/payment-links/:token` returns token, payment_type, amount, currency, claimed_at — never pin_hash; returns 404 for unknown token. `POST /api/v1/payment-links/:token/claim` validates PIN with Zod, hashes it SHA-256(pin+token), compares with stored hash → 200 + sets `claimed_at = NOW()` on match; 403 for wrong PIN; 409 if already claimed; 404 for unknown token. `console.debug('[PaymentLink:claim]', { token })` fires on success. Frontend: `getPaymentLink` + `claimPaymentLink` added to `paymentLinks.ts` with typed interfaces; `ClaimPaymentLink.vue` fetches link on mount, shows amount/currency/payment_type, PIN input, "Claim Payment" button, and handles success/403/409/404 states. Vue Router installed; router with `/` → CreatePaymentLink and `/pay/:token` → ClaimPaymentLink; `App.vue` switched to `<RouterView>`. 19 backend + 38 frontend tests — all green (57 total).

---

### Task 3 — API create endpoint and frontend integration
- **Time:** 2026-04-10T10:50:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No API route existed. "Generate Link" button had no action.
  - **After:** `POST /api/v1/payment-links` validates body with Zod, generates UUID token, hashes PIN with SHA-256(pin+token), stores record in Supabase, returns `{ token, url }`. `pin_hash` is never returned. `frontend/src/api/paymentLinks.ts` calls the endpoint. `CreatePaymentLink.vue` wired to call API on submit, displays returned URL, shows loading/error states. `console.debug('[PaymentLink:create]', ...)` fires on success. 10 new tests (7 backend Supertest + 3 frontend Vitest) — all green. Total: 35 tests passing.

---

### Task 2 — Backend scaffold and initial database migration
- **Time:** 2026-04-10T10:45:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No backend directory. No database schema.
  - **After:** Express backend scaffolded in `backend/`. `pg` installed for Supabase/PostgreSQL. Migration `001_initial.sql` creates `payment_links` table (id, token, pin_hash, payment_type, amount, currency, created_at). `migrate.js` runner tracks applied migrations via `_migrations` table (idempotent). `npm run migrate` applies all pending migrations. 5 Jest tests verify schema — all green.

---

### Task 1 — Frontend UI with locale support and PIN input
- **Time:** 2026-04-10T10:00:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No frontend existed. Project had only docs and config files.
  - **After:** Scaffolded Vue 3 + Vite + TypeScript SPA in `frontend/`. Built `LocaleSelector`, `PaymentMethodSelector`, `AmountInput`, and `PinInput` components with full locale-awareness (AU/US/ID). `CreatePaymentLink` view composes all components with a card layout, blue CTA, and SECURE badge. 20 Vitest tests covering all components pass. Vitest 2.x pinned for Node 21 compatibility.

---

### Update security flow to sender-entered 6-digit PIN
- **Time:** 2026-04-10T09:00:00
- **Type:** `feat`
- **Summary:**
  - **Before:** `secret_key` was auto-generated via `crypto.randomBytes(32)` with no functional verification role. Claim endpoint required no credential — anyone with the URL could claim.
  - **After:** Sender manually enters a 6-digit numeric PIN on the create form. Backend hashes the PIN with SHA-256 (salted with token) and stores it as `pin_hash`. Claim page requires the recipient to enter the same PIN (communicated verbally by sender). Backend hashes submitted PIN and compares with stored `pin_hash`; returns 403 on mismatch. `secret_key` column replaced by `pin_hash`.

---

### Add TDD enforcement rule
- **Time:** 2026-04-10T09:00:00
- **Type:** `chore`
- **Summary:**
  - **Before:** No rule governed the order of test vs implementation code. Tests could be written after or alongside implementation.
  - **After:** `.claude/rules/tdd.md` mandates Red-Green-Refactor: failing tests must be committed before any implementation code is written. Rule applies to all `.test.*`, `.spec.*`, and source files.

---

### Add architecture decision and changelog enforcement rules
- **Time:** 2026-04-10T08:30:00
- **Type:** `chore`
- **Summary:**
  - **Before:** `.claude/rules/` only contained `frontend.md` and `backend.md`. No mechanism existed to enforce documentation of changes or architectural decisions.
  - **After:** Added five new rule files: `database.md`, `security.md`, `infrastructure.md`, `changelog.md` (this file's enforcement), and `decisions.md`. These are auto-loaded by Claude Code based on file path patterns and enforce mandatory documentation of all changes and architectural decisions.

---

### Add docs/DECISIONS.md — Architecture Decision Records
- **Time:** 2026-04-10T08:30:00
- **Type:** `docs`
- **Summary:**
  - **Before:** File did not exist. Architectural decisions were implicit in BRD.md and CLAUDE.md but had no formal record-keeping structure.
  - **After:** Created `docs/DECISIONS.md` with seed entries for all decisions made during initial project setup (ADR-001 through ADR-005), including the security gap analysis (ADR-004) and secret key PIN approach (ADR-005).

---

### Add BRD.md — Business Requirements Document
- **Time:** 2026-04-10T08:00:00
- **Type:** `docs`
- **Summary:**
  - **Before:** File did not exist. Requirements existed only in the PDF spec document.
  - **After:** Created structured BRD with 6 sections: Title, Requirements & Use Cases, Technical Design (stack, architecture, schema, API), Steps Breakdown, Acceptance Criteria, and Detailed To-Do List. All 7 tasks from the spec are mapped with individual checklist items and required git commit messages.

---

### Initialise .claude/ folder with CLAUDE.md, settings.json, and rules
- **Time:** 2026-04-10T08:00:00
- **Type:** `chore`
- **Summary:**
  - **Before:** `.claude/` directory existed but was empty.
  - **After:** Added `CLAUDE.md` (project instructions: commands, architecture, code style, security, gotchas), `settings.json` (permission allowlist), and initial rules for `frontend.md` and `backend.md`. Establishes baseline Claude Code configuration for the project.
