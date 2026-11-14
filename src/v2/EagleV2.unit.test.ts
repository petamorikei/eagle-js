import { afterEach, beforeEach, describe, expect, expectTypeOf, test, vi } from "vitest";
import { ZodError } from "zod";
import { EagleApiError } from "../EagleApiError.ts";
import { EagleClient } from "../EagleClient.ts";
import type * as V2 from "./types.ts";

// Unit tests for the v2 namespace with a mocked fetch. Response bodies are taken from Eagle 4.0.0 (build 20260401).

const client = EagleClient.instance;
const v2 = client.v2;
const fetchMock = vi.fn<typeof fetch>();

const respond = (body: unknown, status = 200) => {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  fetchMock.mockResolvedValueOnce(new Response(text, { status }));
};

const ok = (data?: unknown) => respond(data === undefined ? { status: "success" } : { status: "success", data });

const pageOf = (data: unknown[], { total = data.length, offset = 0, limit = 50 } = {}) => ({
  data,
  total,
  offset,
  limit,
});

const lastRequest = () => {
  const [input, init] = fetchMock.mock.calls.at(-1) ?? [];
  return {
    url: new URL(String(input)),
    method: init?.method,
    body: init?.body === undefined ? undefined : JSON.parse(String(init.body)),
  };
};

const getError = async (promise: Promise<unknown>) => {
  const error = await promise.then(
    () => undefined,
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(EagleApiError);
  return error as EagleApiError;
};

const item = {
  id: "MWGJN1C84MFUD",
  name: "v2-probe",
  size: 1058,
  btime: 1794587217335,
  mtime: 1794587217335,
  ext: "svg",
  tags: ["v2probe"],
  folders: [],
  isDeleted: false,
  url: "",
  annotation: "",
  modificationTime: 1794669091208,
  removeThumbnail: true,
  noThumbnail: true,
  height: 35,
  width: 35,
  palettes: [{ color: [4, 115, 242], ratio: 75 }],
};

const folder = {
  id: "MWGJN1EW73YWQ",
  name: "v2-folder-upd",
  description: "probe",
  images: [],
  folders: [],
  modificationTime: 1794669091304,
  imagesMappings: {},
  tags: [],
  children: [],
  isExpand: true,
  $$hashKey: "object:779",
  imageCount: 0,
  pinyin: "v2-folder",
  iconColor: "green",
};

const smartFolder = {
  id: "MWGJNLRCRPUDC",
  name: "v2-probe-sf",
  conditions: [{ rules: [{ property: "tags", method: "intersection", value: ["v2probe"] }], match: "AND" }],
  description: "",
  icon: "",
  iconColor: "blue",
  children: [],
  modificationTime: 1794669117672,
  imageCount: 1,
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("connection settings", () => {
  test("host and port are used for v1 and v2", async () => {
    const remote = new EagleClient({ host: "192.168.1.10", port: 12345 });
    ok({ version: "4.0.0", prereleaseVersion: null, buildVersion: "20260401", platform: "darwin" });
    await remote.v2.app.info();
    expect(lastRequest().url.href).toBe("http://192.168.1.10:12345/api/v2/app/info");

    ok(["/path/to/library"]);
    await remote.getLibraryHistory();
    expect(lastRequest().url.href).toBe("http://192.168.1.10:12345/api/library/history");
  });

  test("the token is sent as a query parameter on v1 and v2 requests", async () => {
    const remote = new EagleClient({ host: "192.168.1.10", token: "secret token" });

    ok(pageOf([item]));
    await remote.v2.item.get({ tags: ["a"] });
    expect(lastRequest().url.searchParams.get("token")).toBe("secret token");
    expect(lastRequest().body).toEqual({ tags: ["a"] });

    respond({ status: "success", data: [] });
    await remote.getItemList({ limit: 1 });
    expect(lastRequest().url.searchParams.get("token")).toBe("secret token");
    expect(lastRequest().url.searchParams.get("limit")).toBe("1");
  });

  test("the token is not part of the endpoint in errors", async () => {
    const remote = new EagleClient({ host: "192.168.1.10", token: "secret" });
    respond(
      {
        status: "error",
        code: 401,
        message: "Unauthorized: Access is denied due to invalid token.",
      },
      401,
    );
    const error = await getError(remote.v2.app.info());
    expect(error.endpoint).toBe("/api/v2/app/info");
    expect(error.httpStatus).toBe(401);
    expect(error.message).not.toContain("secret");
  });

  test("the default instance sends no token", async () => {
    ok(0);
    await v2.item.countAll();
    expect(lastRequest().url.href).toBe("http://localhost:41595/api/v2/item/countAll");
  });
});

describe("errors", () => {
  test("a v2 error (HTTP 500 with message) throws EagleApiError", async () => {
    respond({ status: "error", message: "smart folder not found: x", data: {} }, 500);
    const error = await getError(v2.smartFolder.remove({ id: "x" }));
    expect(error.httpStatus).toBe(500);
    expect(error.method).toBe("POST");
    expect(error.endpoint).toBe("/api/v2/smartFolder/remove");
    expect(error.errorResponse).toEqual({ status: "error", message: "smart folder not found: x", data: {} });
    expect(error.message).toBe("Eagle API Error [POST /api/v2/smartFolder/remove]: smart folder not found: x");
  });

  test("an unknown endpoint (HTTP 404 with code) throws EagleApiError", async () => {
    respond({ status: "error", code: 404, message: "method not allowed" }, 404);
    const error = await getError(v2.item.getComments({ id: "x" }));
    expect(error.message).toBe("Eagle API Error [GET /api/v2/item/getComments]: 404: method not allowed");
  });

  test("a success response that does not match the schema throws ZodError", async () => {
    ok({ unexpected: true });
    await expect(v2.tagGroup.get()).rejects.toThrow(ZodError);
  });
});

describe("responses kept as Eagle returns them", () => {
  test("item.update returns data: false for an unknown item", async () => {
    ok(false);
    const result = await v2.item.update({ id: "missing", name: "x" });
    expect(result.data).toBe(false);
  });

  test("tagGroup.update returns no data for an unknown group", async () => {
    ok();
    const result = await v2.tagGroup.update({ id: "missing", name: "x", tags: [] });
    expect(result).toEqual({ status: "success" });
  });

  test("folder.create returns data: false when nothing was created", async () => {
    ok(false);
    expect((await v2.folder.create({ name: "" })).data).toBe(false);
  });

  test("tag.update and tag.merge return no data for an unknown tag", async () => {
    ok();
    expect((await v2.tag.update({ originalName: "missing", name: "x" })).data).toBeUndefined();
    ok();
    expect((await v2.tag.merge({ source: "missing", target: "x" })).data).toBeUndefined();
  });

  test("tagGroup.remove and item.refreshThumbnail return data: false for an unknown target", async () => {
    ok(false);
    expect((await v2.tagGroup.remove({ id: "missing" })).data).toBe(false);
    ok(false);
    expect((await v2.item.refreshThumbnail({ itemId: "missing" })).data).toBe(false);
  });

  test("fields not in the schema are kept", async () => {
    ok(pageOf([folder]));
    const result = await v2.folder.get();
    expect(result.data.data[0].$$hashKey).toBe("object:779");
    expect(result.data.data[0].iconColor).toBe("green");
  });
});

describe("app and library", () => {
  test("app.info", async () => {
    ok({ version: "4.0.0", prereleaseVersion: null, buildVersion: "20260401", platform: "darwin" });
    const result = await v2.app.info();
    expect(result.data.buildVersion).toBe("20260401");
    expect(lastRequest().method).toBe("GET");
  });

  test("library.info accepts tagsGroups and smart folders as Eagle returns them", async () => {
    ok({
      folders: [{ ...folder, children: [{ ...folder, id: "CHILD" }] }],
      smartFolders: [
        {
          id: "MWG9CK8POZYGL",
          name: "some-tag",
          description: "",
          modificationTime: 1794651806329,
          conditions: [
            {
              rules: [{ property: "tags", method: "intersection", value: ["some-tag"], $$hashKey: "object:923" }],
              match: "OR",
              boolean: "TRUE",
            },
          ],
          children: [],
        },
      ],
      quickAccess: [],
      tagsGroups: [
        { id: "MWGJJN1Q9O2H8", name: "no-color", tags: [] },
        { id: "G2", name: "colored", tags: ["a"], color: "red", description: "d" },
      ],
      modificationTime: 1794668933036,
      applicationVersion: "4.0.0",
      path: "/Users/me/Testing.library",
      name: "Testing",
    });
    const result = await v2.library.info();
    expect(result.data.name).toBe("Testing");
    expect(result.data.folders[0].children[0].id).toBe("CHILD");
    expect(result.data.tagsGroups[0].color).toBeUndefined();
    expect(result.data.smartFolders[0].conditions[0].rules[0].value).toEqual(["some-tag"]);
  });

  test("library.history returns a page of paths", async () => {
    ok(pageOf(["/a.library", "/b.library"], { total: 3, limit: 2 }));
    const result = await v2.library.history({ limit: 2 });
    expect(result.data.data).toEqual(["/a.library", "/b.library"]);
    expect(lastRequest().url.searchParams.get("limit")).toBe("2");
  });

  test("library.switch sends the library path", async () => {
    ok(true);
    await v2.library.switch({ libraryPath: "/path/to/Other.library" });
    expect(lastRequest()).toMatchObject({ method: "POST", body: { libraryPath: "/path/to/Other.library" } });
  });

  test("library.icon converts the serialized Buffer to an ArrayBuffer", async () => {
    const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "success", data: { type: "Buffer", data: png } }), {
        headers: { "content-type": "application/json; charset=utf-8" },
      }),
    );
    const icon = await v2.library.icon({ libraryPath: "/path/to/My Library.library" });
    expect(icon).toBeInstanceOf(ArrayBuffer);
    expect([...new Uint8Array(icon)]).toEqual(png);
    expect(lastRequest().url.searchParams.get("libraryPath")).toBe("/path/to/My Library.library");
  });

  test("library.icon returns image bytes as is", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
    fetchMock.mockResolvedValueOnce(new Response(png, { headers: { "content-type": "image/png" } }));
    expect(new Uint8Array(await v2.library.icon({ libraryPath: "/x.library" }))).toEqual(png);
  });

  test("library.icon throws EagleApiError for a missing library", async () => {
    respond({ status: "error", message: "Library does not exist.", data: {} }, 500);
    const error = await getError(v2.library.icon({ libraryPath: "/missing.library" }));
    expect(error.message).toContain("Library does not exist.");
  });

  test("library.icon throws EagleApiError for a plain-text error", async () => {
    respond("Library icon does not exist.");
    await getError(v2.library.icon({ libraryPath: "/x.library" }));
  });
});

describe("item", () => {
  test("get sends filters as a JSON body with POST", async () => {
    ok(pageOf([item], { total: 12, limit: 10 }));
    const result = await v2.item.get({ tags: ["a", "b"], folders: ["F1"], smartFolders: ["S1"], offset: 0, limit: 10 });
    expect(lastRequest()).toMatchObject({
      method: "POST",
      body: { tags: ["a", "b"], folders: ["F1"], smartFolders: ["S1"], offset: 0, limit: 10 },
    });
    expect(lastRequest().url.pathname).toBe("/api/v2/item/get");
    expect(result.data.total).toBe(12);
    expect(result.data.data[0].palettes?.[0].ratio).toBe(75);
    expectTypeOf(result.data.data[0].id).toEqualTypeOf<string>();
  });

  test("get with fields validates and types only the requested fields", async () => {
    ok(pageOf([{ id: "A", name: "a", isDeleted: false }]));
    const result = await v2.item.get({ fields: ["id", "name", "isDeleted"], limit: 3 });
    expect(lastRequest().body).toEqual({ fields: ["id", "name", "isDeleted"], limit: 3 });
    expect(result.data.data[0]).toEqual({ id: "A", name: "a", isDeleted: false });
    expectTypeOf(result.data.data[0]).toEqualTypeOf<V2.ItemWithFields<"id" | "name" | "isDeleted">>();
  });

  test("get without params sends an empty body", async () => {
    ok(pageOf([]));
    await v2.item.get();
    expect(lastRequest().body).toEqual({});
  });

  test("query", async () => {
    ok(pageOf([item]));
    await v2.item.query({ query: "(cat OR dog) -cartoon", offset: 50, limit: 50 });
    expect(lastRequest()).toMatchObject({ method: "POST", body: { query: "(cat OR dog) -cartoon", offset: 50 } });
  });

  test("countAll", async () => {
    ok(22);
    expect((await v2.item.countAll()).data).toBe(22);
  });

  test("add returns id for one item and ids for a batch", async () => {
    ok({ id: "NEW" });
    const single = await v2.item.add({ path: "/tmp/a.png", name: "a", tags: ["t"] });
    expect(single.data.id).toBe("NEW");
    expectTypeOf(single.data.id).toEqualTypeOf<string>();

    ok({ ids: ["N1", "N2"] });
    const batch = await v2.item.add({
      items: [{ url: "https://example.com/a.png" }, { bookmarkURL: "https://e.com" }],
    });
    expect(batch.data.ids).toEqual(["N1", "N2"]);
    expectTypeOf(batch.data.ids).toEqualTypeOf<string[]>();
    expect(lastRequest().body).toEqual({
      items: [{ url: "https://example.com/a.png" }, { bookmarkURL: "https://e.com" }],
    });
  });

  test("update returns the item including extra fields", async () => {
    ok({ ...item, star: 3, oldName: "v2-probe", newName: "v2-probe-renamed" });
    const result = await v2.item.update({ id: item.id, star: 3, isDeleted: false });
    expect(result.data !== false && result.data.star).toBe(3);
    expect(result.data !== false && result.data.oldName).toBe("v2-probe");
  });

  test("setCustomThumbnail and refreshThumbnail", async () => {
    ok(true);
    await v2.item.setCustomThumbnail({ itemId: "A", filePath: "/tmp/t.png" });
    expect(lastRequest().body).toEqual({ itemId: "A", filePath: "/tmp/t.png" });
    ok(true);
    expect((await v2.item.refreshThumbnail({ itemId: "A" })).data).toBe(true);
  });

  test("comments", async () => {
    const comment = { id: "C1", annotation: "probe", lastModified: 1794669125549, x: 1, y: 2, width: 10, height: 10 };
    ok([comment]);
    expect((await v2.item.getComments({ id: "A" })).data).toEqual([comment]);
    expect(lastRequest().url.searchParams.get("id")).toBe("A");

    ok(comment);
    await v2.item.addComment({ id: "A", x: 1, y: 2, width: 10, height: 10, annotation: "probe" });
    ok({ id: "C2", annotation: "scene", lastModified: 1, duration: 65.5 });
    expect((await v2.item.addComment({ id: "V", duration: 65.5, annotation: "scene" })).data.duration).toBe(65.5);

    ok({ ...comment, annotation: "probe2" });
    await v2.item.updateComment({ id: "A", commentId: "C1", annotation: "probe2" });
    expect(lastRequest().body).toEqual({ id: "A", commentId: "C1", annotation: "probe2" });

    ok(true);
    expect((await v2.item.removeComment({ id: "A", commentId: "C1" })).data).toBe(true);
  });
});

describe("folder", () => {
  test("get, create and update", async () => {
    ok(pageOf([folder]));
    await v2.folder.get({ isRecent: true, limit: 1 });
    expect(lastRequest()).toMatchObject({ method: "POST", body: { isRecent: true, limit: 1 } });

    const { iconColor: _, imageCount: __, $$hashKey: ___, ...created } = folder;
    ok(created);
    const result = await v2.folder.create({ name: "v2-folder", description: "probe", parent: "P" });
    expect(result.data !== false && result.data.id).toBe(folder.id);

    ok(folder);
    await v2.folder.update({ id: folder.id, iconColor: "green", parent: null });
    expect(lastRequest().body).toEqual({ id: folder.id, iconColor: "green", parent: null });
  });
});

describe("smart folder", () => {
  test("get and getItems are paginated", async () => {
    ok(pageOf([smartFolder], { total: 2, offset: 1, limit: 1 }));
    const result = await v2.smartFolder.get({ offset: 1, limit: 1 });
    expect(lastRequest()).toMatchObject({ method: "POST", body: { offset: 1, limit: 1 } });
    expect(result.data.total).toBe(2);

    ok(pageOf([{ id: "A", name: "a" }]));
    const items = await v2.smartFolder.getItems({ smartFolderId: smartFolder.id, fields: ["id", "name"], limit: 1 });
    expect(lastRequest().body).toEqual({ smartFolderId: smartFolder.id, fields: ["id", "name"], limit: 1 });
    expectTypeOf(items.data.data[0]).toEqualTypeOf<V2.ItemWithFields<"id" | "name">>();
  });

  test("create, update, remove and getRules", async () => {
    ok(smartFolder);
    await v2.smartFolder.create({
      name: "v2-probe-sf",
      conditions: [{ rules: [{ property: "tags", method: "intersection", value: ["v2probe"] }], match: "AND" }],
      iconColor: "blue",
    });
    expect(lastRequest().body.conditions[0].match).toBe("AND");

    ok({ ...smartFolder, description: "d" });
    expect((await v2.smartFolder.update({ id: smartFolder.id, description: "d" })).data.description).toBe("d");

    ok(true);
    expect((await v2.smartFolder.remove({ id: smartFolder.id })).data).toBe(true);

    ok({
      name: {
        category: "STRING",
        methods: ["equal", "contain", "empty"],
        valueType: "string",
        noValueMethods: ["empty"],
      },
      width: { category: "NUMERIC", methods: ["=", ">", "between"], valueType: "number_pair" },
    });
    expect((await v2.smartFolder.getRules()).data.width.valueType).toBe("number_pair");
  });
});

describe("tag and tag group", () => {
  test("tag.get, update and merge", async () => {
    ok(pageOf([{ name: "v2probe", imageCount: 1, groups: [], pinyin: "v2probe" }]));
    const tags = await v2.tag.get({ name: "v2", limit: 5 });
    expect(tags.data.data[0].imageCount).toBe(1);
    expect(lastRequest()).toMatchObject({ method: "POST", body: { name: "v2", limit: 5 } });

    ok({ name: "v2renamed", imageCount: 1, groups: [], pinyin: "renamed" });
    expect((await v2.tag.update({ originalName: "renamed", name: "v2renamed" })).data?.name).toBe("v2renamed");

    ok({ affectedItems: 1, sourceRemoved: true });
    expect((await v2.tag.merge({ source: "v2renamed", target: "v2probe" })).data?.affectedItems).toBe(1);
  });

  test("recent and starred tags accept tag objects and names", async () => {
    ok(pageOf([{ name: "a", imageCount: 1, groups: [], pinyin: "a" }, "b"]));
    expect((await v2.tag.getRecentTags({ limit: 2 })).data.data).toHaveLength(2);
    expect(lastRequest().url.searchParams.get("limit")).toBe("2");
    ok(pageOf([]));
    await v2.tag.getStarredTags();
    expect(lastRequest().url.pathname).toBe("/api/v2/tag/getStarredTags");
  });

  test("tag group CRUD", async () => {
    const group = { id: "G", name: "g", tags: ["v2probe"], color: "red", description: "probe desc" };
    ok(pageOf([{ id: "N", name: "no-color", tags: [], $$hashKey: "object:530" }, group]));
    const groups = await v2.tagGroup.get({ offset: 0, limit: 10 });
    expect(groups.data.data[0].color).toBeUndefined();
    expect(lastRequest().url.searchParams.get("limit")).toBe("10");

    ok(group);
    const created = await v2.tagGroup.create({ name: "g", tags: ["v2probe"], color: "red", description: "probe desc" });
    expect(created.data !== false && created.data.color).toBe("red");

    ok({ ...group, tags: ["v2probe", "updated"] });
    await v2.tagGroup.addTags({ groupId: "G", tags: ["updated"], removeFromSource: true });
    expect(lastRequest().body).toEqual({ groupId: "G", tags: ["updated"], removeFromSource: true });

    ok(group);
    await v2.tagGroup.removeTags({ groupId: "G", tags: ["updated"] });

    ok(true);
    expect((await v2.tagGroup.remove({ id: "G" })).data).toBe(true);
  });
});

describe("AI search (documented responses)", () => {
  test("status endpoints", async () => {
    ok(false);
    expect((await v2.aiSearch.isInstalled()).data).toBe(false);
    ok(true);
    expect((await v2.aiSearch.isReady()).data).toBe(true);
    ok(false);
    await v2.aiSearch.isStarting();
    ok(false);
    await v2.aiSearch.isSyncing();
    ok({ isSyncing: false, syncedCount: 12500, totalCount: 12500, progress: 1.0 });
    expect((await v2.aiSearch.getSyncStatus()).data.progress).toBe(1);
    ok({ healthy: true });
    expect((await v2.aiSearch.checkServiceHealth()).data.healthy).toBe(true);
  });

  test("search endpoints", async () => {
    const results = {
      results: [
        {
          item: {
            id: "M3QSGJNQTC2DG",
            name: "sunset-beach",
            ext: "jpg",
            width: 1920,
            height: 1080,
            tags: ["nature"],
            star: 4,
          },
          score: 0.892,
        },
      ],
    };
    ok(results);
    const byText = await v2.aiSearch.searchByText({ query: "an orange cat", options: { limit: 10 } });
    expect(byText.data.results[0].score).toBe(0.892);
    expect(lastRequest().body).toEqual({ query: "an orange cat", options: { limit: 10 } });

    ok(results);
    await v2.aiSearch.searchByBase64({ base64: "/9j/4AAQ" });
    expect(lastRequest().url.pathname).toBe("/api/v2/aiSearch/searchByBase64");

    ok(results);
    await v2.aiSearch.searchByItemId({ itemId: "A", options: { limit: 5 } });
    expect(lastRequest().body).toEqual({ itemId: "A", options: { limit: 5 } });
  });
});
