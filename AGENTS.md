# AGENTS.md

Guide for AI coding agents working in this repo. Read fully before making changes.

## Stack

TanStack Start, shadcn/ui + Tailwind v4, Better Auth, Drizzle + PostgreSQL, Vitest.
Package manager: **Bun** (never use npm, pnpm, or yarn; never create their lockfiles).

## Commands

```bash
bun install            # install dependencies
bun add <pkg>          # add dependency (bun add -d <pkg> for dev)
bun run dev            # start dev server
bun run build          # production build
bun run lint           # eslint
bun run lint:fix       # eslint --fix
bun run typecheck      # tsc --noEmit
bun run test           # vitest
bun run knip           # unused files, exports, dependencies
bun run db:generate    # drizzle-kit generate (create migration from schema)
bun run db:migrate     # apply migrations
```

Use `bun run test`, not `bun test`. `bun test` starts Bun's built-in test runner instead of Vitest.

Use `bunx` instead of `npx`.

## Definition of done

A task is NOT finished until all of these pass with zero errors:

```bash
bun run lint && bun run typecheck && bun run test
```

- Fix the root cause of every error. Do not silence it.
- If you changed the DB schema, generate a migration and include it.
- If you added or removed exports, files, or dependencies, run `bun run knip`.
- Lint error messages (especially `shadcn/*`) explain the fix. Read them.

## Hard rules

### Never

- Edit `eslint.config.js`, `tsconfig.json`, `prettier.config.js`, or `.github/` to make errors go away.
- Use `any`, `@ts-ignore`, `@ts-nocheck`, or the non-null assertion `!`.
- Add `eslint-disable` comments for drizzle rules, `no-floating-promises`, `no-explicit-any`, or `rules-of-hooks` (lint blocks this).
- Add any other `eslint-disable` without a `-- reason` description.
- Edit generated files: `src/routeTree.gen.ts`, or migrations in `drizzle/` that are already applied. Create a new migration instead.
- Run destructive DB commands (`drizzle-kit push` against shared DBs, `DROP`, `TRUNCATE`) without explicit approval.
- Commit secrets or `.env` files.
- Install new dependencies without a stated reason. Prefer what is already installed.

### Always

- Match existing patterns in neighboring files before inventing new ones.
- Keep files under ~300 lines. Split by responsibility when they grow.
- Add a test with every bug fix that reproduces the bug.

## Project conventions

- **Server only:** `src/db/`, `src/server/`, `*.server.ts`, `@/lib/auth` (the Better Auth server instance).
- **Client code** (`src/components/**`, `src/hooks/**`) reaches the server only through `createServerFn`, and uses `authClient` from `@/lib/auth-client`.
- Every server function that touches user data uses `authMiddleware` from `@/server/middleware/auth`. Never check sessions ad hoc in handlers.
- Every server function validates input with a Zod schema via `.inputValidator(...)`.
- Take user IDs from the session, never from client input.
- DB schema lives in `src/db/schema/`.
- shadcn components live in `src/components/ui/`. Edit them only when a design change requires a new variant or size.

## When stuck

- If a lint rule seems wrong for a case, stop and explain why instead of disabling it.
- If a task requires breaking a hard rule, ask first.