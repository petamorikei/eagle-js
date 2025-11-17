# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript wrapper library for the Eagle API. Eagle is a digital asset management application, and this library provides a type-safe client for interacting with Eagle's local HTTP API (default: http://localhost:41595).

Official Eagle API documentation: https://api.eagle.cool/

## Package Manager

This project uses **pnpm**. A preinstall hook enforces this requirement.

## Development Commands

### Build
```bash
pnpm build          # Clean dist/ and compile TypeScript
pnpm clean          # Remove all files in dist/
pnpm tsc            # Compile TypeScript only
```

### Development
```bash
pnpm dev            # Run src/main.ts once with tsx
pnpm dev:watch      # Run src/main.ts in watch mode
pnpm start          # Run compiled dist/main.js
```

### Testing
```bash
pnpm test           # Run tests with vitest

# Test requirements:
# - Eagle app must be running locally on port 41595
# - A library named "Testing" must be selected in Eagle
# - Tests will move all items to trash before/after execution
```

### Code Quality
```bash
pnpm check          # Format and lint with Biome (auto-fix enabled)
```

Biome is configured with:
- Line width: 120 characters
- Recommended rules + additional strict style rules
- Import organization enabled

## Architecture

### Core Components

**EagleClient (src/EagleClient.ts)** - Main singleton client
- Singleton pattern: Access via `EagleClient.instance`
- Default connection: `http://localhost:41595`
- All methods are async and return typed results
- Groups API methods into: application, folder, item, library

**Api (src/Api.ts)** - API endpoint definitions
- Const object mapping method names to Eagle API paths
- Four main categories:
  - `application`: Application info
  - `folder`: Folder CRUD operations
  - `item`: Item management (add/update/delete/search)
  - `library`: Library info and switching

**types.ts** - Type definitions
- Result types for all API responses (e.g., `GetItemListResult`)
- Input parameter types (e.g., `Item`)
- Enums and constants (e.g., `Color`, `Order`)
- All Eagle API response structures

### Key Design Patterns

1. **Singleton Client**: `EagleClient.instance` ensures single connection instance
2. **Type Safety**: All API responses and parameters are fully typed
3. **Fetch-based**: Uses native `fetch()` for all HTTP requests
4. **Error Handling**: Methods throw on non-OK responses (no custom error types)

### API Organization

The client methods mirror Eagle's API structure:
- **Application**: `getApplicationInfo()`
- **Folders**: `createFolder()`, `renameFolder()`, `updateFolder()`, `getFolderList()`, `getRecentFolderList()`
- **Items**: `addItemFromUrl()`, `addItemFromUrls()`, `addItemFromPath()`, `addItemFromPaths()`, `addBookmark()`, `getItemInfo()`, `getItemThumbnail()`, `getItemList()`, `moveItemToTrash()`, `refreshItemPalette()`, `refreshThumbnail()`, `updateItem()`
- **Library**: `getLibraryInfo()`, `getLibraryHistory()`, `switchLibrary()`

## Testing Strategy

Tests in `src/main.test.ts` use Vitest and follow this pattern:
- **beforeAll**: Verify "Testing" library is selected, clean all items
- **afterAll**: Clean all items again
- **Test organization**: Grouped by API category (application, folder, item, library)
- **Test data**: Uses assets/ directory for path-based imports
- **Cleanup**: Helper function `moveAllItemsToTrash()` ensures clean state

Some tests are commented out because they require existing items or specific IDs.

## Notes for Development

- The library exports only `EagleClient` from main.ts
- All API calls use `redirect: "follow"` in fetch options
- No custom error classes - methods throw generic Error on failure
- `getItemList()` converts non-string parameters to strings for URLSearchParams
- TODO exists at line 231 in EagleClient.ts: Implement method to get thumbnail data (not just path)
