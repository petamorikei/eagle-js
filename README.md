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
