# Architecture

This document describes how server-side code is organized and the responsibilities of each layer.

## Overview

All server code lives in `src/server/`. It is split into layers with a strict dependency direction:

```
funcs (presentation)  -->  interactors (use cases)  -->  repositories (data access)  -->  db
```

Each layer may only depend on the layer to its right. Repositories never import interactors, interactors never import funcs.

```
src/server/
  db/              # Drizzle instance, `DB` / `TX` types, schemas
    index.ts
    schemas/
  repositories/    # Database abstraction, one class per aggregate/table group
  interactors/     # User scenarios, own the transaction boundary
  funcs/           # TanStack Start server functions (presentation layer)
```

## Layers

### `db/`

Holds the Drizzle client and the table schemas.

- `db` is the application-wide Drizzle instance.
- `TX` is the transaction type that is passed down into repositories.

```ts
export const db = drizzle({ client: pool })
export type DB = typeof db
export type TX = PgAsyncTransaction<NodePgQueryResultHKT, EmptyRelations>
```

Nothing outside `src/server/` imports from `db/`.

### Repository (`repositories/`)

A repository is an abstraction over the database for a single aggregate (e.g. `UsersRepository`).

Rules:

- A repository receives the transaction (`TX`) via constructor dependency injection. It never creates one itself.
- A repository **must not control the transaction**: no `db.transaction(...)`, no commit, no rollback inside it. It only issues queries on the `tx` it was given.
- A repository returns domain objects. For simplicity we return the typed Drizzle query result directly instead of mapping it into separate domain classes. The inferred row type _is_ the domain type.
- A repository contains no business rules and no input validation. It is a thin, named query layer.

```ts
import { user } from '#/server/db/schemas/auth'
import type { TX } from '#/server/db'

export class UsersRepository {
  constructor(private readonly tx: TX) {}

  async getAllUsers() {
    return this.tx.select().from(user)
  }
}
```

### Interactor (`interactors/`)

An interactor is a single user scenario (use case), e.g. "get all users", "register user", "transfer money".

Rules:

- One interactor = one user scenario. Name it after the scenario: `getAllUsersInteractor`, `createOrderInteractor`.
- The interactor **owns the transaction boundary**. It opens exactly one transaction with `db.transaction(...)` and everything within the scenario runs inside it.
- Inside the transaction it instantiates the repositories it needs, passing the same `tx` to all of them. This is what makes the whole scenario atomic: if any step throws, the entire scenario is rolled back.
- Business rules and orchestration between repositories live here.
- Interactors do not know about HTTP, server functions, or any presentation concern. They take plain arguments and return plain values.

```ts
import { db } from '#/server/db'
import { UsersRepository } from '#/server/repositories/users'

export async function getAllUsersInteractor() {
  return db.transaction(async (tx) => {
    const usersRepository = new UsersRepository(tx)
    return usersRepository.getAllUsers()
  })
}
```

A scenario touching several aggregates shares the one `tx`:

```ts
export async function placeOrderInteractor(
  input: PlaceOrderInput,
  userId: string,
) {
  return db.transaction(async (tx) => {
    const orders = new OrdersRepository(tx)
    const inventory = new InventoryRepository(tx)

    await inventory.reserve(input.items)
    return orders.create({ ...input, userId })
  })
}
```

### Funcs (`funcs/`)

`funcs/` is **one** presentation layer: TanStack Start server functions created with `createServerFn`. Other presentation layers (REST routes, cron jobs, CLI commands) can be added alongside it and call the same interactors.

Rules:

- Each server function validates its input (Zod via `.inputValidator(...)`) and passes the validated data to the corresponding interactor. That is all it does.
- No business logic, no direct repository or `db` access in funcs.
- Auth is applied here via `authMiddleware`; the user ID is taken from the session and handed to the interactor as an argument, never taken from client input.
- Each func maps to exactly one interactor.

```ts
import { createServerFn } from '@tanstack/react-start'
import { getAllUsersInteractor } from '../interactors/users'

export const getAllUsersFn = createServerFn().handler(async () => {
  return getAllUsersInteractor()
})
```

## Summary

| Layer      | Location               | Knows about        | Owns transaction | Validates input |
| ---------- | ---------------------- | ------------------ | ---------------- | --------------- |
| Func       | `server/funcs/`        | Interactors        | No               | Yes             |
| Interactor | `server/interactors/`  | Repositories, `db` | Yes              | No              |
| Repository | `server/repositories/` | `TX`, schemas      | No (never)       | No              |
| DB         | `server/db/`           | Drizzle, Postgres  | —                | —               |

## Adding a new feature

1. Add or extend a repository in `repositories/` with the queries you need. Accept `TX` in the constructor.
2. Write an interactor in `interactors/` that opens a transaction, builds the repositories with that `tx`, and implements the scenario.
3. Expose it in `funcs/` with a `createServerFn` that validates input and calls the interactor.
4. Client code (`src/components/**`, `src/hooks/**`) calls the server function only.
