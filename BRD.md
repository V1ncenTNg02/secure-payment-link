# Business Requirements Document
# Payment Link Generator — Unify Services Dev Test

---

## 1. Title

**Project:** Secure Payment Link Generator
**Client:** Unify Services
**Version:** 1.0
**Date:** 2026-04-10

---

## 2. Requirements & Use Cases

### 2.1 Business Goal
Build a simple web application that allows a sender to create a shareable, secure payment link. The recipient opens the link and claims it, triggering a tracked payment request.

### 2.2 User Roles
| Role | Description |
|------|-------------|
| **Sender** | Creates the payment link by selecting payment method, amount, and locale |
| **Recipient** | Receives the link, opens it, and claims the payment |

### 2.3 Use Cases

#### UC-01: Create a Payment Link (Sender)
- Actor: Sender
- Precondition: App is loaded in browser
- Main Flow:
  1. Sender selects a locale (Australia, United States, or Indonesian)
  2. Locale updates currency symbol, payment method labels, and amount mask
  3. Sender selects a payment method (Credit Card or Bank)
  4. Sender enters a dollar amount using the locale-formatted input mask
  5. Sender enters a **6-digit numeric PIN** (to be verbally communicated to the recipient, e.g. over the phone)
  6. Sender clicks "Generate Link"
  7. System hashes the PIN (SHA-256 with token as salt) and saves the record to the database
  8. System returns a unique shareable URL
  9. Frontend displays the URL; sender distributes URL and PIN via **separate channels** (URL via message, PIN verbally over the phone)
- Postcondition: Record stored with `payment_type`, `amount`, `pin_hash`, `token`, unclaimed state; plain PIN is never persisted

#### UC-02: Claim a Payment Link (Recipient)
- Actor: Recipient
- Precondition: Recipient has a valid, unclaimed payment link URL and was told the 6-digit PIN by the sender over the phone
- Main Flow:
  1. Recipient opens the unique URL
  2. Frontend fetches payment link details from the backend via the URL token
  3. Recipient views payment details (amount, payment type)
  4. Recipient enters the **6-digit PIN** (told by sender over the phone)
  5. Recipient clicks "Claim"
  6. Backend hashes the submitted PIN (SHA-256 with token as salt) and compares with stored `pin_hash`
  7. If PIN is correct, system marks the record as claimed with a `claimed_at` timestamp
  8. Frontend confirms the payment has been claimed
- Alternative Flow A (wrong PIN):
  - System returns 403 Forbidden
  - Frontend shows "Incorrect PIN — please check with the sender"
- Alternative Flow B (already claimed):
  - System returns 409 Conflict (checked before PIN validation)
  - Frontend shows "This payment has already been claimed"
- Postcondition: Record updated with `claimed_at` timestamp; `pin_hash` remains stored for audit

#### UC-03: Locale Selection (Sender)
- Actor: Sender
- Locales supported:
  | Locale | Currency | Credit Card Label | Bank Label |
  |--------|----------|-------------------|------------|
  | Australia | AUD ($) | Credit Card | Bank Transfer |
  | United States | USD ($) | Credit Card | Bank |
  | Indonesian | IDR (Rp) | Kartu Kredit | Bank |
- Amount mask updates per locale (IDR has no decimal places)

---

## 3. Technical Design

### 3.1 Technology Stack
| Layer | Technology | Reason |
|-------|------------|--------|
| Frontend | Vue 3 + Vite | Required by spec; fast HMR, Composition API |
| Backend | Node.js + Express | Lightweight, fast to scaffold, large ecosystem |
| Database | SQLite (better-sqlite3) | Zero-config, perfect for a dev test, sync API |
| Testing (FE) | Vitest | Native Vite integration, same config as app |
| Testing (BE) | Jest + Supertest | Industry standard for Express API integration tests |

### 3.2 System Architecture
```
Browser (Vue 3 / Vite :5173)
        |
        | HTTP REST (JSON)
        v
Express API (:3000)
        |
        | better-sqlite3 (sync)
        v
SQLite Database (backend/db/payments.db)
```

### 3.3 Database Schema

**Migration 001 — Initial Table**
```sql
CREATE TABLE payment_links (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  token        TEXT NOT NULL UNIQUE,       -- UUID v4, used in shareable URL path
  pin_hash     TEXT NOT NULL,              -- SHA-256(pin + token); plain PIN never stored
  payment_type TEXT NOT NULL,              -- 'credit_card' | 'bank'
  amount       REAL NOT NULL,              -- stored as numeric value
  currency     TEXT NOT NULL,              -- 'AUD' | 'USD' | 'IDR'
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Migration 002 — Claim Tracking**
```sql
ALTER TABLE payment_links
  ADD COLUMN is_claimed INTEGER NOT NULL DEFAULT 0;  -- boolean (0/1)

ALTER TABLE payment_links
  ADD COLUMN claimed_at DATETIME NULL;               -- null until claimed
```

### 3.4 API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/payment-links` | Create a new payment link |
| `GET` | `/api/v1/payment-links/:token` | Get payment link details |
| `POST` | `/api/v1/payment-links/:token/claim` | Claim a payment link |

**POST /api/v1/payment-links — Request Body**
```json
{
  "payment_type": "credit_card",
  "amount": 150.00,
  "currency": "AUD",
  "pin": "482916"
}
```
> `pin` must be exactly 6 numeric digits. Validated with `/^\d{6}$/`. Never stored in plain text.

**POST /api/v1/payment-links — Response 201**
```json
{
  "success": true,
  "data": {
    "token": "uuid-v4-here",
    "url": "http://localhost:5173/pay/uuid-v4-here"
  }
}
```
> `pin_hash` is never included in the response.

**POST /api/v1/payment-links/:token/claim — Request Body**
```json
{
  "pin": "482916"
}
```

**POST /api/v1/payment-links/:token/claim — Response 200**
```json
{
  "success": true,
  "data": { "claimed_at": "2026-04-10T08:00:00.000Z" }
}
```

**POST /api/v1/payment-links/:token/claim — Response 403 (wrong PIN)**
```json
{
  "success": false,
  "error": "Invalid PIN"
}
```

### 3.5 Frontend Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `CreatePaymentLink.vue` | Main form to generate a link |
| `/pay/:token` | `ClaimPaymentLink.vue` | Recipient claim page |

### 3.6 Debug Logging Requirements
- On link creation (frontend): `console.debug('[PaymentLink:create]', { token, paymentType, amount, currency })`
- On link claim (frontend): `console.debug('[PaymentLink:claim]', { token, claimedAt })`
- A screenshot of DevTools console output must be saved to `docs/debug-console.png`

---

## 4. Steps Breakdown

### Task 1 — UI Only (No API)
Build the Vue 3 + Vite frontend with full UI. No backend connectivity yet.
- Scaffold Vue 3 app with Vite
- Build payment method selector (Credit Card / Bank) as icon buttons
- Build locale dropdown (Australia, United States, Indonesian)
- Build amount input with locale-aware currency mask
- Wire locale changes to update labels and currency symbol
- Add "Generate Link" button (no action yet)
- Add "SECURE" badge in footer of card
- Style to match the provided mockup (card layout, blue CTA)

### Task 2 — Migration: Create Database + Initial Table
Set up backend and database foundation.
- Scaffold Express backend
- Install better-sqlite3
- Write migration `001_initial.sql` creating `payment_links` table
- Write `migrate.js` script to apply migrations
- Add `npm run migrate` script to `package.json`

### Task 3 — API: Create Shareable URL + Persist Record
Connect frontend to backend.
- Implement `POST /api/v1/payment-links` endpoint
- Generate UUID token and secret key on create
- Return shareable URL in response
- Add `src/api/paymentLinks.ts` in frontend as API layer
- Wire "Generate Link" button to call API
- Display returned URL in the frontend after creation

### Task 4 — Test: Persistence Verification
Automated integration test for the create flow.
- Set up Jest + Supertest in backend
- Write test: POST a valid payment link request
- Assert HTTP 201 response with token and URL
- Assert database record contains correct `payment_type`, `amount`, `currency`
- Ensure test uses isolated test database (not dev db)

### Task 5 — Migration + Feature: Claim Tracking
Add claim state to the database and implement the claim flow.
- Write migration `002_claim_tracking.sql` (add `is_claimed`, `claimed_at`)
- Implement `GET /api/v1/payment-links/:token` endpoint
- Implement `POST /api/v1/payment-links/:token/claim` endpoint
- Return 409 if link is already claimed
- Build `ClaimPaymentLink.vue` page in frontend
- Add Vue Router with `/pay/:token` route
- On claim success, update UI to show confirmation

### Task 6 — Debug Output + Screenshot
Ensure application is debuggable via browser DevTools.
- Add `console.debug` logs to frontend on link creation
- Add `console.debug` logs to frontend on link claim
- Capture screenshot of DevTools console showing both outputs
- Save to `docs/debug-console.png`

### Task 7 — README
Write comprehensive README.md.
- How to run frontend and backend
- How to run migrations
- How to run tests
- How the product works (user flow)
- Why Node.js + Express was chosen as backend

---

## 5. Acceptance Criteria

### AC-01: Locale-Aware UI
- [ ] Locale dropdown shows Australia, United States, Indonesian
- [ ] Selecting a locale updates the currency symbol in the amount input
- [ ] Selecting a locale updates the payment method button labels
- [ ] Amount input mask uses no decimal places for IDR
- [ ] Amount input mask uses 2 decimal places for AUD/USD

### AC-02: Payment Link Creation
- [ ] Sender can select Credit Card or Bank payment method
- [ ] Sender can enter a valid amount
- [ ] Sender can enter a 6-digit numeric PIN (required field, exactly 6 digits)
- [ ] Frontend validates PIN is exactly 6 digits before allowing form submission
- [ ] Clicking "Generate Link" calls the backend API with `{ payment_type, amount, currency, pin }`
- [ ] A unique shareable URL is displayed after creation
- [ ] Record is persisted in the database with correct `payment_type`, `amount`, `currency`, `pin_hash`
- [ ] `pin_hash` is never returned in the API response; plain PIN is never stored

### AC-03: Payment Link Claiming
- [ ] Recipient can open the shareable URL
- [ ] Payment details (amount, type) are shown to recipient
- [ ] Recipient must enter the 6-digit PIN before claiming
- [ ] Submitting the correct PIN calls the backend and sets `claimed_at`
- [ ] After claiming, UI shows confirmation message
- [ ] Submitting an incorrect PIN returns 403 and displays "Incorrect PIN — please check with the sender"
- [ ] Attempting to claim an already-claimed link returns 409 before PIN is checked; UI shows "already claimed"

### AC-04: Database Migrations
- [ ] Migration 001 creates `payment_links` table with all required columns
- [ ] Migration 002 adds `is_claimed` and `claimed_at` columns
- [ ] `npm run migrate` applies all pending migrations idempotently

### AC-05: Automated Tests
- [ ] Test submits a valid POST to `/api/v1/payment-links`
- [ ] Test asserts HTTP 201 and presence of `token` and `url` in response
- [ ] Test queries the database and verifies `payment_type`, `amount`, `currency` match

### AC-06: Debug Console
- [ ] `console.debug` fires on payment link creation with token, type, amount, currency
- [ ] `console.debug` fires on payment link claim with token and claimed_at
- [ ] `docs/debug-console.png` screenshot shows both logs in Chrome DevTools

### AC-07: Documentation
- [ ] README explains how to start frontend
- [ ] README explains how to start backend
- [ ] README explains how to run migrations
- [ ] README explains how to run tests
- [ ] README describes the user flow
- [ ] README justifies backend technology choice

---

## 6. Detailed To-Do List

### Setup
- [ ] Scaffold `frontend/` with `npm create vite@latest` (Vue 3 + TypeScript template)
- [ ] Scaffold `backend/` with `npm init` and install `express`, `better-sqlite3`, `uuid`, `zod`, `cors`, `dotenv`
- [ ] Add `.gitignore` entries: `node_modules/`, `.env`, `backend/db/*.db`
- [ ] Create `docs/` directory for screenshots
- [ ] Update `PROMPTS.md` with this session's prompt log

### Task 1: Frontend UI
- [ ] **TDD first**: write Vitest tests for LocaleSelector, AmountInput, PinInput components before building them
- [ ] Create `frontend/src/config/locales.ts` with locale definitions
- [ ] Create `frontend/src/components/PaymentMethodSelector.vue`
- [ ] Create `frontend/src/components/AmountInput.vue` with currency mask
- [ ] Create `frontend/src/components/LocaleSelector.vue`
- [ ] Create `frontend/src/components/PinInput.vue` — 6-digit numeric input, validates format
- [ ] Create `frontend/src/views/CreatePaymentLink.vue` composing all components including PinInput
- [ ] Apply card layout styling matching the mockup
- [ ] Add "SECURE" badge
- [ ] Verify locale switching updates all labels and mask in real time
- [ ] **Git commit (tests):** `test: task 1 - write failing component tests`
- [ ] **Git commit (impl):** `feat: task 1 - payment link UI with locale support and PIN input`

### Task 2: Database Migration
- [ ] Create `backend/src/db/migrations/001_initial.sql`
- [ ] Create `backend/src/db/migrate.js` runner script
- [ ] Add `"migrate": "node src/db/migrate.js"` to backend `package.json`
- [ ] Test migration runs without error
- [ ] **Git commit:** `feat: task 2 - initial database migration`

### Task 3: API + Frontend Integration
- [ ] **TDD first**: write failing Supertest tests for `POST /api/v1/payment-links` before implementing the route
- [ ] Create `backend/src/db/index.js` (DB connection singleton)
- [ ] Create `backend/src/routes/paymentLinks.js` with POST handler
- [ ] Accept `{ payment_type, amount, currency, pin }` in POST body
- [ ] Validate `pin` is exactly 6 digits (`/^\d{6}$/`) — return 400 if invalid
- [ ] Generate UUID token; compute `pin_hash = sha256(pin + token)`
- [ ] Store `pin_hash`, never plain PIN
- [ ] Return `{ token, url }` in 201 response (no `pin_hash` in response)
- [ ] Create `frontend/src/api/paymentLinks.ts`
- [ ] Wire "Generate Link" button in `CreatePaymentLink.vue` — pass PIN from PinInput
- [ ] Display returned URL in UI
- [ ] Add `console.debug` log on creation
- [ ] **Git commit (tests):** `test: task 3 - write failing API tests`
- [ ] **Git commit (impl):** `feat: task 3 - API integration with PIN hashing`

### Task 4: Automated Tests
- [ ] Install `jest`, `supertest`, `@types/jest` in backend
- [ ] Create `backend/src/tests/paymentLinks.test.js`
- [ ] Write test: POST valid payload → assert 201 + token + url
- [ ] Write test: query DB → assert stored values match payload
- [ ] Add `"test": "jest"` to backend `package.json`
- [ ] Verify tests pass
- [ ] **Git commit:** `test: task 4 - persistence verification tests`

### Task 5: Claim Tracking
- [ ] **TDD first**: write failing tests for GET link, POST claim (correct PIN, wrong PIN, already claimed)
- [ ] Create `backend/src/db/migrations/002_claim_tracking.sql`
- [ ] Implement `GET /api/v1/payment-links/:token` (returns link details — no `pin_hash`)
- [ ] Implement `POST /api/v1/payment-links/:token/claim` with body `{ pin }`
  - Return 409 if already claimed (checked first, before PIN)
  - Compute `sha256(submittedPin + token)` and compare with `pin_hash`
  - Return 403 if PIN mismatch; do not reveal whether token exists
  - Return 200 and set `claimed_at` if PIN matches
- [ ] Install Vue Router in frontend
- [ ] Create `frontend/src/views/ClaimPaymentLink.vue` with PinInput component
- [ ] Add `/pay/:token` route in `frontend/src/router/index.ts`
- [ ] Handle 403 response: show "Incorrect PIN — please check with the sender"
- [ ] Handle 409 response: show "This payment has already been claimed"
- [ ] Add `console.debug` log on claim
- [ ] **Git commit (tests):** `test: task 5 - write failing claim flow tests`
- [ ] **Git commit (impl):** `feat: task 5 - claim tracking with PIN verification`

### Task 6: Debug Console + Screenshot
- [ ] Verify all `console.debug` calls are in place (create + claim)
- [ ] Run the app, create a link, claim it, open DevTools console
- [ ] Take screenshot showing both debug outputs
- [ ] Save to `docs/debug-console.png`
- [ ] **Git commit:** `feat: task 6 - debug console logging and screenshot`

### Task 7: README
- [ ] Write full `README.md` (setup, run, migrate, test, product description, backend rationale)
- [ ] **Git commit:** `docs: task 7 - README`
