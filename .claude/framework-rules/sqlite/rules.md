---
paths:
  - "backend/src/db/**"
  - "backend/src/**/*.sql"
  - "backend/src/**/*.js"
  - "backend/src/**/*.ts"
---

# Database Rules

## MANDATORY: Every Schema Change Requires a Migration File

You are NOT allowed to write any code that alters the database schema (CREATE TABLE,
ALTER TABLE, DROP TABLE, ADD COLUMN, rename column, change type) unless a corresponding
`.sql` migration file already exists for that change.

**Do not touch application code first. Write the migration file first.**

### Migration File Naming
```
backend/src/db/migrations/NNN_descriptive_name.sql
```
- `NNN` = zero-padded sequence number, incrementing from the last migration (`001`, `002`, `003` …)
- `descriptive_name` = snake_case summary of the change (e.g. `add_pin_hash_column`, `create_payment_links`)
- Examples: `001_initial.sql`, `002_claim_tracking.sql`, `003_add_pin_hash.sql`

### Required Workflow
1. **Identify** the schema change needed
2. **Create** `backend/src/db/migrations/NNN_change_name.sql` with the SQL
3. **Make it idempotent**: use `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`
4. **Verify** it applies cleanly: `npm run migrate`
5. **Then** write the application code that uses the new schema
6. Update `docs/DECISIONS.md` if this reflects an architectural decision
7. Update `docs/CHANGE_LOG.md` with a `migration` type entry

**Never modify an existing migration file. Always create a new forward migration.**
The migration runner tracks applied files in `_migrations` — modifying an applied file has no effect and causes drift.

## Query Safety
- **All queries must be parameterized** — `db.prepare('SELECT * FROM t WHERE id = ?').get(id)`
- Never concatenate user input into SQL strings
- Use `better-sqlite3` synchronous API — no `.then()` chains on DB calls

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
