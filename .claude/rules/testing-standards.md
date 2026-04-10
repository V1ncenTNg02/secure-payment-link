---
paths:
  - "**/*.test.ts"
  - "**/*.test.js"
  - "**/*.spec.ts"
  - "**/*.spec.js"
  - "backend/src/**/*.ts"
  - "backend/src/**/*.js"
  - "frontend/src/**/*.ts"
  - "frontend/src/**/*.vue"
---

# Testing Standards

Distilled from: *Clean Architecture* (Martin), *PEAA* (Fowler)

---

## Testing pyramid

```
        [E2E]          ← few, slow, expensive
      [Integration]    ← moderate
    [Unit Tests]       ← many, fast, cheap
```

- Most tests should be **unit tests**: pure logic, no I/O.
- **Integration tests** verify that components work together (DB queries, HTTP adapters, external services).
- **E2E tests** validate critical user paths only — not every feature.

---

## F.I.R.S.T. principles

Every good test is:
- **Fast** — < 100ms per unit test. Slow tests are skipped, then they rot.
- **Independent** — no shared mutable state, no order dependency. Any test can run alone.
- **Repeatable** — same result in any environment: no network calls, no time-of-day sensitivity, no randomness without seeding.
- **Self-validating** — the test itself asserts pass/fail. No manual inspection of output.
- **Timely** — written alongside (or before) the code it tests, not months later.

## Unit test rules

- A unit test tests **one behavior** at a time — not one method, one behavior.
- Each test: **Arrange → Act → Assert** (or **Given → When → Then**). No multiple acts in a single test.
- Tests must be **independent**: order-independent, no shared mutable state.
- Tests must be **deterministic**: no random values, no time-dependency without injection.
- Test names describe behavior: `it('rejects payment when card is expired')`, not `it('test payment 3')`.
- One logical assertion per test — multiple `expect` calls are fine if they assert one thing; testing two unrelated behaviors in one test is not.
- Do not assert on things you did not set up. Only assert what the test explicitly exercised.

---

## What to test

- Test **behavior at boundaries**: public API of a module, not private internals.
- Test **edge cases**: empty collections, null/undefined, boundary values, concurrency.
- Test **failure paths** at least as thoroughly as happy paths.
- Do not test third-party library behavior — only your use of it.

---

## Integration & DB tests

- Integration tests must use a **real DB** (or container), never mocks of the DB layer.
  DB mocks create false confidence and miss migration failures.
- Reset DB state between tests — use transactions rolled back after each test, or fixtures.
- Keep integration tests in a separate suite so they can be run independently.

---

## Test double vocabulary

Use the precise term — "mock" is overloaded:

| Term | What it does |
|---|---|
| **Dummy** | Passed but never used. Satisfies a parameter signature. |
| **Stub** | Returns a hardcoded value. Controls indirect inputs to the SUT. |
| **Fake** | Working implementation with a shortcut (in-memory DB, fake clock). |
| **Spy** | Records calls for later assertion. Does not control behavior. |
| **Mock** | Pre-programmed with expectations. Fails if not called as expected. |

Prefer **fakes** for infrastructure (in-memory repository) and **stubs** for external services. Use **mocks** only when you need to verify a specific interaction happened.

## Mocking rules

- Mock at **architectural boundaries** only (external HTTP, message queues, payment gateways).
- Never mock what you own — mock what you don't control.
- When using mocks, verify **interaction** (calls made), not just **state** (result returned).
- Excessive mocking is a signal of poor architecture — if a unit test requires 6 mocks, the unit under test is doing too much.

---

## Code coverage

- Coverage is a **floor**, not a goal. 100% coverage with bad tests is worse than 80% with good ones.
- Any critical path (payment, auth, data migration) must have ≥ 95% coverage.
- Use mutation testing on core business logic to validate test quality.

---

## Test data

- Use **builders or factories** for test data — never raw object literals spread across tests.
- Prefer **minimal data**: only set fields relevant to the test case.
- Never use production data in tests.

## Contract testing (for services that talk to each other)

- When service A calls service B, a **consumer-driven contract test** verifies A's expectations without running B.
- The contract is owned by the consumer (A) and verified against the provider (B) in CI.
- Tools: Pact, Spring Cloud Contract.
- Use contract testing instead of shared integration test environments that are slow and fragile.

## Property-based testing

- For functions with a large input space (parsers, validators, encoders, mathematical operations), use **property-based testing** to generate hundreds of random inputs.
- Define properties that must always hold: `encode(decode(x)) === x`, `sorted list is always ascending`, `total with discount ≤ total without discount`.
- Tools: fast-check (JS/TS), Hypothesis (Python), QuickCheck (Haskell/others).

---

## Test-Driven Development (TDD)

**All features must follow Red-Green-Refactor. No exceptions.**

You are NOT allowed to write implementation code for a new feature unless a failing test for that feature already exists in the repository.

### Step 1 — Red: Write a Failing Test
1. Read the requirement or acceptance criterion
2. Create or open the test file for the feature
3. Write one or more tests that describe the expected behaviour
4. Verify the tests fail (because the implementation doesn't exist yet)
5. **Commit:** `test: [task] - write failing tests for [feature]`

### Step 2 — Green: Write Minimum Implementation
1. Write the smallest amount of code that makes the tests pass
2. Do not add anything beyond what the tests require
3. Run the tests — confirm they all pass
4. **Commit:** `feat: [task] - implement [feature] to pass tests`

### Step 3 — Refactor: Clean Up (if needed)
1. Improve code quality without changing behaviour
2. Re-run tests after every refactor step — all must remain green
3. **Commit:** `refactor: [task] - clean up [feature]` (only if refactor was non-trivial)

### What counts as a "test"

**Backend (Jest + Supertest)**
- API route tests: POST/GET/PATCH endpoints via Supertest
- DB persistence tests: verify the DB contains the correct values after an operation
- Unit tests for utility functions (PIN hashing, token generation)

**Frontend (Vitest)**
- Component tests: render the component, assert DOM output
- Composable tests: pure logic, no DOM needed
- API layer tests: mock fetch, assert correct requests/responses

### Test file naming & location
- Backend: `backend/src/tests/[feature].test.js`
- Frontend: `frontend/src/[component]/__tests__/[Component].test.ts`
- One test file per feature/route — do not merge unrelated tests

### What NOT to do
- Do NOT write any `routes/*.js`, `*.vue`, or business logic before a failing test exists
- Do NOT write "happy path only" — each test suite must include at least one error/edge case
- Do NOT mock the database in backend integration tests — use real Supabase DB
- Do NOT skip or comment out failing tests to make the suite green
