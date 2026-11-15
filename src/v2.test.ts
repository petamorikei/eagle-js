import path from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { EagleApiError } from "./EagleApiError.ts";
import { EagleClient } from "./EagleClient.ts";

// Integration tests for the v2 namespace against a running Eagle with the "Testing" library selected.
// Everything created here is removed or moved to the trash afterwards. Existing tag groups and
// smart folders in the library are left alone.

const v2 = EagleClient.instance.v2;
const run = Date.now().toString(36);
const asset = (name: string) => path.join(__dirname, "../assets", name);

const createdItemIds: string[] = [];
const createdTagGroupIds: string[] = [];
const createdSmartFolderIds: string[] = [];

// item/add returns before the items are indexed; wait until all of them can be found.
const waitForItems = async (ids: string[], timeoutMs = 10000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const result = await v2.item.get({ ids, fields: ["id"] });
    if (result.data.total === ids.length) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Items were not indexed within ${timeoutMs}ms: ${ids.join(", ")}`);
};

beforeAll(async () => {
  const info = await v2.library.info();
  if (info.data.name !== "Testing") {
    throw new Error("Library for testing is not selected");
  }
});

afterAll(async () => {
  for (const id of createdTagGroupIds) {
    await v2.tagGroup.remove({ id });
  }
  for (const id of createdSmartFolderIds) {
    await v2.smartFolder.remove({ id }).catch(() => undefined);
  }
  for (const id of createdItemIds) {
    await v2.item.update({ id, isDeleted: true });
  }
});

describe("v2 app and library", () => {
  test("app.info", async () => {
    const result = await v2.app.info();
    expect(result.data.version).toMatch(/^4\./);
  });

  test("library.info", async () => {
    const result = await v2.library.info();
    expect(result.data.path).toMatch(/Testing\.library$/);
    expect(Array.isArray(result.data.tagsGroups)).toBe(true);
  });

  test("library.history", async () => {
    const result = await v2.library.history({ limit: 1 });
    expect(result.data.limit).toBe(1);
    expect(result.data.data.length).toBeLessThanOrEqual(1);
  });

  test("library.icon of the current library", async () => {
    const info = await v2.library.info();
    // The "Testing" library may or may not have an icon set.
    const icon = await v2.library.icon({ libraryPath: info.data.path }).catch((e: unknown) => e);
    if (icon instanceof EagleApiError) {
      expect(icon.message).toContain("icon");
    } else {
      expect(icon).toBeInstanceOf(ArrayBuffer);
      expect([...new Uint8Array(icon as ArrayBuffer).slice(0, 4)]).toEqual([0x89, 0x50, 0x4e, 0x47]);
    }
  });

  test("library.icon of a nonexistent library throws EagleApiError", async () => {
    await expect(v2.library.icon({ libraryPath: "/nonexistent/Nothing.library" })).rejects.toThrow(EagleApiError);
  });
});

describe("v2 item", () => {
  const tag = `v2item-${run}`;

  test("add one item and a batch", async () => {
    const single = await v2.item.add({ path: asset("ic_tag.svg"), name: `v2-single-${run}`, tags: [tag] });
    createdItemIds.push(single.data.id);

    const batch = await v2.item.add({
      items: [
        { path: asset("ic_multilevel.svg"), name: `v2-batch1-${run}`, tags: [tag] },
        { path: asset("ic_smartFolder.svg"), name: `v2-batch2-${run}`, tags: [tag] },
      ],
    });
    expect(batch.data.ids).toHaveLength(2);
    createdItemIds.push(...batch.data.ids);
    await waitForItems(createdItemIds);
  });

  test("get by ids, by tag and with fields", async () => {
    const byIds = await v2.item.get({ ids: createdItemIds });
    expect(byIds.data.data.map((item) => item.id).sort()).toEqual([...createdItemIds].sort());

    const byTag = await v2.item.get({ tags: [tag], fields: ["id", "name"], limit: 1 });
    expect(byTag.data.total).toBe(3);
    expect(byTag.data.data).toHaveLength(1);
    expect(Object.keys(byTag.data.data[0]).sort()).toEqual(["id", "name"]);

    const unknown = await v2.item.get({ id: "invalid-id-12345" });
    expect(unknown.data.data).toEqual([]);
  });

  test("query", async () => {
    const result = await v2.item.query({ query: `v2-single-${run}` });
    expect(result.data.data.map((item) => item.id)).toContain(createdItemIds[0]);
  });

  test("countAll includes trashed items", async () => {
    const count = await v2.item.countAll();
    const listed = await v2.item.get({ fields: ["id"], limit: 1 });
    expect(count.data).toBeGreaterThanOrEqual(listed.data.total);
  });

  test("update", async () => {
    const result = await v2.item.update({ id: createdItemIds[0], star: 3, annotation: "v2 annotation" });
    expect(result.data !== false && result.data.star).toBe(3);
  });

  test("update of an unknown item returns data: false", async () => {
    const result = await v2.item.update({ id: "invalid-id-12345", name: "x" });
    expect(result.data).toBe(false);
  });

  test("comments", async () => {
    const id = createdItemIds[0];
    const added = await v2.item.addComment({ id, x: 1, y: 2, width: 10, height: 10, annotation: "v2 comment" });
    const commentId = added.data.id;

    const list = await v2.item.getComments({ id });
    expect(list.data.map((comment) => comment.id)).toContain(commentId);

    const updated = await v2.item.updateComment({ id, commentId, annotation: "v2 comment 2" });
    expect(updated.data.annotation).toBe("v2 comment 2");

    await expect(v2.item.updateComment({ id, commentId, duration: 3 })).rejects.toThrow(EagleApiError);

    const removed = await v2.item.removeComment({ id, commentId });
    expect(removed.data).toBe(true);
  });

  test("getComments of an unknown item throws EagleApiError", async () => {
    await expect(v2.item.getComments({ id: "invalid-id-12345" })).rejects.toThrow(EagleApiError);
  });

  test("setCustomThumbnail and refreshThumbnail", async () => {
    const id = createdItemIds[1];
    const set = await v2.item.setCustomThumbnail({ itemId: id, filePath: asset("logo@2x.png") });
    expect(set.data).toBe(true);
    const refreshed = await v2.item.refreshThumbnail({ itemId: id });
    expect(refreshed.data).toBe(true);
  });

  test("update with isDeleted moves the item to the trash", async () => {
    const id = createdItemIds[2];
    const result = await v2.item.update({ id, isDeleted: true });
    expect(result.data !== false && result.data.isDeleted).toBe(true);
    const listed = await v2.item.get({ ids: [id] });
    expect(listed.data.data).toEqual([]);
  });
});

describe("v2 folder", () => {
  let folderId = "";

  test("create", async () => {
    const result = await v2.folder.create({ name: `v2-folder-${run}`, description: "v2 test" });
    if (result.data === false) {
      throw new Error("Folder was not created");
    }
    folderId = result.data.id;
  });

  test("update", async () => {
    const result = await v2.folder.update({ id: folderId, name: `v2-folder-renamed-${run}`, iconColor: "green" });
    expect(result.data?.iconColor).toBe("green");
  });

  test("get by id", async () => {
    const result = await v2.folder.get({ id: folderId });
    expect(result.data.data[0].name).toBe(`v2-folder-renamed-${run}`);
  });
});

describe("v2 tag and tag group", () => {
  const tagA = `v2tag-a-${run}`;
  const tagB = `v2tag-b-${run}`;
  const tagRenamed = `v2tag-renamed-${run}`;
  let groupId = "";

  beforeAll(async () => {
    const result = await v2.item.add({ path: asset("ic_tag.svg"), name: `v2-tags-${run}`, tags: [tagA, tagB] });
    createdItemIds.push(result.data.id);
    await waitForItems([result.data.id]);
  });

  test("tag.get finds the tags", async () => {
    const result = await v2.tag.get({ name: `v2tag-a-${run}` });
    expect(result.data.data.map((tag) => tag.name)).toContain(tagA);
  });

  test("tag.update renames a tag", async () => {
    const result = await v2.tag.update({ originalName: tagA, name: tagRenamed });
    expect(result.data?.name).toBe(tagRenamed);
  });

  test("tag.merge merges a tag into another", async () => {
    const result = await v2.tag.merge({ source: tagRenamed, target: tagB });
    expect(result.data).toEqual({ affectedItems: 1, sourceRemoved: true });
  });

  test("recent and starred tags", async () => {
    await v2.tag.getRecentTags({ limit: 5 });
    await v2.tag.getStarredTags({ limit: 5 });
  });

  test("tagGroup.create without a color", async () => {
    const result = await v2.tagGroup.create({ name: `v2-group-${run}`, tags: [tagB] });
    if (result.data === false) {
      throw new Error("Tag group was not created");
    }
    groupId = result.data.id;
    createdTagGroupIds.push(groupId);
    expect(result.data.color).toBeUndefined();
  });

  test("tagGroup.update, addTags and removeTags", async () => {
    const updated = await v2.tagGroup.update({ id: groupId, name: `v2-group-${run}`, tags: [tagB], color: "blue" });
    expect(updated.data?.color).toBe("blue");

    const added = await v2.tagGroup.addTags({ groupId, tags: [tagRenamed] });
    expect(added.data?.tags).toEqual([tagB, tagRenamed]);

    const removed = await v2.tagGroup.removeTags({ groupId, tags: [tagRenamed] });
    expect(removed.data?.tags).toEqual([tagB]);
  });

  test("tagGroup.get lists the group", async () => {
    const result = await v2.tagGroup.get({ limit: 1000 });
    expect(result.data.data.map((group) => group.id)).toContain(groupId);
  });

  test("tagGroup.remove", async () => {
    const result = await v2.tagGroup.remove({ id: groupId });
    expect(result.data).toBe(true);
    createdTagGroupIds.splice(createdTagGroupIds.indexOf(groupId), 1);
  });

  test("tagGroup.remove of an unknown group returns data: false", async () => {
    const result = await v2.tagGroup.remove({ id: "invalid-id-12345" });
    expect(result.data).toBe(false);
  });
});

describe("v2 smart folder", () => {
  const tag = `v2smart-${run}`;
  let smartFolderId = "";

  beforeAll(async () => {
    const result = await v2.item.add({ path: asset("ic_tag.svg"), name: `v2-smart-${run}`, tags: [tag] });
    createdItemIds.push(result.data.id);
    await waitForItems([result.data.id]);
  });

  test("getRules", async () => {
    const result = await v2.smartFolder.getRules();
    expect(result.data.tags.methods.length).toBeGreaterThan(0);
  });

  test("create", async () => {
    const result = await v2.smartFolder.create({
      name: `v2-smart-${run}`,
      conditions: [{ rules: [{ property: "tags", method: "intersection", value: [tag] }], match: "AND" }],
      iconColor: "blue",
    });
    smartFolderId = result.data.id;
    createdSmartFolderIds.push(smartFolderId);
    expect(result.data.iconColor).toBe("blue");
  });

  test("update", async () => {
    const result = await v2.smartFolder.update({ id: smartFolderId, description: "v2 test" });
    expect(result.data.description).toBe("v2 test");
  });

  test("get with pagination", async () => {
    // Create a second smart folder so that there are at least two, whatever the library already has.
    const extra = await v2.smartFolder.create({
      name: `v2-smart-extra-${run}`,
      conditions: [{ rules: [{ property: "tags", method: "intersection", value: [tag] }], match: "AND" }],
    });
    createdSmartFolderIds.push(extra.data.id);

    const all = await v2.smartFolder.get({ limit: 1000 });
    expect(all.data.data.map((folder) => folder.id)).toEqual(expect.arrayContaining([smartFolderId, extra.data.id]));
    expect(all.data.total).toBeGreaterThanOrEqual(2);

    const second = await v2.smartFolder.get({ offset: 1, limit: 1 });
    expect(second.data.data).toHaveLength(1);
    expect(second.data.data[0].id).toBe(all.data.data[1].id);
  });

  test("getItems", async () => {
    const result = await v2.smartFolder.getItems({ smartFolderId, fields: ["id", "tags"] });
    expect(result.data.data.map((item) => item.id)).toEqual([createdItemIds.at(-1)]);

    const filtered = await v2.item.get({ smartFolders: [smartFolderId], fields: ["id"] });
    expect(filtered.data.total).toBe(1);
  });

  test("remove", async () => {
    const result = await v2.smartFolder.remove({ id: smartFolderId });
    expect(result.data).toBe(true);
    createdSmartFolderIds.splice(createdSmartFolderIds.indexOf(smartFolderId), 1);
  });

  test("remove of an unknown smart folder throws EagleApiError", async () => {
    await expect(v2.smartFolder.remove({ id: "invalid-id-12345" })).rejects.toThrow(EagleApiError);
  });
});

describe("v2 AI search", () => {
  test("isInstalled", async () => {
    const result = await v2.aiSearch.isInstalled();
    expect(typeof result.data).toBe("boolean");
  });

  test("without the plugin, status calls return false and searches throw EagleApiError", async () => {
    if ((await v2.aiSearch.isInstalled()).data) {
      return; // Only the "not installed" case can be checked without depending on the plugin's state.
    }
    expect((await v2.aiSearch.isReady()).data).toBe(false);
    expect((await v2.aiSearch.isStarting()).data).toBe(false);
    expect((await v2.aiSearch.isSyncing()).data).toBe(false);
    const error = await v2.aiSearch.searchByText({ query: "cat" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(EagleApiError);
    expect((error as EagleApiError).errorResponse).toMatchObject({ code: "PLUGIN_NOT_INSTALLED" });
    await expect(v2.aiSearch.getSyncStatus()).rejects.toThrow(EagleApiError);
    await expect(v2.aiSearch.checkServiceHealth()).rejects.toThrow(EagleApiError);
  });
});
