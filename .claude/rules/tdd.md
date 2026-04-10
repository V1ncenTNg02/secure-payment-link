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

# Test-Driven Development (TDD) Enforcement

## MANDATORY: Write Tests Before Implementation

**All features must follow Red-Green-Refactor. No exceptions.**

You are NOT allowed to write implementation code for a new feature unless a failing
test for that feature already exists in the repository.

## The Required Workflow

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

## What Counts as a "Test"

### Backend Tests (Jest + Supertest)
- API route tests: POST/GET/PATCH endpoints via Supertest
- DB persistence tests: verify the DB contains the correct values after an operation
- Unit tests for utility functions (PIN hashing, token generation)

### Frontend Tests (Vitest)
- Component tests: render the component, assert DOM output
- Composable tests: pure logic, no DOM needed
- API layer tests: mock fetch, assert correct requests/responses

## Applying TDD to Each Task

| Task | Write Tests For |
|------|----------------|
| Task 2 (Migration) | Migration runner creates expected table with correct columns |
| Task 3 (API Create) | POST creates DB record; response has token and url |
| Task 4 (Persistence) | This IS the test task — applies TDD to itself |
| Task 5 (Claim) | GET returns link details; POST claim sets claimed_at; 409 on re-claim; 403 on wrong PIN |
| Task 1 (UI) | Component renders locale labels; amount mask changes per locale; Generate button present |

## Test File Naming & Location
- Backend: `backend/src/tests/[feature].test.js`
- Frontend: `frontend/src/[component]/__tests__/[Component].test.ts`
- One test file per feature/route — do not merge unrelated tests

## What NOT to Do
- Do NOT write any `routes/*.js`, `*.vue`, or business logic before a failing test exists
- Do NOT write "happy path only" — each test suite must include at least one error/edge case
- Do NOT mock the database in backend integration tests — use real in-memory SQLite
- Do NOT skip or comment out failing tests to make the suite green
