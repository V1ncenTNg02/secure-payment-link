---
paths:
  - "backend/**"
  - "frontend/**"
  - "*.json"
  - "*.env*"
---

# Infrastructure Rules
# Note: this project uses local Docker/npm — not Terraform. This file covers
# general infrastructure and deployment rules for the current stack.

## Deployment Scope
**This project is a dev test — local execution only. No production deployment is required.**
The README must document how to run locally. The following section documents what a
production deployment would look like, for reference only.

## Local Development (Required)
- Frontend: `cd frontend && npm run dev` → http://localhost:5173
- Backend: `cd backend && npm run dev` → http://localhost:3000
- Database: SQLite file at `backend/db/payments.db` — auto-created on first migration
- Both services must be running simultaneously for full functionality

## Environment Configuration
- All environment-specific values go in `.env` files (never hardcoded)
- Copy `.env.example` to `.env` to get started
- Required backend env vars:
  ```
  PORT=3000
  DB_PATH=./db/payments.db
  CORS_ORIGIN=http://localhost:5173
  LINK_EXPIRY_HOURS=24
  NODE_ENV=development
  ```
- For tests: use `NODE_ENV=test` and `DB_PATH=:memory:`

## Production Deployment (Reference — Not Required for Dev Test)
If deployed to production, the following would apply:

**Frontend:**
- Run `npm run build` → produces `frontend/dist/` static files
- Serve `dist/` via nginx or a CDN (Netlify, Vercel, S3+CloudFront)
- Set `VITE_API_BASE_URL` env var to point to production API

**Backend:**
- Use a process manager: `pm2 start src/index.js --name payment-api`
- Or containerize: `Dockerfile` with `node:20-alpine` base image
- Reverse proxy with nginx: terminate HTTPS, proxy to `:3000`
- SQLite is acceptable for low-traffic production; migrate to PostgreSQL for scale

**Infrastructure Stack (if scaling):**
- Container: Docker + Docker Compose for local multi-service setup
- CI/CD: GitHub Actions — lint → test → build → deploy on `main` push
- Secrets: Store production env vars in GitHub Secrets or AWS Secrets Manager

## Port Conventions
- Frontend dev server: 5173 (Vite default)
- Backend API: 3000
- These ports are referenced in CORS config and must not be changed without updating both sides

## File Artifacts Not to Commit
- `backend/db/*.db` — SQLite database files
- `node_modules/` — install via `npm install`
- `frontend/dist/` — build output
- `.env` — use `.env.example` template
