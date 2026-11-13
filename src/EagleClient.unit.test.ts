import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ZodError } from "zod";
import { EagleApiError } from "./EagleApiError.ts";
import { EagleClient } from "./EagleClient.ts";
import { colorSchema } from "./schemas.ts";
import { Color } from "./types.ts";

// Unit tests with a mocked fetch. They do not need the Eagle app and run in CI.

const client = EagleClient.instance;
const fetchMock = vi.fn<typeof fetch>();

const respond = (body: unknown, status = 200) => {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  fetchMock.mockResolvedValueOnce(new Response(text, { status }));
};

const lastRequest = () => {
  const [input, init] = fetchMock.mock.calls.at(-1) ?? [];
  return { url: new URL(String(input)), init };
};

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("definitions", () => {
  test("Color and colorSchema list the same colors", () => {
    expect(colorSchema.options).toEqual(Object.values(Color));
  });
});

describe("request building", () => {
  test("GET sends no body and parses the response", async () => {
    respond({ status: "success", data: ["/path/to/library"] });
    const result = await client.getLibraryHistory();
    expect(result.data).toEqual(["/path/to/library"]);

    const { url, init } = lastRequest();
    expect(url.href).toBe("http://localhost:41595/api/library/history");
    expect(init?.method).toBe("GET");
    expect(init?.body).toBeUndefined();
  });

  test("POST sends the data as a JSON body", async () => {
    respond({ status: "success" });
    await client.moveItemToTrash({ itemIds: ["a", "b"] });

    const { url, init } = lastRequest();
    expect(url.pathname).toBe("/api/item/moveToTrash");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(String(init?.body))).toEqual({ itemIds: ["a", "b"] });
  });

  test("getItemList omits undefined params, keeps zero values and joins arrays", async () => {
    respond({ status: "success", data: [] });
    await client.getItemList({
      keyword: undefined,
      limit: 0,
      offset: 0,
      orderBy: "-CREATEDATE",
      tags: ["Design", "Poster"],
      folders: ["F1", "F2"],
    });

    const { url } = lastRequest();
    expect(url.searchParams.has("keyword")).toBe(false);
    expect(url.searchParams.get("limit")).toBe("0");
    expect(url.searchParams.get("offset")).toBe("0");
    expect(url.searchParams.get("orderBy")).toBe("-CREATEDATE");
    expect(url.searchParams.get("tags")).toBe("Design,Poster");
    expect(url.searchParams.get("folders")).toBe("F1,F2");
  });

  test("getItemList with no params sends no query string", async () => {
    respond({ status: "success", data: [] });
    await client.getItemList({});
    expect(lastRequest().url.href).toBe("http://localhost:41595/api/item/list");
  });

  test("query values are URL-encoded", async () => {
    respond({ status: "success", data: "/thumb.png" });
    await client.getItemThumbnail({ id: "a b&c" });
    expect(lastRequest().url.searchParams.get("id")).toBe("a b&c");
  });
});

describe("response schemas", () => {
  test("getLibraryInfo accepts the smart folder and tag group shapes in the API docs", async () => {
    respond({
      status: "success",
      data: {
        folders: [],
        smartFolders: [
          {
            id: "S1",
            name: "Recent",
            modificationTime: 1700000000000,
            conditions: [
              {
                match: "AND",
                rules: [
                  { method: "within", property: "createTime", value: [7] },
                  { method: "intersection", property: "tags", value: ["Poster"] },
                  { method: "similar", property: "color", value: "#ff0000" },
                ],
              },
            ],
          },
        ],
        quickAccess: [],
        tagsGroups: [
          { id: "G1", name: "With color", tags: ["a"], color: "red" },
          { id: "G2", name: "Without color", tags: ["b"] },
        ],
        modificationTime: 1700000000000,
        applicationVersion: "4.0.0",
        library: { path: "/path/to/Testing.library", name: "Testing" },
      },
    });
    const result = await client.getLibraryInfo();
    expect(result.data.smartFolders[0].conditions[0].rules.map((rule) => rule.value)).toEqual([
      [7],
      ["Poster"],
      "#ff0000",
    ]);
    expect(result.data.tagsGroups[1].color).toBeUndefined();
  });

  test("updateFolder keeps imagesMappings as spelled in the API docs", async () => {
    respond({
      status: "success",
      data: {
        id: "F1",
        name: "Folder",
        description: "Description",
        images: [],
        folders: [],
        modificationTime: 1700000000000,
        imagesMappings: { a: 1 },
        tags: [],
        children: [],
        isExpand: true,
      },
    });
    const result = await client.updateFolder({ folderId: "F1", newDescription: "Description" });
    expect(result.data.imagesMappings).toEqual({ a: 1 });
  });
});

describe("getLibraryIcon", () => {
  test("returns the image bytes", async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    fetchMock.mockResolvedValueOnce(new Response(bytes, { status: 200, headers: { "content-type": "image/png" } }));
    const result = await client.getLibraryIcon({ libraryPath: "/path/to/My Library.library" });
    expect(new Uint8Array(result)).toEqual(bytes);

    const { url, init } = lastRequest();
    expect(url.pathname).toBe("/api/library/icon");
    expect(url.searchParams.get("libraryPath")).toBe("/path/to/My Library.library");
    expect(init?.method).toBe("GET");
  });

  test("throws EagleApiError for a JSON error with HTTP 200", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "error", data: "Library not found" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    await expect(client.getLibraryIcon({ libraryPath: "/missing" })).rejects.toThrow(EagleApiError);
  });

  test("throws EagleApiError for a non-OK response", async () => {
    respond("Not Found", 404);
    await expect(client.getLibraryIcon({ libraryPath: "/missing" })).rejects.toThrow(EagleApiError);
  });
});

describe("error handling", () => {
  const getError = async (promise: Promise<unknown>) => {
    const error = await promise.then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(EagleApiError);
    return error as EagleApiError;
  };

  test("non-OK response with code/message throws EagleApiError", async () => {
    respond({ status: "error", code: 404, message: "Not found" }, 404);
    const error = await getError(client.getItemInfo({ id: "x" }));
    expect(error.httpStatus).toBe(404);
    expect(error.method).toBe("GET");
    expect(error.endpoint).toBe("/api/item/info");
    expect(error.errorResponse).toEqual({ status: "error", code: 404, message: "Not found" });
    expect(error.message).toBe("Eagle API Error [GET /api/item/info]: 404: Not found");
  });

  test("non-OK response with data throws EagleApiError", async () => {
    respond({ status: "error", data: "Item does not exist." }, 400);
    const error = await getError(client.updateItem({ id: "x" }));
    expect(error.httpStatus).toBe(400);
    expect(error.errorResponse).toEqual({ status: "error", data: "Item does not exist." });
  });

  test("HTTP 200 with status error throws EagleApiError", async () => {
    respond({ status: "error", data: "Item does not exist." }, 200);
    const error = await getError(client.getItemInfo({ id: "x" }));
    expect(error.httpStatus).toBe(200);
    expect(error.errorResponse).toEqual({ status: "error", data: "Item does not exist." });
  });

  test("non-JSON error body throws EagleApiError with the raw text", async () => {
    respond("Internal Server Error", 500);
    const error = await getError(client.getApplicationInfo());
    expect(error.httpStatus).toBe(500);
    expect(error.errorResponse).toEqual({ status: "error", data: "Internal Server Error" });
  });

  test("empty error body throws EagleApiError with the status line", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503, statusText: "Service Unavailable" }));
    const error = await getError(client.getApplicationInfo());
    expect(error.errorResponse).toEqual({ status: "error", data: "503 Service Unavailable" });
  });

  test("error body in an unknown shape throws EagleApiError with the raw text", async () => {
    const body = JSON.stringify({ status: "error", message: "not found" });
    respond(body, 404);
    const error = await getError(client.getItemInfo({ id: "x" }));
    expect(error.errorResponse).toEqual({ status: "error", data: body });
  });

  test("success response that does not match the schema throws ZodError", async () => {
    respond({ status: "success", data: { unexpected: true } });
    await expect(client.getItemInfo({ id: "x" })).rejects.toThrow(ZodError);
  });

  test("network failure is passed through as is", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("fetch failed"));
    await expect(client.getApplicationInfo()).rejects.toThrow(TypeError);
  });
});
