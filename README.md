# Secure Payment Link Generator

A full-stack web application that lets a sender create a one-time, secure payment link and share it with a recipient. The recipient opens the link, enters a 6-digit PIN (communicated verbally by the sender), and claims the payment.

Built for the Unify Services developer test.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Setup](#setup)
5. [Running the App](#running-the-app)
6. [Database Migrations](#database-migrations)
7. [Running Tests](#running-tests)
8. [How It Works](#how-it-works)
9. [API Reference](#api-reference)
10. [Security Design](#security-design)
11. [Why Node.js + Express](#why-nodejs--express)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3 + Vite + TypeScript |
| Backend | Node.js + Express |
| Database | PostgreSQL via Supabase (transaction pooler) |
| Frontend tests | Vitest + Vue Test Utils |
| Backend tests | Jest + Supertest |

---

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is sufficient)

---

## Project Structure

```
secure-payment-link/
├── frontend/                  # Vue 3 + Vite SPA
│   └── src/
│       ├── api/               # Typed fetch wrappers
│       ├── components/        # LocaleSelector, PaymentMethodSelector, AmountInput, PinInput
│       ├── config/locales.ts  # Locale + currency definitions
│       ├── router/            # Vue Router (/, /pay/:token)
│       └── views/             # CreatePaymentLink, ClaimPaymentLink
├── backend/                   # Express REST API
│   └── src/
│       ├── db/
│       │   ├── index.js       # pg connection pool
│       │   ├── migrate.js     # Migration runner
│       │   └── migrations/    # SQL migration files
│       ├── routes/
│       │   └── paymentLinks.js
│       └── tests/             # Jest + Supertest integration tests
├── docs/
│   └── debug-console.png      # DevTools screenshot (Task 6)
└── .claude/                   # Claude Code config, rules, changelog
```

---

## Setup

### 1. Clone and install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Configure environment variables

Create `backend/.env` (copy from `backend/.env.example`):

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

> Use the **Transaction pooler** connection string from your Supabase project dashboard (Settings → Database → Connection pooling). Port **6543**, not 5432.

---

## Running the App

Start both servers in separate terminals:

```bash
# Terminal 1 — Frontend (http://localhost:5173)
cd frontend
npm run dev

# Terminal 2 — Backend (http://localhost:3000)
cd backend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Database Migrations

Migrations must be applied before starting the backend for the first time (or after pulling schema changes):

```bash
cd backend
npm run migrate
```

The migration runner is idempotent — it tracks applied migrations in a `_migrations` table and skips any that have already been applied. It is safe to run repeatedly.

**Migrations applied:**
| File | Description |
|---|---|
| `001_initial.sql` | Creates the `payment_links` table |
| `002_claim_tracking.sql` | Adds `claimed_at` column for claim state |

---

## Running Tests

### Frontend (Vitest)

```bash
cd frontend
npm run test
```

Runs 42 unit tests covering all components and views. No server or database required.

### Backend (Jest + Supertest)

```bash
cd backend
npm run migrate   # ensure schema is up to date
npm test
```

Runs 22 integration tests covering the full API surface. Tests hit the real Supabase database — migrations are idempotent so re-runs are safe.

---

## How It Works

### Sender flow

1. Open the app at `http://localhost:5173`
2. Select a **region** — changes currency symbol, payment method labels, and amount formatting
3. Select a **payment method** (Credit Card or Bank Transfer)
4. Fill in the payment-method-specific fields (card number / expiry / CVC, or bank code / account number)
5. Enter the **amount**
6. Enter a **6-digit security PIN** — this PIN must be communicated to the recipient verbally (e.g. over the phone), never via the same channel as the link
7. Click **Generate Link** — the backend hashes the PIN and persists the record
8. Copy the generated link or send it directly to the recipient's email using the inline form

### Recipient flow

1. Open the payment link URL (format: `/pay/:token`)
2. View the payment details — amount, currency, payment method
3. Enter the 6-digit PIN told to them by the sender
4. Click **Claim Payment**
5. On success, a confirmation is displayed and `claimed_at` is recorded in the database

### Error states

| Situation | HTTP | UI message |
|---|---|---|
| Wrong PIN | 403 | "Incorrect PIN" |
| Link already claimed | 409 | "This payment has already been claimed" |
| Link not found | 404 | "Payment link not found" |
| Invalid request body | 400 | Validation error message |

### Supported regions

| Region | Currency | Credit card label | Bank label |
|---|---|---|---|
| Australia | AUD ($) | Credit Card | Bank Transfer |
| United States | USD ($) | Credit Card | Bank |
| United Kingdom | GBP (£) | Credit Card | Bank Transfer |
| Europe | EUR (€) | Credit Card | Bank Transfer |
| Canada | CAD ($) | Credit Card | Interac e-Transfer |
| Singapore | SGD (S$) | Credit Card | Bank Transfer |
| Japan | JPY (¥) | クレジットカード | 銀行振込 |
| Indonesia | IDR (Rp) | Kartu Kredit | Transfer Bank |

---

## API Reference

All endpoints are prefixed with `/api/v1/payment-links`.

### POST `/` — Create a payment link

**Request body**
```json
{
  "payment_type": "credit_card",
  "amount": 150.00,
  "currency": "AUD",
  "pin": "482916"
}
```

- `payment_type`: `"credit_card"` | `"bank"`
- `pin`: exactly 6 numeric digits — validated server-side, never stored in plain text

**Response 201**
```json
{
  "success": true,
  "data": {
    "token": "uuid-v4",
    "url": "http://localhost:5173/pay/uuid-v4"
  }
}
```

### GET `/:token` — Get payment link details

**Response 200**
```json
{
  "success": true,
  "data": {
    "token": "uuid-v4",
    "payment_type": "credit_card",
    "amount": 150.00,
    "currency": "AUD",
    "claimed_at": null
  }
}
```

> `pin_hash` is never included in any response.

### POST `/:token/claim` — Claim a payment link

**Request body**
```json
{ "pin": "482916" }
```

**Response 200** — claim successful  
**Response 403** — wrong PIN  
**Response 409** — already claimed (checked before PIN validation)  
**Response 404** — token not found

---

## Security Design

| Concern | Approach |
|---|---|
| PIN storage | SHA-256(pin + token) — plain PIN is never persisted or logged |
| Brute force | Rate-limited to 10 requests/min per IP on the claim endpoint |
| MITM protection | URL and PIN travel over separate channels (URL via message, PIN verbally) |
| SQL injection | Parameterised queries only — no string concatenation |
| Information leakage | `pin_hash` is excluded from all API responses; errors are generic |
| Transport | HTTPS in production; `ssl: { rejectUnauthorized: false }` for Supabase pooler |

---

## Why Node.js + Express

**Single language across the stack.** The frontend is Vue 3 + TypeScript. Using Node.js on the backend means one language everywhere — shared conventions, no context switching between JS and a server-side language.

**Fast to scaffold.** Express is minimal by design. There is no mandatory project structure, no code generation step, and no framework-specific concepts to learn. A working REST API with validation, rate limiting, and security headers can be up in under an hour.

**Large ecosystem.** Every library needed for this project (`pg`, `zod`, `express-rate-limit`, `helmet`, `uuid`, `cors`) is a mature, well-maintained npm package with clear documentation.

**Right-sized for the problem.** The application has three endpoints and one database table. A framework like NestJS or Fastify would add abstraction overhead without any practical benefit at this scale. Express gives exactly the control needed without ceremony.

**Alternatives considered:**
- **Python + FastAPI** — excellent async support and auto-generated OpenAPI docs; rejected because the frontend is JS-ecosystem and keeping one language reduces cognitive overhead
- **Go + Gin** — fast and strongly typed; rejected because setup and boilerplate takes longer in a time-bounded test
- **NestJS** — structured and opinionated; rejected because its decorator-heavy pattern adds setup time and complexity not justified for three endpoints
