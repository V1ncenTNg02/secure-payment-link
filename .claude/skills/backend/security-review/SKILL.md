---
paths:
  - "backend/src/**"
  - "frontend/src/**"
---

# Security Rules

## Token Generation
- Link token (public, in URL): `crypto.randomUUID()` — 128-bit UUID v4
- **Never use Math.random() or sequential IDs for any security-sensitive value**

## Sender-Entered 6-Digit PIN — MITM Protection (ADR-006)

The shareable URL contains only the `token`. To prevent unauthorized claiming by anyone
who intercepts the URL, the sender enters a 6-digit PIN at creation time and communicates
it to the recipient verbally (over the phone). The PIN and URL travel via separate channels.

### Create Flow (Sender)
1. Sender fills in payment details AND enters a 6-digit numeric PIN on the form
2. Backend receives `{ payment_type, amount, currency, pin }`
3. Backend validates: PIN must be exactly 6 digits, numeric only (`/^\d{6}$/`)
4. Backend hashes: `sha256(pin + token)` — token is the salt
5. Stores `pin_hash` in DB; **never stores the plain PIN**
6. Returns `{ token, url }` — the PIN is never echoed back in the response
7. Sender shares the URL via any channel and tells the PIN to the recipient **by phone**

### Claim Flow (Recipient)
1. Recipient opens the unique URL
2. Recipient enters the 6-digit PIN on the claim page
3. Backend receives `{ pin }` in the claim request body
4. Backend recomputes: `sha256(submittedPin + token)` and compares with stored `pin_hash`
5. **PIN mismatch** → return `403 Forbidden` with `{ success: false, error: "Invalid PIN" }`
6. **Already claimed** → return `409 Conflict` before PIN check
7. **Valid PIN, unclaimed** → set `claimed_at`, return `200 OK`

### PIN Hashing Implementation
```js
const crypto = require('crypto');

function hashPin(pin, token) {
  return crypto.createHash('sha256').update(pin + token).digest('hex');
}
```

## Additional Protections
- **Rate limiting**: claim endpoint max 10 req/min per IP — limits brute force on the 6-digit space
- **One-time use**: `claimed_at NOT NULL` means the link is already consumed — 409 before PIN check
- **HTTPS (production)**: prevents network-level token interception; set `Strict-Transport-Security`

## API Security
- Validate ALL request bodies with Zod before touching the database
- **Never return `pin_hash` in any API response**
- Set security headers via `helmet` middleware on Express
- CORS: restrict to known frontend origin — never `*` in production

## Input Validation Rules
- `pin`: exactly 6 digits, numeric only — `/^\d{6}$/` — reject anything else
- `payment_type`: must be exactly `'credit_card'` or `'bank'`
- `amount`: positive number; IDR integers only, AUD/USD max 2 decimal places
- `currency`: one of `'AUD'`, `'USD'`, `'IDR'`
- `token` (URL param): validate UUID v4 format before querying DB

## Secrets Management
- Never commit `.env` files — use `.env.example` with placeholder values
- Required env vars: `PORT`, `DB_PATH`, `CORS_ORIGIN`, `LINK_EXPIRY_HOURS`
- Log security events (failed PIN attempts, expired link hits) — never log the PIN itself or pin_hash
