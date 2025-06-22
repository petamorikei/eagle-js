import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { EagleClient } from "./EagleClient";

const client = EagleClient.instance;

const moveAllItemsToTrash = async () => {
  while (true) {
    const getItemListResult = await client.getItemList({});
    if (getItemListResult.status !== "success") {
      throw new Error();
    }
    if (getItemListResult.data.length === 0) {
      break;
    }
    const result = await client.moveItemToTrash({
      itemIds: getItemListResult.data.map((item) => item.id),
    });
    if (result.status !== "success") {
      throw new Error();
    }
  }
};

beforeAll(async () => {
  console.log("beforeAll: switch library");
  // Make sure library for testing is selected
  const getLibraryInfoResult = await client.getLibraryInfo();
  if (getLibraryInfoResult.status !== "success") {
    throw new Error();
  }
  if (getLibraryInfoResult.data.library.name !== "Testing") {
    throw new Error("Library for testing is not selected");
  }

  // Move all items to trash
  await moveAllItemsToTrash();
});

afterAll(async () => {
  console.log("afterAll: move all items to trash");
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
  });

  // test("get item info", async () => {
  //   const itemInfo = await client.getItemInfo();
  // });

  // test("get item thumbnail", async () => {
  //   const thumbnail = await client.getItemThumbnail();
  // });

  test("get list", async () => {
    const list = await client.getItemList({});
    expect(list.status).toBe("success");
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

  // test("refresh palatte", async () => {
  //   const result = await client.refreshItemPalette();
  // })

  // test("refresh thumbnail", async () => {
  //   const result = await client.refreshThumbnail();
  // })

  // test("update", async () => {
  //   const result = await client.updateItem()
  // })
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

  // test("switch", async () => {
  //   const result = await client.switchLibrary();
  // })
});
