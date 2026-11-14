# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript wrapper library for the Eagle API. Eagle is a digital asset management application. This library provides a type-safe client for interacting with Eagle's local HTTP API (default: http://localhost:41595).

Official Eagle API documentation: https://api.eagle.cool/

## Package Manager

This project uses **pnpm**. The version is pinned by the `packageManager` field in package.json (and in `mise.toml`); enable Corepack (`corepack enable`) to use it automatically.

`mise.toml` pins Node.js and pnpm. The CI and publish workflows install them with `jdx/mise-action`, so update `mise.toml` (and `packageManager`) to change the versions used in CI.

`pnpm-workspace.yaml` holds pnpm settings. `allowBuilds` lists the dependencies allowed to run install scripts (currently only `esbuild`, used by tsx and vitest).

## Development Commands

```bash
pnpm build          # Clean dist/ and compile TypeScript (tsconfig.build.json, excludes tests)
pnpm typecheck      # Type check all sources including tests (no emit)
pnpm check          # Format and lint with Biome (auto-fix enabled, for local use)
pnpm lint           # Format and lint with Biome without fixing (biome ci, used in CI)
pnpm test:unit      # Run unit tests with mocked fetch (no Eagle needed, used in CI)
pnpm test           # Run all tests including integration tests (needs Eagle, see below)
pnpm dev            # Run src/main.ts once with tsx
pnpm dev:watch      # Run src/main.ts in watch mode
```

### Integration Test Requirements (`pnpm test`)

- Eagle app must be running locally on port 41595
- A library named "Testing" must be selected in Eagle
- Tests will move all items to trash before execution
- Setting an icon on the "Testing" library lets the library icon test cover the success path (without one, it checks the "Library icon does not exist." error)
- Never run `pnpm test` / `vitest` against a library you care about; use `pnpm test:unit` for quick checks

## Architecture

### Core Components

**EagleClient (src/EagleClient.ts)** - Main singleton client

- Singleton pattern: Access via `EagleClient.instance`
- Default connection: `http://localhost:41595`
- All methods are async and return Zod-validated typed results
- Groups API methods into: application, folder, item, library
- Every method goes through the private `request()` helper, which builds the URL/query, sends the JSON body, and handles errors

**schemas (src/schemas.ts)** - Zod schemas for runtime validation

- All API responses are validated with Zod schemas
- Types are inferred from schemas via `z.infer<>`
- Includes recursive schema for nested folder structures

**EagleApiError (src/EagleApiError.ts)** - Custom error class

- Thrown on non-OK HTTP responses and on responses whose `status` is `"error"` (even with HTTP 200)
- Contains method, endpoint, httpStatus, and errorResponse details
- If the error body is not JSON or has an unknown shape, `errorResponse` is `{ status: "error", data: <raw body> }`
- A success response that fails schema validation throws `ZodError`; network failures from `fetch` are passed through

**Api (src/Api.ts)** - API endpoint path definitions

**types.ts** - TypeScript type definitions inferred from Zod schemas

### Key Design Patterns

1. **Singleton Client**: `EagleClient.instance` ensures single connection instance
2. **Zod Validation**: All API responses are runtime-validated with Zod schemas
3. **Type Inference**: Types are derived from Zod schemas (`z.infer<typeof schema>`)
4. **Fetch-based**: Uses native `fetch()` with `redirect: "follow"`

### Public Exports (src/main.ts)

```ts
export * from "./EagleApiError.ts";
export * from "./EagleClient.ts";
export * as schemas from "./schemas.ts";
export * from "./types.ts";
```

Relative imports use `.ts` extensions; `rewriteRelativeImportExtensions` rewrites them to `.js` on build.

## Testing Strategy

Unit tests in `src/EagleClient.unit.test.ts` stub `fetch` with `vi.stubGlobal` and cover request building and error handling. They run in CI.

Integration tests in `src/main.test.ts` use Vitest against a live Eagle app:

- **beforeAll**: Verify "Testing" library is selected, clean all items
- **Test organization**: Grouped by API category (application, folder, item, library, error cases)
- **Test data**: Uses assets/ directory for path-based imports
- **Cleanup**: Helper function `moveAllItemsToTrash()` ensures clean state
