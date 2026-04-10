# Engineering Principles

Distilled from: *Clean Architecture* (Martin), *Design Patterns* (GoF), *PEAA* (Fowler)

---

## SOLID

**Single Responsibility Principle**
A module should have one, and only one, reason to change.
Every class/module should encapsulate a single actor's concerns.

**Open/Closed Principle**
Software entities should be open for extension, closed for modification.
Use abstractions (interfaces, abstract base classes) so new behavior can be added without touching existing code.

**Liskov Substitution Principle**
Subtypes must be substitutable for their base types without altering the correctness of the program.
Never override a method in a way that changes its contract.

**Interface Segregation Principle**
Clients should not be forced to depend on interfaces they do not use.
Prefer many narrow interfaces over one wide one.

**Dependency Inversion Principle**
High-level modules must not depend on low-level modules. Both should depend on abstractions.
Abstractions must not depend on details; details must depend on abstractions.

---

## Clean Architecture rules

- **Dependency Rule**: source code dependencies must only point inward, toward higher-level policy.
  - Entities → Use Cases → Interface Adapters → Frameworks & Drivers
  - Never import framework code into use case or entity layers.
- **Boundary crossing**: data that crosses an architectural boundary must be a simple DTO or primitive — never a domain entity or ORM model.
- **Independence**: use cases must be independently testable without UI, DB, or external services.
- **Plugin model**: the database, UI, and frameworks are plugins to the business rules, not the other way around.

---

## General principles

- **DRY** — Don't Repeat Yourself. Every piece of knowledge must have a single authoritative representation.
- **YAGNI** — You Aren't Gonna Need It. Don't add complexity for hypothetical future requirements.
- **KISS** — Keep It Simple. The simplest solution that correctly solves the problem is the best one. Complexity has a carrying cost paid on every future change.
- **Tell, Don't Ask** — Objects should expose behavior, not data. Avoid decision logic scattered across callers.
- **Law of Demeter** — A module should only know about its immediate collaborators. Avoid deep method chains (`a.getB().getC().doX()`).
- **Stable Dependencies Principle** — Depend in the direction of stability. Volatile components should depend on stable ones, not vice versa.
- **Stable Abstractions Principle** — Stable components should be abstract; unstable components can be concrete.
- **Separation of Concerns** — Each module addresses one distinct concern. Business logic, data access, presentation, and validation are separate concerns that should not be mixed.
- **Composition over Inheritance** — Prefer composing behavior via interfaces and delegation over inheriting from a base class. Inheritance couples subclass to superclass in ways that are hard to undo.
- **Fail Fast** — Detect invalid state as early as possible and surface it loudly. A loud failure at the point of violation is far cheaper to debug than a silent corruption discovered 10 steps later. Never swallow exceptions silently (`catch (e) {}`).
- **Explicit over Implicit** — Make behavior, dependencies, and side effects visible in the code. Implicit magic (global state mutations, hidden couplings, auto-wired behavior) makes code harder to reason about and test.
- **Principle of Least Astonishment** — Code should behave in the way a reasonable developer would expect. Names, return types, and side effects should match conventions and context.
- **Immutability where possible** — Prefer immutable data structures. Mutable shared state is the primary source of concurrency bugs. Treat mutation as a deliberate, contained operation.
- **No premature optimization** — First make it correct, then make it clear, then (if necessary and measured) make it fast. Optimize only where profiling shows a real bottleneck.
- **Command-Query Separation (CQS)** — A method either changes state (command) or returns data (query), never both. Side effects should be predictable and explicit.

---

## Coupling & Cohesion

- Aim for **high cohesion** (elements in a module belong together) and **low coupling** (modules are independent).
- **Common Closure Principle**: classes that change together belong together in the same module.
- **Common Reuse Principle**: classes that are reused together belong together; classes not reused together should be split.
- **Acyclic Dependencies Principle**: no cycles in the component dependency graph. Cycles make components impossible to release independently.
- **Release/Reuse Equivalency Principle**: the unit of reuse is the unit of release. Only release things together that genuinely belong together.

---

## Error handling

- **Errors are part of the domain** — define error types that are meaningful at the call site, not just `Error('something went wrong')`.
- **Errors as values** (where the language allows) — return `Result<T, E>` / `Either` rather than throwing for expected failure cases (validation, not-found, business rule violations). Reserve exceptions for truly unexpected failures.
- **Never fail silently** — if you catch an error and cannot handle it, rethrow it or log and rethrow. An empty catch block is almost always wrong.
- **Propagate errors to the boundary** — let errors bubble to the layer that can meaningfully handle or translate them (the controller/adapter layer), rather than catching and hiding them deep inside.

---

## Testability

- Write code that is testable by design: no hard-coded dependencies, no global state, pure functions where possible.
- The architecture must make it easy to test without touching the database, network, or UI.
- Unit tests should test behavior, not implementation details.
- **Pure functions are the most testable unit** — a function that depends only on its inputs and produces no side effects needs no setup, no teardown, and no mocks.
- **Inject dependencies, don't instantiate them** — code that calls `new ConcreteService()` inside a method is untestable. Accept collaborators via constructor or parameter injection.
