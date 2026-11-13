# eagle-js

Wrapper for Eagle API. Official API Document [here](https://api.eagle.cool/).

## Installation

```bash
npm install @petamorikei/eagle-js
```

## Requirements

- Node.js >= 22.0.0
- Eagle application running on localhost:41595

## Usage

```ts
import { EagleClient } from "@petamorikei/eagle-js";

const client = EagleClient.instance;

// Add item from URL
await client.addItemFromUrl({
  url: "https://example.com/image.jpg",
  name: "Example Image",
  tags: ["example"],
});

// Search items
const items = await client.getItemList({
  tags: ["example"],
  limit: 10,
});
```

`EagleClient.instance` is a singleton that connects to `http://localhost:41595`.

## Available methods

- **Application**: `getApplicationInfo`
- **Folder**: `createFolder`, `renameFolder`, `updateFolder`, `getFolderList`, `getRecentFolderList`
- **Item**: `addItemFromUrl`, `addItemFromUrls`, `addItemFromPath`, `addItemFromPaths`, `addBookmark`, `getItemInfo`, `getItemThumbnail`, `getItemList`, `moveItemToTrash`, `refreshItemPalette`, `refreshThumbnail`, `updateItem`
- **Library**: `getLibraryInfo`, `getLibraryHistory`, `switchLibrary`, `getLibraryIcon` (returns the image as an `ArrayBuffer`)

Every response is validated at runtime with [Zod](https://zod.dev/). The schemas are exported as `schemas`, and the result types (for example `GetItemListResult`) are exported as well.

## Error handling

```ts
import { EagleApiError, EagleClient } from "@petamorikei/eagle-js";

try {
  await EagleClient.instance.getItemInfo({ id: "unknown" });
} catch (error) {
  if (error instanceof EagleApiError) {
    console.error(error.httpStatus, error.endpoint, error.errorResponse);
  }
}
```

- `EagleApiError` is thrown when Eagle returns a non-OK HTTP status or a response with `status: "error"`.
- A `ZodError` is thrown when a successful response does not match the expected schema.
- Network errors from `fetch` (for example when Eagle is not running) are thrown as is.
