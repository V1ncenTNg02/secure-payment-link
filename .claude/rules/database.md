---
paths:
  - "backend/src/db/**"
  - "backend/src/**/*.sql"
  - "backend/src/**/*.js"
  - "backend/src/**/*.ts"
---

# Database Migration Enforcement

## MANDATORY: Any schema change requires a migration file first.

Before writing any code that touches the database schema, create:

```
backend/src/db/migrations/NNN_descriptive_name.sql
```

`NNN` = next zero-padded sequence number (`001`, `002`, `003` …)
`descriptive_name` = snake_case summary (`add_pin_hash_column`, `create_payment_links`)

Full rules: `.claude/framework-rules/sqlite/rules.md`
