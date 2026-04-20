# Docker + Local Postgres Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase dependency with a local Docker Postgres instance so the project runs fully offline with `docker compose up -d`.

**Architecture:** Add a `docker-compose.yml` at the repo root that spins up Postgres 16. Move the `.env` file into `backend/` and update the three dotenv load paths accordingly. Remove Supabase-specific SSL config from the DB pool.

**Tech Stack:** Docker Compose, postgres:16-alpine, pg (existing), dotenv (existing)

---

## Files

| Action | Path | Change |
|---|---|---|
| CREATE | `docker-compose.yml` | Postgres 16 service + named volume |
| CREATE | `backend/.env.example` | Local Postgres URL template |
| MODIFY | `backend/src/db/index.js` | Fix dotenv path, remove SSL |
| MODIFY | `backend/src/server.js` | Fix dotenv path |
| MODIFY | `backend/src/tests/setup.js` | Fix dotenv path |
| DELETE | `.env.example` (root) | Superseded by `backend/.env.example` |
| MODIFY | `README.md` | Replace Supabase setup with Docker instructions |

---

### Task 1: Create `docker-compose.yml`

**Files:**
- Create: `docker-compose.yml`

- [ ] **Step 1: Create the file**

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: payment_link
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

- [ ] **Step 2: Verify Postgres starts**

```bash
docker compose up -d
docker compose ps
```

Expected: `db` service shows `running`.

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml
git commit -m "chore: add docker-compose for local postgres"
```

---

### Task 2: Create `backend/.env.example`

**Files:**
- Create: `backend/.env.example`
- Delete: `.env.example` (root)

- [ ] **Step 1: Create `backend/.env.example`**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payment_link
PORT=3000
```

- [ ] **Step 2: Remove root `.env.example`**

```bash
git rm .env.example
```

- [ ] **Step 3: Commit**

```bash
git add backend/.env.example
git commit -m "chore: move .env.example into backend/, use local postgres URL"
```

---

### Task 3: Update dotenv paths and remove Supabase SSL

**Files:**
- Modify: `backend/src/db/index.js`
- Modify: `backend/src/server.js`
- Modify: `backend/src/tests/setup.js`

- [ ] **Step 1: Update `backend/src/db/index.js`**

Replace the entire file with:

```javascript
const { Pool } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

module.exports = { pool }
```

> Path change: `'../../../.env'` → `'../../.env'` (now resolves to `backend/.env`)
> SSL removed: local Postgres does not require SSL

- [ ] **Step 2: Update `backend/src/server.js`**

Replace the entire file with:

```javascript
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const { app } = require('./app')

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`)
})
```

> Path change: `'../../.env'` → `'../.env'` (now resolves to `backend/.env`)

- [ ] **Step 3: Update `backend/src/tests/setup.js`**

Replace the entire file with:

```javascript
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../.env') })
```

> Path change: `'../../../.env'` → `'../../.env'` (now resolves to `backend/.env`)

- [ ] **Step 4: Copy `.env.example` to create your local `.env`**

```bash
cp backend/.env.example backend/.env
```

> `backend/.env` is already git-ignored by the root `.gitignore` (pattern `.env` matches any depth)

- [ ] **Step 5: Run migrations against local Postgres**

```bash
cd backend && npm run migrate
```

Expected output:
```
Applied migration: 001_initial.sql
Applied migration: 002_claim_tracking.sql
Migrations complete.
```

- [ ] **Step 6: Start the backend and verify it connects**

```bash
npm run dev
```

Expected: `Backend listening on http://localhost:3000`

Hit `GET http://localhost:3000/health` — should return `{"success":true,"data":{"status":"ok"}}`.

- [ ] **Step 7: Commit**

```bash
git add backend/src/db/index.js backend/src/server.js backend/src/tests/setup.js
git commit -m "refactor: load .env from backend/, remove Supabase SSL config"
```

---

### Task 4: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the backend setup section**

Find the section that describes Supabase setup and replace with:

```markdown
## Local Development Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Node.js 18+

### 1. Start the database

```bash
docker compose up -d
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

### 3. Run migrations

```bash
cd backend && npm run migrate
```

### 4. Start the servers

```bash
# Backend (port 3000)
cd backend && npm run dev

# Frontend (port 5173)
cd frontend && npm run dev
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update setup instructions for Docker Postgres"
```

---

## Verification Checklist

- [ ] `docker compose up -d` starts Postgres with no errors
- [ ] `npm run migrate` applies both migrations cleanly
- [ ] `GET /health` returns `{"success":true,...}`
- [ ] `POST /api/v1/payment-links` creates a link (manual test or `npm test`)
- [ ] `backend/.env` is not tracked by git (`git status` shows it as ignored)
