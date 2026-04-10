# Backward Compatibility Standards

Distilled from: *Clean Architecture* (Martin), *PEAA* (Fowler)

---

## API contracts

- Public APIs are **contracts**. Once published, breaking changes require a version bump.
- **Additive changes** are safe: new optional fields, new endpoints, new enum values.
- **Breaking changes** are: removing fields, changing field types, removing endpoints, changing semantics.
- Use **semantic versioning**: MAJOR.MINOR.PATCH. Breaking = MAJOR bump.
- Deprecate before removing: mark deprecated, keep for ≥ 1 major version, then remove.

---

## Database schema

- Never delete or rename a column that is still read by running code.
- Migration order for column renames:
  1. Add new column.
  2. Dual-write (write to both old and new).
  3. Backfill old column → new column.
  4. Switch reads to new column.
  5. Remove old column after old code is fully retired.
- Migrations must be **forward-only** — no down migrations in production.
- Every migration must be **non-destructive** while old code is still running.

---

## Event and message schemas

- Events are public contracts. Once published, do not change field names or types.
- Use **schema registry** (Avro, Protobuf) to enforce compatibility.
- Support at least one previous major schema version in consumers.

---

## Dependency versioning

- Pin exact versions in lockfiles (`package-lock.json`, `poetry.lock`, `go.sum`).
- Update transitive dependencies deliberately, not silently.
- When upgrading a major version of a core library, treat it as a breaking change internally.

---

## Feature flags

- Use feature flags to decouple deploy from release.
- Never remove a feature flag until the old code path is confirmed dead in production.
- Feature flags are temporary — add a removal ticket when you create the flag.

---

## Expand-contract pattern (for zero-downtime changes)

The safest way to change any shared interface (API, schema, event):

1. **Expand** — add the new field/endpoint/behavior alongside the old. Both old and new are supported.
2. **Migrate** — update all consumers to use the new form. Verify no traffic on the old form.
3. **Contract** — remove the old form.

Never skip to step 3 in a single deploy. The expand phase may last an entire release cycle.

## Blue-green and canary deployments

- **Blue-green**: run two identical environments; switch traffic atomically. Enables instant rollback.
- **Canary**: route a small % of traffic to the new version; promote or roll back based on metrics.
- Either strategy requires that both versions can run against the same database simultaneously — which requires the migration safety rules above.

## Strangler fig pattern (for replacing legacy code)

When replacing a legacy system, do not rewrite all at once. Instead:
1. Add a routing layer in front of the legacy system.
2. Incrementally route individual capabilities to the new system.
3. Legacy system "strangles" as new system grows to cover all capabilities.
4. Remove the legacy system only when no traffic reaches it.

## Consumer-driven contract testing

- When multiple services share an API, the **consumer** defines what it needs (the contract), and the **provider** verifies it satisfies that contract in CI.
- Prevents the provider from making breaking changes that a consumer depends on.
- Tools: Pact, Spring Cloud Contract.
- A passing contract test is stronger evidence of compatibility than shared integration environments.

## Graceful degradation

- If a dependency is unavailable, the system should degrade gracefully — serve stale data, skip non-critical features, return partial results — rather than failing completely.
- Use **circuit breakers** to stop calling a dependency that is consistently failing, and return a fallback immediately instead of queueing up timeouts.
- Non-critical side effects (analytics, audit logging, notification delivery) should never be on the critical path — queue them and fail gracefully.

## Deprecation process

1. Add deprecation warning in logs/docs.
2. Notify consumers (changelog, API docs, Slack).
3. Set removal date (at least one major version cycle away).
4. Remove on schedule — no indefinite postponements.
