---
paths:
  - "backend/src/db/**"
  - "backend/src/**/*.sql"
  - "backend/src/**/*.js"
  - "backend/src/**/*.ts"
---

# Database Rules

## Migration Conventions
- Migration files live in `backend/src/db/migrations/`
- Named with zero-padded sequence prefix: `001_initial.sql`, `002_claim_tracking.sql`
- **Never modify an existing migration file** — always create a new forward migration
- Each migration file must be idempotent: use `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
- The migration runner (`migrate.js`) tracks applied migrations in a `_migrations` meta-table

## Query Safety
- **All queries must be parameterized** — `db.prepare('SELECT * FROM t WHERE id = ?').get(id)`
- Never concatenate user input into SQL strings
- Use `better-sqlite3` synchronous API — no `.then()` chains on DB calls

## Schema Change Process
1. Write a new numbered migration SQL file
2. Test it runs cleanly on a fresh DB: `npm run migrate`
3. Update `docs/DECISIONS.md` if the schema change reflects an architectural decision
4. Update `docs/CHANGE_LOG.md` with the schema change entry

## Connection Management
- Single DB connection singleton exported from `backend/src/db/index.js`
- Never open multiple connections in the same process
- Test suite uses a separate in-memory DB: `new Database(':memory:')`
- Run all migrations on the test DB before each test suite

## Column Conventions
- Boolean columns: `INTEGER NOT NULL DEFAULT 0` (SQLite has no native BOOLEAN)
- Nullable timestamps: `DATETIME NULL` — null means "not yet happened"
- Always include `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`
- Primary keys: `INTEGER PRIMARY KEY AUTOINCREMENT`
- Unique identifiers (public-facing): `TEXT NOT NULL UNIQUE` (UUID strings, not integer IDs)
