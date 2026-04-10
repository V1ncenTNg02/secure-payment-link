# Naming and Style Standards

---

## General naming rules

- Names must **reveal intent**. If a name requires a comment to explain it, choose a better name.
- Avoid generic names: `Manager`, `Processor`, `Handler`, `Helper`, `Utils` tell you nothing.
- Use **problem-domain names** for business logic, **solution-domain names** for technical infrastructure.
- Prefer **full words** over abbreviations unless the abbreviation is universally known (e.g., `url`, `id`, `html`).
- Boolean names must read like a question: `isAuthenticated`, `hasPermission`, `canEdit`.

## Classes

- Noun or noun phrase: `UserRepository`, `OrderService`, `PaymentGateway`.
- Never suffix with the pattern name unless it's the only distinguishing trait: prefer `UserStore` over `UserSingleton`.
- Interfaces: do **not** use an `I` prefix (`IUserRepository` → `UserRepository`). The interface is the concept; the implementation gets the qualifier (`PrismaUserRepository`, `InMemoryUserRepository`).
- Exception and error types: suffix with the category — `ValidationError`, `NotFoundError`, `PaymentFailedError`.

## Functions / Methods

- Verb or verb phrase: `fetchUser`, `validateSchema`, `applyDiscount`.
- Accessors: `get`/`set` prefix; predicates: `is`/`has`/`can` prefix.
- Command methods change state and return nothing. Query methods return data and change nothing (CQS).
- Use symmetrical names for paired operations: `open`/`close`, `start`/`stop`, `begin`/`end`, `add`/`remove`, `insert`/`delete`, `send`/`receive`, `show`/`hide`.
- Event handlers: `on` + event noun — `onSubmit`, `onUserCreated`, `onPaymentFailed`.
- Avoid negation in boolean names — `isEnabled` not `isNotDisabled`; negation in names causes double-negatives in conditions (`if (!isNotDisabled)`).

## Variables

- Local variables: short and contextual (`user`, `order`, `items`).
- Loop variables: `i`, `j` only for trivial numeric loops; otherwise use a meaningful name.
- Constants: `SCREAMING_SNAKE_CASE` for true constants; `camelCase` for module-level config.
- Collections are always **plural**: `users`, `orderItems`, `permissions` — never `userList`, `orderArray`.
- Generic type parameters: `T` for a single unconstrained type; use descriptive names when constrained — `TEntity`, `TKey`, `TValue` — so they self-document at the call site.
- Scope inversely proportional to name length: variables used over a wide scope deserve longer, more descriptive names; variables used in 2 lines can be short.

## Files and modules

- File names mirror the primary export: `UserRepository.ts`, `user_repository.py`.
- Group by feature/domain first, not by layer (prefer `users/repository.ts` over `repositories/users.ts`).

## Consistency rules

- Pick one word per concept and use it everywhere: never mix `fetch`/`get`/`retrieve` for the same operation.
- Never encode the type in the name (`userList` → `users`, `nameString` → `name`).
- No noise words: `theUser`, `aProduct`, `dataInfo` — remove them.

## Code structure and readability

- **Vertical ordering**: high-level code at the top of a file, details below. A reader should understand intent before seeing implementation.
- **Small units**: functions that need scrolling are almost always doing too much. A function should fit on one screen.
- **Stepdown rule**: a function calls functions one level of abstraction below it — never mixes high-level orchestration with low-level details.
- **Guard clauses over nested conditionals**: invert conditions to return/throw early rather than wrapping the happy path in nested `if` blocks.

```
// Nested (hard to read)
function process(order) {
  if (order) {
    if (order.isPaid()) {
      if (order.items.length > 0) {
        // actual logic here, deeply indented
      }
    }
  }
}

// Guard clauses (easy to read)
function process(order) {
  if (!order) throw new Error('Order required');
  if (!order.isPaid()) throw new PaymentRequiredError();
  if (order.items.length === 0) throw new EmptyOrderError();
  // actual logic at the top level
}
```

## Comments

- Comments are a last resort, not a routine tool. Express the same information in code if possible.
- Only write comments for:
  - Legal headers
  - Intent that cannot be expressed in code
  - Warning of surprising consequences
  - TODO notes (with a ticket reference)
- Never write comments that restate what the code says.
- If you feel compelled to write a comment explaining *what* the code does, consider renaming or extracting instead.
