# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript wrapper library for the Eagle API. Eagle is a digital asset management application. This library provides a type-safe client for interacting with Eagle's local HTTP API (default: http://localhost:41595).

Official Eagle API documentation: https://api.eagle.cool/

## Package Manager

This project uses **pnpm**. A preinstall hook enforces this requirement.

## Development Commands

```bash
pnpm build          # Clean dist/ and compile TypeScript
pnpm check          # Format and lint with Biome (auto-fix enabled)
pnpm test           # Run tests with vitest
pnpm dev            # Run src/main.ts once with tsx
pnpm dev:watch      # Run src/main.ts in watch mode
```

### Test Requirements
- Eagle app must be running locally on port 41595
- A library named "Testing" must be selected in Eagle
- Tests will move all items to trash before/after execution

## Architecture

### Core Components

**EagleClient (src/EagleClient.ts)** - Main singleton client
- Singleton pattern: Access via `EagleClient.instance`
- Default connection: `http://localhost:41595`
- All methods are async and return Zod-validated typed results
- Groups API methods into: application, folder, item, library

**schemas (src/schemas.ts)** - Zod schemas for runtime validation
- All API responses are validated with Zod schemas
- Types are inferred from schemas via `z.infer<>`
- Includes recursive schema for nested folder structures

**EagleApiError (src/EagleApiError.ts)** - Custom error class
- Thrown on non-OK HTTP responses
- Contains method, endpoint, httpStatus, and errorResponse details

**Api (src/Api.ts)** - API endpoint path definitions

**types.ts** - TypeScript type definitions inferred from Zod schemas

### Key Design Patterns

1. **Singleton Client**: `EagleClient.instance` ensures single connection instance
2. **Zod Validation**: All API responses are runtime-validated with Zod schemas
3. **Type Inference**: Types are derived from Zod schemas (`z.infer<typeof schema>`)
4. **Fetch-based**: Uses native `fetch()` with `redirect: "follow"`

### Public Exports (src/main.ts)

```ts
export * from "./EagleApiError";
export * from "./EagleClient";
export * as schemas from "./schemas";
export * from "./types";
```

## Testing Strategy

Tests in `src/main.test.ts` use Vitest:
- **beforeAll**: Verify "Testing" library is selected, clean all items
- **Test organization**: Grouped by API category (application, folder, item, library, error cases)
- **Test data**: Uses assets/ directory for path-based imports
- **Cleanup**: Helper function `moveAllItemsToTrash()` ensures clean state
