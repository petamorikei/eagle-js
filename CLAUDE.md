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

**EagleClient (src/EagleClient.ts)** - Main client

- `EagleClient.instance` is the shared client for `http://localhost:41595`; `new EagleClient({ host, port, token })` creates one for another machine
- Methods on the client call the legacy API (v1, `/api/...`): application, folder, item, library
- `client.v2` is the Web API v2 (`/api/v2/...`), see below
- All methods are async and return Zod-validated typed results (the whole `{ status, data }` response)

**EagleHttp (src/http.ts)** - Internal HTTP transport shared by v1 and v2 (not exported from the package)

- `request()` builds the URL/query, sends the JSON body, handles errors and validates the response; `send()` returns the raw `Response` (used for library icons)
- Adds the `token` query parameter to every request when configured; `EagleApiError.endpoint` never contains it

**v2 (src/v2/)** - Web API v2, exposed as `client.v2.<category>.<endpoint>()`

- `EagleV2.ts` groups one class per category: `app`, `library`, `item` (including comments), `folder`, `smartFolder`, `tag`, `tagGroup`, `aiSearch`
- `endpoints.ts` holds the paths, `schemas.ts` the Zod schemas, `types.ts` the types (exported as the `V2` namespace)
- Schemas follow what Eagle 4.0 actually returns, not the docs (e.g. tags have `imageCount`, `library/info` has `tagsGroups`, `smartFolder/get` is paginated). Entities are `z.looseObject`, so unknown fields are kept
- Some calls report a missing target as success with `data: false` or no `data`; these are returned as is and typed accordingly
- Endpoints that accept both GET and POST are called with POST: GET with `fields` fails on Eagle 4.0 (`fields.forEach is not a function`)
- `item.get` / `smartFolder.getItems` with `fields` validate with `itemSchema.pick()` and narrow the item type to the requested fields
- `library.icon` returns an `ArrayBuffer`; Eagle 4 sends it as a JSON-serialized Node.js Buffer
- AI Search is typed from the docs only (the plugin was not available for live verification)

**schemas (src/schemas.ts)** - Zod schemas for runtime validation

- All API responses are validated with Zod schemas
- Types are inferred from schemas via `z.infer<>`
- Includes recursive schema for nested folder structures

**EagleApiError (src/EagleApiError.ts)** - Custom error class

- Thrown on non-OK HTTP responses and on responses whose `status` is `"error"` (even with HTTP 200)
- Contains method, endpoint, httpStatus, and errorResponse details
- `errorResponse` is `{ status, code, message }` (e.g. 401/404), `{ status, data }` (v1) or `{ status, message, data? }` (v2)
- If the error body is not JSON or has an unknown shape, `errorResponse` is `{ status: "error", data: <raw body> }`
- A success response that fails schema validation throws `ZodError`; network failures from `fetch` are passed through

**Api (src/Api.ts)** - API endpoint path definitions

**types.ts** - TypeScript type definitions inferred from Zod schemas

### Key Design Patterns

1. **Shared Client**: `EagleClient.instance` for localhost; construct a client for other hosts
2. **Zod Validation**: All API responses are runtime-validated with Zod schemas
3. **Type Inference**: Types are derived from Zod schemas (`z.infer<typeof schema>`)
4. **Fetch-based**: Uses native `fetch()` with `redirect: "follow"`

### Public Exports (src/main.ts)

```ts
export * from "./EagleApiError.ts";
export * from "./EagleClient.ts";
export * as schemas from "./schemas.ts";
export * from "./types.ts";
export * from "./v2/EagleV2.ts";
export * as v2Schemas from "./v2/schemas.ts";
export type * as V2 from "./v2/types.ts";
```

Relative imports use `.ts` extensions; `rewriteRelativeImportExtensions` rewrites them to `.js` on build.

## Testing Strategy

Unit tests (`*.unit.test.ts`) stub `fetch` with `vi.stubGlobal` and cover request building, connection settings and error handling. They run in CI. `src/v2/EagleV2.unit.test.ts` uses response bodies captured from Eagle 4.0.0 and also checks types with `expectTypeOf` (verified by `pnpm typecheck`).

Integration tests use Vitest against a live Eagle app. `vitest.config.ts` sets `fileParallelism: false` because the files share the "Testing" library.

`src/main.test.ts` (v1):

- **beforeAll**: Verify "Testing" library is selected, clean all items
- **Test organization**: Grouped by API category (application, folder, item, library, error cases)
- **Test data**: Uses assets/ directory for path-based imports
- **Cleanup**: Helper function `moveAllItemsToTrash()` ensures clean state

`src/v2.test.ts` (v2):

- Verifies the "Testing" library, then creates its own items, folders, tags, tag groups and smart folders with a per-run suffix, and removes or trashes them in `afterAll`. Existing tag groups and smart folders are not touched
- `item.add` returns before Eagle indexes the item; `waitForItems()` polls `item.get` before using new items
- Check v2 writes with v2 reads: the v1 `library/info` keeps returning stale smart folders and tag groups until Eagle restarts
- Eagle has no API to delete folders, so test folders remain in the library
