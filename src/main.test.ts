import path from "node:path";
import { beforeAll, describe, expect, test } from "vitest";
import { EagleApiError } from "./EagleApiError";
import { EagleClient } from "./EagleClient";

const client = EagleClient.instance;

const waitForStableItemCount = async (maxWaitMs = 5000) => {
  const startTime = Date.now();
  let previousCount = -1;
  let stableCount = 0;
  const requiredStableChecks = 3;

  while (Date.now() - startTime < maxWaitMs) {
    const result = await client.getItemList({});
    if (result.status !== "success") {
      throw new Error("Failed to get item list");
    }

    const currentCount = result.data.length;
    if (currentCount === previousCount) {
      stableCount++;
      if (stableCount >= requiredStableChecks) {
        return; // Count is stable
      }
    } else {
      stableCount = 0;
    }

    previousCount = currentCount;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
};

const moveAllItemsToTrash = async () => {
  // Try multiple times to ensure all items are moved to trash
  for (let attempt = 0; attempt < 3; attempt++) {
    const getItemListResult = await client.getItemList({});
    if (getItemListResult.status !== "success") {
      throw new Error("Failed to get item list");
    }
    if (getItemListResult.data.length === 0) {
      break;
    }
    const result = await client.moveItemToTrash({
      itemIds: getItemListResult.data.map((item) => item.id),
    });
    if (result.status !== "success") {
      throw new Error("Failed to move items to trash");
    }
    // Wait for Eagle to process the trash operation
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
};

beforeAll(async () => {
  console.log("beforeAll: clean library and prepare for tests");
  // Make sure library for testing is selected
  const getLibraryInfoResult = await client.getLibraryInfo();
  if (getLibraryInfoResult.status !== "success") {
    throw new Error();
  }
  if (getLibraryInfoResult.data.library.name !== "Testing") {
    throw new Error("Library for testing is not selected");
  }

  // Wait for any pending async operations to complete
  await waitForStableItemCount(60000);
  // Move all items to trash
  await moveAllItemsToTrash();
});

describe("application info", () => {
  test("get", async () => {
    const applicationInfo = await client.getApplicationInfo();
    expect(applicationInfo.status).toBe("success");
  });
});

describe("folder", () => {
  test("create", async () => {
    const result = await client.createFolder({ folderName: "test" });
    expect(result.status).toBe("success");
  });

  test("get list", async () => {
    const list = await client.getFolderList();
    expect(list.status).toBe("success");
  });

  test("rename", async () => {
    const list = await client.getFolderList();
    const folderId = list.data.at(0)?.id;
    if (!folderId) {
      throw new Error();
    }
    const result = await client.renameFolder({
      folderId: folderId,
      newName: "renamed",
    });
    expect(result.status).toBe("success");
  });

  test("update", async () => {
    const list = await client.getFolderList();
    const folderId = list.data.at(0)?.id;
    if (!folderId) {
      throw new Error();
    }
    const result = await client.updateFolder({
      folderId: folderId,
      newName: "updated",
    });
    expect(result.status).toBe("success");
  });

  test("get folder list", async () => {
    const list = await client.getFolderList();
    expect(list.status).toBe("success");
  });

  test("get recent folder list", async () => {
    const list = await client.getRecentFolderList();
    expect(list.status).toBe("success");
  });
});

describe("item", () => {
  test("add from url", async () => {
    const result = await client.addItemFromUrl({
      url: "https://files.eagle.cool/website/hero-images/en/hero-1.webp",
      name: "hero-1",
    });
    expect(result.status).toBe("success");
  });

  test("add from urls", async () => {
    const result = await client.addItemFromUrls({
      items: [
        { url: "https://files.eagle.cool/website/feature-collect@2x.webp" },
        { url: "https://files.eagle.cool/website/feature-organize@2x.webp" },
        { url: "https://files.eagle.cool/website/feature-search@2x.webp" },
      ],
    });
    expect(result.status).toBe("success");
  });

  test("add from path", async () => {
    const result = await client.addItemFromPath({
      path: path.join(__dirname, "../assets/logo@2x.png"),
    });
    expect(result.status).toBe("success");
  });

  test("add from paths", async () => {
    const result = await client.addItemFromPaths({
      items: [
        { path: path.join(__dirname, "../assets/ic_multilevel.svg") },
        { path: path.join(__dirname, "../assets/ic_smartFolder.svg") },
      ],
    });
    expect(result.status).toBe("success");
  });

  test("add bookmark", async () => {
    const result = await client.addBookmark({
      url: "https://en.eagle.cool/",
    });
    expect(result.status).toBe("success");
    // Wait for Eagle to index the items
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  test("get list", async () => {
    const list = await client.getItemList({});
    expect(list.status).toBe("success");
    expect(list.data.length).toBeGreaterThan(0);
  });

  test("get item info", async () => {
    // Use an item created by previous tests
    const list = await client.getItemList({});
    if (list.status !== "success" || list.data.length === 0) {
      throw new Error("No items found - ensure previous 'add' tests have run");
    }
    const itemId = list.data[0].id;

    const itemInfo = await client.getItemInfo({ id: itemId });
    expect(itemInfo.status).toBe("success");
    expect(itemInfo.data.id).toBe(itemId);
  });

  test("get item thumbnail", async () => {
    // Use an item created by previous tests
    const list = await client.getItemList({});
    if (list.status !== "success" || list.data.length === 0) {
      throw new Error("No items found - ensure previous 'add' tests have run");
    }
    const itemId = list.data[0].id;

    const thumbnail = await client.getItemThumbnail({ id: itemId });
    expect(thumbnail.status).toBe("success");
    expect(thumbnail.data).toBeDefined();
  });

  test("update item", async () => {
    // Use an item created by previous tests
    const list = await client.getItemList({});
    if (list.status !== "success" || list.data.length === 0) {
      throw new Error("No items found - ensure previous 'add' tests have run");
    }
    const itemId = list.data[0].id;

    const result = await client.updateItem({
      id: itemId,
      tags: ["updated", "test"],
      annotation: ["Test annotation"],
    });
    expect(result.status).toBe("success");
    expect(result.data.id).toBe(itemId);
  });

  test("refresh item palette", async () => {
    // Use an item created by previous tests
    const list = await client.getItemList({});
    if (list.status !== "success" || list.data.length === 0) {
      throw new Error("No items found - ensure previous 'add' tests have run");
    }
    const itemId = list.data[0].id;

    const result = await client.refreshItemPalette({ id: itemId });
    expect(result.status).toBe("success");
  });

  test("refresh thumbnail", async () => {
    // Use an item created by previous tests
    const list = await client.getItemList({});
    if (list.status !== "success" || list.data.length === 0) {
      throw new Error("No items found - ensure previous 'add' tests have run");
    }
    const itemId = list.data[0].id;

    const result = await client.refreshThumbnail({ id: itemId });
    expect(result.status).toBe("success");
  });

  test("move to trash", async () => {
    await client.addItemFromPath({
      tags: ["toBeRemoved"],
      path: path.join(__dirname, "../assets/ic_tag.svg"),
    });
    const list = await client.getItemList({
      tags: ["toBeRemoved"],
    });
    if (list.status !== "success") {
      throw new Error();
    }
    const result = await client.moveItemToTrash({
      itemIds: list.data.map((item) => item.id),
    });
    expect(result.status).toBe("success");
  });
});

describe("library", () => {
  test("get info", async () => {
    const result = await client.getLibraryInfo();
    expect(result.status).toBe("success");
  });

  test("get history", async () => {
    const result = await client.getLibraryHistory();
    expect(result.status).toBe("success");
  });

  // Note: switchLibrary test is skipped because:
  // - It requires a valid library path which may not exist in test environment
  // - Switching libraries during tests could disrupt the test environment
  // - The "Testing" library must remain selected for other tests to work
});

describe("error cases", () => {
  test("get item info with invalid id should throw EagleApiError", async () => {
    await expect(client.getItemInfo({ id: "invalid-id-12345" })).rejects.toThrow(EagleApiError);
  });

  test("get item thumbnail with invalid id should throw error", async () => {
    await expect(client.getItemThumbnail({ id: "invalid-id-12345" })).rejects.toThrow();
  });

  test("update item with invalid id should throw error", async () => {
    await expect(
      client.updateItem({
        id: "invalid-id-12345",
        tags: ["test"],
      }),
    ).rejects.toThrow();
  });

  test("refresh item palette with invalid id should throw error", async () => {
    await expect(client.refreshItemPalette({ id: "invalid-id-12345" })).rejects.toThrow();
  });

  test("refresh thumbnail with invalid id should throw error", async () => {
    await expect(client.refreshThumbnail({ id: "invalid-id-12345" })).rejects.toThrow();
  });

  // Note: moveItemToTrash with invalid ID returns success, not an error
  // This is the expected behavior of the Eagle API

  test("rename folder with invalid id should throw error", async () => {
    await expect(
      client.renameFolder({
        folderId: "invalid-id-12345",
        newName: "test",
      }),
    ).rejects.toThrow();
  });

  test("update folder with invalid id should throw error", async () => {
    await expect(
      client.updateFolder({
        folderId: "invalid-id-12345",
        newName: "test",
      }),
    ).rejects.toThrow();
  });
});
