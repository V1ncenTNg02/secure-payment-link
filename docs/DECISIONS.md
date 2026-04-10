# Architecture Decision Records (ADR)

All architectural decisions are recorded here.
Format and update enforcement: `.claude/rules/decisions.md`.

---

### ADR-007: Test-Driven Development as Mandatory Workflow
- **Time:** 2026-04-10T09:00:00
- **Status:** `Accepted`
- **Context:** The spec requires automated tests. Without a mandated workflow, tests risk being written after implementation, reducing their design value and coverage reliability.
- **Decision:** All features must follow Red-Green-Refactor TDD: write a failing test first, commit it, then implement the minimum code to make it pass, commit again. No implementation file may be committed without a corresponding test already in the repo. Enforced by `.claude/rules/tdd.md`.
- **Alternatives Considered:**
  - **Test-after** — common in practice but leads to implementation-biased tests and coverage gaps; rejected
  - **No formal order** — leaves test discipline to discretion; inconsistent; rejected
- **Consequences:**
  - Every piece of code is testable by design (untestable code fails TDD at the first step)
  - Two commits per feature instead of one — tests commit, then implementation commit
  - Tests serve as living specification of intent, not just regression guards

---

### ADR-006: Sender-Entered 6-Digit PIN as Claim Verification
- **Time:** 2026-04-10T09:00:00
- **Status:** `Accepted` — Supersedes ADR-005
- **Context:** ADR-005 proposed deriving a PIN from the auto-generated `secret_key`. However, an auto-generated PIN is hard to remember and awkward to communicate verbally. The real-world use case is a sender telling the recipient the PIN over the phone — a 6-digit number is the ideal format (short, unambiguous, easy to read aloud).
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
  - 6-digit PIN: 1,000,000 combinations; combined with rate limiting (10 req/min), brute force not practical
  - PIN is hashed server-side — plain PIN is never stored or logged
  - Adds PIN input field to both the create form and the claim page
  - Claim endpoint validates two things: token validity + PIN correctness

---

### ADR-005: Secret Key as Recipient PIN
- **Time:** 2026-04-10T08:30:00
- **Status:** `Superseded by ADR-006`
- **Context:** The shareable payment link URL contains only a UUID token. Anyone who intercepts the URL can claim the payment with no identity verification. The `secret_key` field was auto-generated but had no functional verification role.
- **Decision:** _(Superseded — see ADR-006 for the accepted approach)_

---

### ADR-004: Link Expiration via expires_at Column
- **Time:** 2026-04-10T08:30:00
- **Status:** `Proposed`
- **Context:** An unclaimed payment link with no expiry remains valid indefinitely. If the link is lost, forwarded, or the sender changes their mind, there is no way to invalidate it without direct DB intervention. Links should expire automatically.
- **Decision:** Add `expires_at DATETIME NOT NULL` column to `payment_links` table (Migration 003 if implemented). Default expiry: 24 hours from `created_at`. Backend returns 410 Gone for expired links. Expiry value is configurable via `LINK_EXPIRY_HOURS` env var.
- **Alternatives Considered:**
  - **No expiration (current state)** — links are permanent until claimed; acceptable for dev test but not production-safe; kept as-is for initial delivery to avoid scope creep
  - **Soft-delete on expiry** — mark as deleted instead of checking timestamp; less transparent, harder to reason about; rejected
- **Consequences:**
  - Reduces attack window for intercepted links
  - Requires frontend to handle 410 response with a user-friendly "link expired" message
  - Adds one more column to the schema and one more check in the claim handler

---

### ADR-003: UUID v4 as Public Link Token
- **Time:** 2026-04-10T08:00:00
- **Status:** `Accepted`
- **Context:** Payment links need a public identifier embedded in the shareable URL. This identifier must be unique, hard to guess, and URL-safe. Sequential integer IDs would allow enumeration attacks (attacker increments ID to find all links).
- **Decision:** Use `crypto.randomUUID()` (UUID v4) as the `token` column. This is the value placed in the shareable URL path: `/pay/:token`.
- **Alternatives Considered:**
  - **Sequential integer IDs** — trivially enumerable; completely rejected
  - **nanoid** — shorter, URL-safe, configurable entropy; viable but adds dependency; UUID v4 is built-in to Node.js `crypto` module
  - **CUID2** — collision-resistant, sortable; slightly over-engineered for this use case
- **Consequences:**
  - 128-bit entropy makes brute-force guessing computationally infeasible
  - UUID v4 format is standardised and validated easily with regex
  - Slightly longer URL path than nanoid, but perfectly acceptable

---

### ADR-002: Node.js + Express as Backend Framework
- **Time:** 2026-04-10T08:00:00
- **Status:** `Accepted`
- **Context:** The dev test spec allows any backend language/framework. The chosen backend must support a REST API, database access, and be easy to set up in a single session.
- **Decision:** Use Node.js with Express.js. Runtime: Node 20 LTS. Key libraries: `better-sqlite3` (DB), `zod` (validation), `express-rate-limit` (rate limiting), `helmet` (security headers), `uuid` (token generation), `cors` (CORS handling).
- **Alternatives Considered:**
  - **Python + FastAPI** — excellent async support and auto-generated docs; rejected because the frontend is JavaScript-ecosystem, keeping one language reduces cognitive overhead
  - **Go + Gin** — very fast, strongly typed; rejected because setup and boilerplate takes more time in a time-bounded test
  - **PHP + Laravel** — full-featured but heavy for a simple REST API; rejected
  - **Bun + Hono** — modern and fast; rejected because broader compatibility with Node.js tooling is more important for a dev test submission
- **Consequences:**
  - Single language (JavaScript/TypeScript) across frontend and backend — shared knowledge, no context switching
  - Large npm ecosystem available
  - Express is minimal — boilerplate must be written manually (validation, error handling)
  - Node.js is single-threaded; fine for this I/O-bound use case

---

### ADR-001: SQLite as Development Database
- **Time:** 2026-04-10T08:00:00
- **Status:** `Accepted`
- **Context:** The project requires a database with migration support. The dev test should be runnable without external service dependencies (no Docker, no database server to install). The data model is simple (one table, eventually two columns added via migration).
- **Decision:** Use SQLite via the `better-sqlite3` npm package. Database file stored at `backend/db/payments.db`. For tests: use in-memory DB (`:memory:`). Migration runner is a custom `migrate.js` script tracking applied migrations in a `_migrations` table.
- **Alternatives Considered:**
  - **PostgreSQL** — production-grade, full SQL, row-level locking; rejected because it requires a running server, adding setup friction for the reviewer
  - **MySQL/MariaDB** — similar to PostgreSQL argument; rejected
  - **MongoDB** — document store; the data is clearly relational; rejected as a poor fit
  - **Turso (libSQL)** — SQLite-compatible cloud DB; interesting but adds external dependency; rejected
- **Consequences:**
  - Zero-config setup — DB is a single file, auto-created by the migration runner
  - `better-sqlite3` uses a synchronous API — no async/await for DB calls, simplifies code
  - Not horizontally scalable (file lock); acceptable for a dev test
  - Must migrate to PostgreSQL or similar for any real production use
