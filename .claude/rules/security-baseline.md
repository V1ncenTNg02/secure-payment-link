# Security Baseline

Distilled from: *The Web Application Hacker's Handbook* (Stuttard & Pinto)

---

## Input validation

- **Never trust user input**. All input from the network, environment, or filesystem is untrusted.
- Validate input on the **server side** always — client-side validation is UX, not security.
- Use an **allowlist** (permitted characters/patterns), never a blocklist.
- Validate **type, length, format, and range** for every field.
- Reject requests that fail validation — do not sanitize and continue unless sanitization is the explicit feature.

---

## Output encoding

- **HTML-encode** all user-controlled data rendered in HTML: prevent XSS.
- **SQL-parameterize** all queries — never concatenate user data into SQL strings.
- **Shell-escape** or avoid shell execution with user data entirely.
- **JSON-encode** API responses — never reflect raw user input into JSON without encoding.

---

## Authentication

- Never store passwords in plaintext. Use bcrypt, scrypt, or Argon2 with appropriate cost factor.
- Enforce strong password policy and rate-limit login attempts.
- Session tokens must be: random (≥128 bits), transmitted only over HTTPS, HttpOnly, SameSite=Strict or Lax.
- Invalidate session tokens on logout, privilege change, and password reset.
- Use short-lived JWTs (≤ 15 min access tokens) with refresh token rotation.

---

## Authorization

- **Default deny**: unless access is explicitly granted, deny it.
- Enforce authorization on **every request** — never rely on UI hiding to prevent access.
- Use **RBAC or ABAC** consistently — no ad-hoc permission checks scattered in code.
- Never expose internal IDs directly (IDOR risk) — validate ownership on every resource access.
- **Principle of least privilege**: every service, user, and process gets only the permissions it needs and nothing more. Over-permissioning is a latent breach waiting to happen.

---

## Injection prevention

| Injection type | Prevention |
|---|---|
| SQL | Parameterized queries / ORM |
| Command | Avoid shell exec; if needed, use allowlist args |
| LDAP | Escape special chars; use parameterized APIs |
| XML/XXE | Disable external entities; use safe parsers |
| SSRF | Allowlist outbound URLs; block internal ranges |

---

## CSRF protection

- State-mutating endpoints (POST, PUT, PATCH, DELETE) must be protected from Cross-Site Request Forgery.
- Preferred: `SameSite=Strict` or `SameSite=Lax` cookies — prevents the browser sending the cookie on cross-origin requests.
- For APIs used by third-party clients: verify `Origin` / `Referer` header on mutation endpoints.
- Double-submit cookie pattern or synchronizer token if SameSite is insufficient for the use case.

## Security headers

Every HTTP response must include:

| Header | Value | Prevents |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Protocol downgrade |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing attacks |
| `X-Frame-Options` | `DENY` or `SAMEORIGIN` | Clickjacking |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage |
| `Content-Security-Policy` | Allowlist of sources | XSS, data injection |
| `Permissions-Policy` | Disable unused browser features | Feature abuse |

Use `helmet` (Node.js) or equivalent to set all headers in one place.

## Transport security

- HTTPS everywhere; no HTTP in production.
- HSTS header with `max-age ≥ 31536000; includeSubDomains; preload`.
- TLS 1.2 minimum; TLS 1.3 preferred.
- No mixed content.

---

## Rate limiting

- Apply rate limits at **multiple layers**: API gateway, application, per-endpoint.
- Endpoints that require special attention: login, registration, password-reset, OTP, any endpoint that sends email or SMS.
- Implement both **per-IP** and **per-account** rate limits — IP limits can be bypassed via distributed attacks.
- Return `429 Too Many Requests` with a `Retry-After` header.
- Rate limits should be configurable without a code deploy.

## Cryptography

- **Never implement your own cryptographic primitives.** Use established libraries (libsodium, Web Crypto API, OpenSSL wrappers).
- Prefer **authenticated encryption** (AES-GCM, ChaCha20-Poly1305) over encrypt-then-MAC assemblies.
- For password hashing: Argon2id (preferred) > bcrypt (cost ≥ 12) > scrypt. Never MD5, SHA-1, or unsalted SHA-256.
- For token generation: cryptographically secure random bytes (≥ 128 bits). Never `Math.random()`.
- For JWTs: always specify the algorithm explicitly on both sign and verify. Never accept `alg: none`. Prefer RS256/ES256 over HS256 when the verifier is a different service.

## Error messages and information leakage

- Error responses to clients must be generic — never expose: stack traces, SQL errors, internal field names, user existence (for login failures use "invalid credentials", not "user not found").
- User enumeration via password reset ("email not found") is a security issue — always respond with the same message regardless of whether the email exists.
- Response timing must be constant for authentication checks — timing differences can reveal user existence.

## Defense in depth

No single security control is sufficient. Layer multiple controls so that failure of one does not mean total compromise:
- Input validation + parameterized queries (not just one)
- Authentication + authorization (not just authentication)
- HTTPS + SameSite cookies + CSRF token (not just HTTPS)
- Rate limiting + account lockout + anomaly detection

## Secrets management

- Zero secrets in source code, env files, or Docker images.
- Secrets via environment variables injected at runtime, or a secret manager (Vault, AWS Secrets Manager, GCP Secret Manager).
- Rotate secrets on suspected compromise.
- Audit secret access — who accessed what secret and when.
- Short-lived credentials (IRSA, Workload Identity) preferred over long-lived API keys.

---

## Logging and monitoring

- Log all authentication events (success and failure), authorization failures, and input validation failures.
- Never log sensitive data: passwords, tokens, card numbers, PII.
- Logs must be tamper-evident (append-only, offloaded to SIEM).

---

## Dependency security

- Pin all dependency versions; review SBOMs.
- Run `npm audit` / `pip-audit` / `trivy` in CI.
- Update dependencies with known CVEs within 24h for critical, 7 days for high.
