# Payment Link Generator — Claude Instructions

## Project Overview
Secure payment link generator where users create shareable one-time payment links. Built for Unify Services dev test.

- **Frontend**: Vue 3 + Vite (SPA, port 5173)
- **Backend**: Node.js + Express REST API (port 3000)
- **Database**: SQLite via better-sqlite3
- **Testing**: Vitest (frontend) + Jest/Supertest (backend)

## Repository Structure
```
secure-payment-link/
├── frontend/          # Vue 3 + Vite app
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── db/
│   │   │   └── migrations/
│   │   └── tests/
│   └── db/            # SQLite file lives here
├── docs/              # Screenshots and assets
├── CLAUDE.md
├── PROMPTS.md
└── README.md
```

## Dev Commands
```bash
# Frontend
cd frontend && npm run dev        # http://localhost:5173
cd frontend && npm run test       # Vitest unit tests

# Backend
cd backend && npm run dev         # http://localhost:3000
cd backend && npm run migrate     # Apply pending migrations
cd backend && npm run test        # Jest + Supertest integration tests
```

## Architecture Decisions
- SQLite keeps dev setup zero-config (single `.db` file)
- Payment links identified by UUID v4 (the shareable token)
- Sender enters a 6-digit numeric PIN at create time; backend hashes it with SHA-256 (token as salt) and stores `pin_hash` — plain PIN never persisted
- Claim tracking uses `claimed_at DATETIME NULL` (null = unclaimed)
- Backend never returns `pin_hash` in any API response
- CORS allows `localhost:5173` in development only

## Code Style
- **Vue**: `<script setup>` syntax, Composition API, no Options API
- **Backend**: async/await throughout, no callbacks
- **Validation**: Zod on backend for request body; vee-validate on frontend
- **Queries**: parameterized only — never string concatenation
- API response envelope: `{ success: boolean, data?: any, error?: string }`

## Security Rules
- Never commit `.env` files (use `.env.example` with placeholders)
- Payment tokens: `crypto.randomUUID()` for link ID; sender-entered 6-digit PIN hashed with SHA-256 (token as salt) stored as `pin_hash`
- Rate-limit claim endpoint: max 10 req/min per IP
- Validate all user input server-side regardless of frontend validation
- **MITM protection**: Sender enters a 6-digit numeric PIN when creating the link and communicates it to the recipient verbally over the phone. Claim requires PIN entry; backend hashes submitted PIN and compares with stored `pin_hash` (see ADR-006 in `docs/DECISIONS.md`)

## Testing Conventions
- Backend tests hit a real in-memory or test SQLite DB — no mocks for DB layer
- Run migrations before each test suite
- Test both happy path and edge cases: already-claimed links, invalid tokens, bad amounts

## Rule Files
Rules are organized by scope under `.claude/`:
- **Universal** (always apply): `.claude/rules/` — engineering-principles, naming-and-style, testing-standards, security-baseline, backward-compatibility, changelog, tdd
- **Framework-specific**: `.claude/framework-rules/express/rules.md`, `framework-rules/vue/rules.md`, `framework-rules/sqlite/rules.md`, `framework-rules/terraform/rules.md`
- **Domain skills**: `.claude/skills/backend/security-review/SKILL.md` — PIN hashing, claim validation

## Mandatory Documentation (Enforced by Rules)
- **Every code change** → append entry to `docs/CHANGE_LOG.md` (see `.claude/rules/changelog.md`)
- **Every architectural decision** → append ADR entry to `docs/DECISIONS.md` (see `.claude/rules/decisions.md`)
- Do not skip these steps. Do not batch them. Update immediately after the change.

## Important Gotchas
- Frontend locale selection changes currency symbol AND payment method labels
  - AU → AUD, "Credit Card" / "Bank Transfer"
  - US → USD, "Credit Card" / "Bank"
  - ID → IDR, "Kartu Kredit" / "Bank"
- Amount input uses locale-aware formatting mask (IDR has no cents)
- A claimed link should return 409 Conflict, not 404
- Debug console logs are required in both create and claim flows (task 6)
