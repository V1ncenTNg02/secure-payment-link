# Change Log

All changes made by Claude to this project are recorded here, newest first.
Format enforced by `.claude/rules/changelog.md`.

---

## Changes

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
