# eagle-js

Wrapper for the Eagle API. It covers both the legacy API ([v1 docs](https://api.eagle.cool/)) and the [Web API v2](https://developer.eagle.cool/web-api).

## Installation

```bash
npm install @petamorikei/eagle-js
```

## Requirements

- Node.js >= 22.0.0
- Eagle application running (by default on localhost:41595)
- The Web API v2 (`client.v2`) requires Eagle 4.0 build 21 or later

## Usage

```ts
import { EagleClient } from "@petamorikei/eagle-js";

const client = EagleClient.instance;

// Add item from URL (v1)
await client.addItemFromUrl({
  url: "https://example.com/image.jpg",
  name: "Example Image",
  tags: ["example"],
});

// Search items (v1)
const items = await client.getItemList({
  tags: ["example"],
  limit: 10,
});

// Full-text search (v2)
const result = await client.v2.item.query({ query: "(cat OR dog) -cartoon", limit: 20 });
console.log(result.data.total, result.data.data);
```

`EagleClient.instance` is a shared client that connects to `http://localhost:41595`.

### Connecting to another machine

To call Eagle on another device, create a client with its host and the API token (shown in Eagle under Preferences > Developer).
The token is sent as the `token` query parameter on every request, for both v1 and v2. Requests from localhost do not need a token.

```ts
const remote = new EagleClient({ host: "192.168.1.100", port: 41595, token: process.env.EAGLE_TOKEN });
await remote.v2.app.info();
```

Keep the token private: anyone with it can read and change your library.

## Legacy API (v1) methods

- **Application**: `getApplicationInfo`
- **Folder**: `createFolder`, `renameFolder`, `updateFolder`, `getFolderList`, `getRecentFolderList`
- **Item**: `addItemFromUrl`, `addItemFromUrls`, `addItemFromPath`, `addItemFromPaths`, `addBookmark`, `getItemInfo`, `getItemThumbnail`, `getItemList`, `moveItemToTrash`, `refreshItemPalette`, `refreshThumbnail`, `updateItem`
- **Library**: `getLibraryInfo`, `getLibraryHistory`, `switchLibrary`, `getLibraryIcon` (returns the image as an `ArrayBuffer`)

## Web API v2 methods

The v2 methods live under `client.v2`, grouped by category and named after the endpoints: `/api/v2/tagGroup/create` is `client.v2.tagGroup.create()`.

- **app**: `info`
- **library**: `info`, `history`, `switch`, `icon` (returns the image as an `ArrayBuffer`)
- **item**: `get`, `query`, `countAll`, `add`, `update`, `setCustomThumbnail`, `refreshThumbnail`, `getComments`, `addComment`, `updateComment`, `removeComment`
- **folder**: `get`, `create`, `update`
- **smartFolder**: `get`, `create`, `update`, `remove`, `getItems`, `getRules`
- **tag**: `get`, `getRecentTags`, `getStarredTags`, `update`, `merge`
- **tagGroup**: `get`, `create`, `update`, `remove`, `addTags`, `removeTags`
- **aiSearch**: `isInstalled`, `isReady`, `isStarting`, `isSyncing`, `getSyncStatus`, `checkServiceHealth`, `searchByText`, `searchByBase64`, `searchByItemId` (requires the AI Search plugin)

```ts
const { v2 } = EagleClient.instance;

// Lists are paginated: { data, total, offset, limit }
const page = await v2.item.get({ tags: ["design"], offset: 0, limit: 100 });

// Request only some fields; the item type narrows to them
const names = await v2.item.get({ ext: "png", fields: ["id", "name"] });
names.data.data[0].name;

// Tag groups, smart folders and comments
const group = await v2.tagGroup.create({ name: "Styles", tags: ["flat", "material"] });
const smart = await v2.smartFolder.create({
  name: "Large images",
  conditions: [{ rules: [{ property: "width", method: ">", value: [1920] }], match: "AND" }],
});
await v2.item.addComment({ id: "ITEM_ID", x: 10, y: 20, width: 100, height: 80, annotation: "Face" });
```

Things to know about v2:

- Like v1, every method returns the whole response (`{ status, data }`).
- Some calls report a missing target as a **success** instead of an error, and eagle-js returns it as is. For example, `item.update` and `folder.create` return `data: false`, and `tagGroup.update`, `tag.update` and `tag.merge` return no `data`. The types and each method's description say which.
- `item.add` returns the new IDs before Eagle has indexed the items, so `item.get` may not find them for a short time.
- `item.get` does not include trashed items, while `item.countAll` counts them.
- `limit` defaults to 50 and is capped at 1000. Unlike v1, `limit: 0` means the default, not "no items".
- Fields that are not set are left out of responses (for example a tag group's `color`), so they are optional in the types.

## Types and schemas

Every response is validated at runtime with [Zod](https://zod.dev/).

- v1: the schemas are exported as `schemas`, and the result types (for example `GetItemListResult`) are exported as well.
- v2: the schemas are exported as `v2Schemas`, and the types as the `V2` namespace (for example `V2.Item`, `V2.TagGroup`, `V2.Page<T>`).

The v2 schemas follow what Eagle actually returns, which differs from the documentation in places (for example tags have `imageCount` rather than `count`). Fields that are not in the schemas are kept in the parsed result.

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

- `EagleApiError` is thrown when Eagle returns a non-OK HTTP status or a response with `status: "error"`, in both v1 and v2.
- `errorResponse` is `{ status: "error", code, message }` (for example 401 for a missing token), `{ status: "error", data }` (v1) or `{ status: "error", message }` (v2).
- A `ZodError` is thrown when a successful response does not match the expected schema.
- Network errors from `fetch` (for example when Eagle is not running) are thrown as is.
