# Change Log

All changes made by Claude to this project are recorded here, newest first.
Update enforced by `.claude/rules/changelog.md`.

---

## Changes

### Task 5 — Claim tracking: migration, API endpoints, and ClaimPaymentLink view
- **Time:** 2026-04-10T11:30:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No `GET /api/v1/payment-links/:token` or `POST /api/v1/payment-links/:token/claim` route. No `claimed_at` column. No claim UI.
  - **After:** Migration `002_claim_tracking.sql` adds `claimed_at TIMESTAMPTZ NULL` column. `GET /:token` returns payment details (no `pin_hash`), 404 for missing token. `POST /:token/claim` validates PIN (Zod), hashes it, compares with stored hash → 200 on match (sets `claimed_at`), 403 on wrong PIN, 409 if already claimed, 404 for missing token. `console.debug('[PaymentLink:claim]', ...)` fires on success. Frontend adds `getPaymentLink` + `claimPaymentLink` to API layer. `ClaimPaymentLink.vue` shows payment details, PIN entry, success/error states. Vue Router added with `/` and `/pay/:token` routes. `App.vue` replaced static import with `<RouterView>`. 19 backend + 38 frontend tests — all green.

---

### Task 3 — API create endpoint and frontend integration
- **Time:** 2026-04-10T10:50:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No `POST /api/v1/payment-links` route. "Generate Link" button had no action. No frontend API layer.
  - **After:** Route validates body (Zod), generates UUID, hashes PIN with SHA-256(pin+token), persists to Supabase, returns `{ token, url }`. `frontend/src/api/paymentLinks.ts` created. `CreatePaymentLink.vue` calls API, shows URL/error/loading states. `console.debug` fires on success. 10 new tests — all green.

---

### Task 1 — Frontend UI
- **Time:** 2026-04-10T10:00:00
- **Type:** `feat`
- **Summary:**
  - **Before:** No frontend directory.
  - **After:** Vue 3 + Vite + TypeScript in `frontend/`. Four components (LocaleSelector, PaymentMethodSelector, AmountInput, PinInput), CreatePaymentLink view, locales config. 20 Vitest tests, all green.

---

### Sync docs and CLAUDE.md to reflect 6-digit PIN flow and TDD rule
- **Time:** 2026-04-10T09:30:00
- **Type:** `docs`
- **Summary:**
  - **Before:** `CLAUDE.md` still referenced `secret_key` and ADR-005. `docs/DECISIONS.md` had no ADR-006 or ADR-007. `docs/CHANGE_LOG.md` had no entries for the PIN flow or TDD rule.
  - **After:** `CLAUDE.md` updated to reference `pin_hash` and ADR-006. `docs/DECISIONS.md` has ADR-005 marked superseded, plus ADR-006 (sender-entered PIN) and ADR-007 (TDD). `docs/CHANGE_LOG.md` has matching entries for both changes.

---

### Update security flow to sender-entered 6-digit PIN
- **Time:** 2026-04-10T09:00:00
- **Type:** `feat`
- **Summary:**
  - **Before:** `secret_key` was auto-generated via `crypto.randomBytes(32)` and had no functional verification role. Claim endpoint required no credential — anyone with the URL could claim the payment.
  - **After:** Sender manually enters a 6-digit numeric PIN on the create form. Backend hashes the PIN with SHA-256 and stores it as `pin_hash`. Claim page requires the recipient to enter the same PIN (communicated by sender over the phone). Backend hashes the submitted PIN and compares with stored hash; returns 403 if incorrect. This eliminates the MITM vulnerability.

---

### Add TDD enforcement rule
- **Time:** 2026-04-10T09:00:00
- **Type:** `chore`
- **Summary:**
  - **Before:** No rule governed the order of test vs implementation code. Tests could be written after or alongside implementation.
  - **After:** `.claude/rules/tdd.md` mandates Red-Green-Refactor: failing tests must be committed before any implementation code is written. Rule applies to all `.test.*` and source files.

---

### Add architecture decision and changelog enforcement rules
- **Time:** 2026-04-10T08:30:00
- **Type:** `chore`
- **Summary:**
  - **Before:** `.claude/rules/` only contained `frontend.md` and `backend.md`. No mechanism enforced documentation of changes or architectural decisions.
  - **After:** Added five new rule files: `database.md`, `security.md`, `infrastructure.md`, `changelog.md` (enforcement), `decisions.md` (enforcement). Auto-loaded by Claude Code based on file path patterns.

---

### Add docs/DECISIONS.md and docs/CHANGE_LOG.md
- **Time:** 2026-04-10T08:30:00
- **Type:** `docs`
- **Summary:**
  - **Before:** Files did not exist. Decisions were implicit in BRD and CLAUDE.md.
  - **After:** Created `docs/DECISIONS.md` with ADR-001 through ADR-005 and `docs/CHANGE_LOG.md` with seed entries for all setup changes.

---

### Add BRD.md — Business Requirements Document
- **Time:** 2026-04-10T08:00:00
- **Type:** `docs`
- **Summary:**
  - **Before:** File did not exist. Requirements existed only in the PDF spec.
  - **After:** Created structured BRD with 6 sections: Title, Requirements & Use Cases, Technical Design, Steps Breakdown, Acceptance Criteria, and Detailed To-Do List.

---

### Initialise .claude/ folder
- **Time:** 2026-04-10T08:00:00
- **Type:** `chore`
- **Summary:**
  - **Before:** `.claude/` directory was empty.
  - **After:** Added `CLAUDE.md`, `settings.json`, and rules for `frontend.md` and `backend.md`.
