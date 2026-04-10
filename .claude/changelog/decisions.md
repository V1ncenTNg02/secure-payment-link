# Architecture Decision Records (ADR)

All architectural decisions are recorded here, newest first.
Update enforced by `.claude/rules/decisions.md`.

---

### ADR-008: PostgreSQL via Supabase instead of SQLite
- **Time:** 2026-04-10T10:45:00
- **Status:** `Accepted`
- **Context:** BRD specified SQLite (better-sqlite3) for zero-config local dev. During Task 2, the user already had a Supabase project with credentials in `.env`. Using Supabase avoids running a local DB process and keeps the dev setup closer to production.
- **Decision:** Replace SQLite with Supabase PostgreSQL. Use `pg` (node-postgres) with the transaction pooler (port 6543) and `ssl: { rejectUnauthorized: false }`. Connection params loaded from `.env`. The transaction pooler requires no session-level prepared statements.
- **Alternatives Considered:**
  - **SQLite (better-sqlite3)** — zero external deps, sync API; rejected because user already has Supabase and wanted to use it
  - **Direct connection (port 5432)** — resolves to IPv6 only on this Supabase project, not reachable from the dev machine; rejected in favour of the IPv4-accessible transaction pooler
- **Consequences:** `npm run migrate` must run before tests and before first server start. Tests hit the real Supabase DB (no in-memory option with Postgres); migrations are idempotent so re-runs are safe.

---

### ADR-007: Test-Driven Development as Mandatory Workflow
- **Time:** 2026-04-10T09:00:00
- **Status:** `Accepted`
- **Context:** The spec requires automated tests. Without a mandated workflow, tests risk being written after implementation, reducing their design value and coverage reliability.
- **Decision:** All features must follow Red-Green-Refactor TDD: write a failing test first, commit it, then implement the minimum code to make it pass, commit again. No implementation file may be committed without a corresponding test already in the repo.
- **Alternatives Considered:**
  - **Test-after (BDD-style)** — common in practice but leads to implementation-biased tests and coverage gaps; rejected
  - **No formal order** — leaves test discipline to discretion; inconsistent; rejected
- **Consequences:**
  - Every piece of code is testable by design (untestable code fails TDD at the first step)
  - Slightly more upfront commit overhead — two commits per feature instead of one
  - Tests serve as living specification of intent, not just regression guards

---

### ADR-006: Sender-Entered 6-Digit PIN as Claim Verification
- **Time:** 2026-04-10T09:00:00
- **Status:** `Accepted` — Supersedes ADR-005
- **Context:** ADR-005 proposed deriving a PIN from the auto-generated `secret_key`. However, an auto-generated PIN is hard to remember and awkward to communicate verbally. The real-world use case is a sender telling the recipient the PIN over the phone — a 6-digit number is the ideal format for this (short, unambiguous, easy to read aloud).
- **Decision:** The sender enters a 6-digit numeric PIN on the create payment form. The backend hashes it with SHA-256 (salted with the token) and stores it as `pin_hash`. The `secret_key` column is renamed to `pin_hash`. On claim, the recipient enters the same PIN; the backend hashes it and compares. Mismatch returns 403 Forbidden.
- **Alternatives Considered:**
  - **Auto-generated PIN from secret_key (ADR-005)** — no sender control, hard to communicate verbally; superseded
  - **No PIN, URL-only** — MITM vulnerability; already rejected in ADR-005
  - **Full password** — too complex for verbal sharing over the phone; rejected
  - **OTP via SMS** — requires external messaging infrastructure, out of scope; rejected
  - **4-digit PIN** — too short for brute force resistance (10,000 combinations); rejected
  - **8-digit PIN** — harder to communicate verbally without error; rejected
- **Consequences:**
  - Sender must choose and remember the PIN until verbal handoff — small cognitive overhead
  - 6-digit numeric PIN: 1,000,000 combinations; combined with rate limiting (10 req/min), brute force is not practical
  - PIN is hashed server-side — the plain PIN is never stored or logged
  - Adds a PIN input field to both the create form and the claim page
  - Claim endpoint now validates two things: token validity + PIN correctness

---

### ADR-005: Secret Key as Recipient PIN
- **Time:** 2026-04-10T08:30:00
- **Status:** `Superseded by ADR-006`
- **Context:** The shareable URL alone was insufficient — anyone intercepting it could claim the payment. The `secret_key` field existed but had no functional role.
- **Decision:** _(Superseded — see ADR-006 for the accepted approach)_

---

### ADR-004: Link Expiration via expires_at Column
- **Time:** 2026-04-10T08:30:00
- **Status:** `Proposed`
- **Context:** An unclaimed link with no expiry remains valid indefinitely. If the sender changes their mind or the link is lost, there is no invalidation mechanism.
- **Decision:** Add `expires_at DATETIME NOT NULL` (Migration 003 if implemented). Default 24 hours. Backend returns 410 Gone for expired links.
- **Alternatives Considered:**
  - **No expiration (current state)** — acceptable for dev test, not production-safe; kept as-is to avoid scope creep
- **Consequences:** Reduces attack window; requires frontend to handle 410; adds one DB column and one handler check.

---

### ADR-003: UUID v4 as Public Link Token
- **Time:** 2026-04-10T08:00:00
- **Status:** `Accepted`
- **Context:** Payment links need a public identifier embedded in the shareable URL. Sequential IDs are enumerable; the token must be hard to guess.
- **Decision:** Use `crypto.randomUUID()` (UUID v4) as the `token` column — placed in `/pay/:token`.
- **Alternatives Considered:**
  - **Sequential integer IDs** — trivially enumerable; rejected
  - **nanoid** — shorter, adds dependency; UUID v4 is built-in to Node.js; rejected
  - **CUID2** — sortable but over-engineered here; rejected
- **Consequences:** 128-bit entropy; UUID format is standardised and easy to validate; slightly longer URL than nanoid.

---

### ADR-002: Node.js + Express as Backend Framework
- **Time:** 2026-04-10T08:00:00
- **Status:** `Accepted`
- **Context:** Spec allows any backend. Chosen stack must support REST API, DB access, and be scaffoldable in a single session.
- **Decision:** Node.js + Express. Libraries: `better-sqlite3`, `zod`, `express-rate-limit`, `helmet`, `uuid`, `cors`.
- **Alternatives Considered:**
  - **Python + FastAPI** — good but cross-language with frontend adds cognitive load; rejected
  - **Go + Gin** — fast and typed but more boilerplate time; rejected
  - **PHP + Laravel** — too heavy for a simple REST API; rejected
- **Consequences:** Single language across stack; large npm ecosystem; minimal Express boilerplate must be hand-written.

---

### ADR-001: SQLite as Development Database
- **Time:** 2026-04-10T08:00:00
- **Status:** `Accepted`
- **Context:** Dev test must be runnable without external service dependencies.
- **Decision:** SQLite via `better-sqlite3`. File at `backend/db/payments.db`. Tests use `:memory:`. Custom `migrate.js` runner.
- **Alternatives Considered:**
  - **PostgreSQL** — requires running server, adds setup friction for reviewer; rejected
  - **MongoDB** — document store; data is relational; poor fit; rejected
- **Consequences:** Zero-config setup; sync API simplifies code; not horizontally scalable; must migrate for real production.
