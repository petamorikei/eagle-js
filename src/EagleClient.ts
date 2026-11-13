import type { z } from "zod";
import { Api } from "./Api.ts";
import { EagleApiError } from "./EagleApiError.ts";
import * as schemas from "./schemas.ts";
import type { AddItemFromUrlsItem, Color, EagleErrorResponse, HttpHeaders, Order } from "./types.ts";

type HttpMethod = "GET" | "POST";

type QueryValue = string | number | boolean | readonly string[] | undefined;

type RequestOptions = {
  /** Query parameters. `undefined` values are omitted and arrays are joined with `,`. */
  query?: Record<string, QueryValue>;
  /** Request body, serialized as JSON. */
  body?: unknown;
};

const toSearchParams = (query: Record<string, QueryValue>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    params.append(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return params;
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const isErrorStatus = (json: unknown) =>
  typeof json === "object" && json !== null && "status" in json && json.status === "error";

const toErrorResponse = (json: unknown, text: string, res: Response): EagleErrorResponse => {
  const parsed = schemas.eagleErrorResponseSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }
  return { status: "error", data: text || `${res.status} ${res.statusText}`.trim() };
};

/**
 * Client for interacting with the Eagle API.
 *
 * @see https://api.eagle.cool/
 */
export class EagleClient {
  private static _instance: EagleClient;
  private _host: string;
  private _port: number;
  private _url: string;

  private constructor(host = "localhost", port = 41595) {
    this._host = host;
    this._port = port;
    this._url = `http://${this._host}:${this._port}`;
  }

  /**
   * Get the singleton instance of EagleClient.
   *
   * @returns The singleton EagleClient instance
   */
  static get instance() {
    if (!EagleClient._instance) {
      EagleClient._instance = new EagleClient();
    }
    return EagleClient._instance;
  }

  /**
   * Send a request to the Eagle API. A non-OK HTTP response is thrown as {@link EagleApiError}.
   */
  private async send(method: HttpMethod, endpoint: string, { query, body }: RequestOptions = {}) {
    const search = query ? toSearchParams(query).toString() : "";
    const url = `${this._url}${endpoint}${search ? `?${search}` : ""}`;
    const res = await fetch(url, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "follow",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new EagleApiError(method, endpoint, res.status, toErrorResponse(parseJson(text), text, res));
    }
    return res;
  }

  /**
   * Send a request to the Eagle API and validate the JSON response.
   *
   * Any non-OK HTTP response, and any response whose `status` is `"error"`, is thrown as {@link EagleApiError}.
   * A successful response that does not match `schema` is thrown as a `ZodError`.
   */
  private async request<S extends z.ZodType>(
    method: HttpMethod,
    endpoint: string,
    schema: S,
    options?: RequestOptions,
  ): Promise<z.output<S>> {
    const res = await this.send(method, endpoint, options);
    const text = await res.text();
    const json = parseJson(text);
    if (isErrorStatus(json)) {
      throw new EagleApiError(method, endpoint, res.status, toErrorResponse(json, text, res));
    }
    return schema.parse(json);
  }

  /**
   * Get Eagle application information.
   *
   * @returns Application information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/application/info
   */
  getApplicationInfo = async () => {
    return this.request("GET", Api.application.info, schemas.getApplicationInfoSchema);
  };

  /**
   * Create a new folder.
   *
   * @param data - Folder parameters
   * @param data.folderName - Name of the folder
   * @param data.parentFolderId - Optional parent folder ID
   * @returns Created folder information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/create
   */
  createFolder = async (data: { folderName: string; parentFolderId?: string }) => {
    return this.request("POST", Api.folder.create, schemas.createFolderSchema, { body: data });
  };

  /**
   * Rename a folder.
   *
   * @param data - Rename parameters
   * @param data.folderId - ID of the folder to rename
   * @param data.newName - New name for the folder
   * @returns Updated folder information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/rename
   */
  renameFolder = async (data: { folderId: string; newName: string }) => {
    return this.request("POST", Api.folder.rename, schemas.renameFolderSchema, { body: data });
  };

  /**
   * Update folder properties.
   *
   * @param data - Update parameters
   * @param data.folderId - ID of the folder
   * @param data.newName - Optional new name
   * @param data.newDescription - Optional new description
   * @param data.newColor - Optional new color
   * @returns Updated folder information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/update
   */
  updateFolder = async (data: { folderId: string; newName?: string; newDescription?: string; newColor?: Color }) => {
    return this.request("POST", Api.folder.update, schemas.updateFolderSchema, { body: data });
  };

  /**
   * Get list of all folders.
   *
   * @returns List of folders
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/list
   */
  getFolderList = async () => {
    return this.request("GET", Api.folder.list, schemas.getFolderListSchema);
  };

  /**
   * Get list of recently used folders.
   *
   * @returns List of recent folders
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/list-recent
   */
  getRecentFolderList = async () => {
    return this.request("GET", Api.folder.listRecent, schemas.getRecentFolderListSchema);
  };

  /**
   * Add an item from URL.
   *
   * @param data - Item parameters
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/add-from-url
   */
  addItemFromUrl = async (data: {
    url: string;
    name: string;
    website?: string;
    tags?: string[];
    star?: number;
    annotation?: string;
    modificationTime?: number;
    folderId?: string;
    headers?: HttpHeaders;
  }) => {
    return this.request("POST", Api.item.addFromUrl, schemas.addItemFromUrlSchema, { body: data });
  };

  /**
   * Add multiple items from URLs.
   *
   * @param data - Items parameters
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/add-from-urls
   */
  addItemFromUrls = async (data: { items: AddItemFromUrlsItem[]; folderId?: string }) => {
    return this.request("POST", Api.item.addFromUrls, schemas.addItemFromUrlsSchema, { body: data });
  };

  /**
   * Add an item from local file path.
   *
   * @param data - Item parameters
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/add-from-path
   */
  addItemFromPath = async (data: {
    path: string;
    name: string;
    website?: string;
    annotation?: string;
    tags?: string[];
    folderId?: string;
  }) => {
    return this.request("POST", Api.item.addFromPath, schemas.addItemFromPathSchema, { body: data });
  };

  /**
   * Add multiple items from local file paths.
   *
   * @param data - Items parameters
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/add-from-paths
   */
  addItemFromPaths = async (data: {
    items: {
      path: string;
      name: string;
      website?: string;
      annotation?: string;
      tags?: string[];
    }[];
    folderId?: string;
  }) => {
    return this.request("POST", Api.item.addFromPaths, schemas.addItemFromPathsSchema, { body: data });
  };

  /**
   * Add a bookmark.
   *
   * @param data - Bookmark parameters
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/add-bookmark
   */
  addBookmark = async (data: {
    url: string;
    name?: string;
    base64?: string;
    tags?: string[];
    modificationTime?: number;
    folderId?: string;
  }) => {
    return this.request("POST", Api.item.addBookmark, schemas.addBookmarkSchema, { body: data });
  };

  /**
   * Get item information.
   *
   * @param data - Query parameters
   * @param data.id - Item ID
   * @returns Item information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/info
   */
  getItemInfo = async (data: { id: string }) => {
    return this.request("GET", Api.item.info, schemas.getItemInfoSchema, { query: data });
  };

  /**
   * Get item thumbnail path.
   *
   * @param data - Query parameters
   * @param data.id - Item ID
   * @returns Thumbnail file path
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/thumbnail
   */
  getItemThumbnail = async (data: { id: string }) => {
    return this.request("GET", Api.item.thumbnail, schemas.getItemThumbnailSchema, { query: data });
  };

  /**
   * Get list of items.
   *
   * Parameters set to `undefined` are not sent. `tags` and `folders` are sent as comma-separated lists.
   *
   * @param data - Query parameters
   * @returns List of items
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/list
   */
  getItemList = async (data: {
    limit?: number;
    offset?: number;
    orderBy?: Order;
    keyword?: string;
    ext?: string;
    tags?: string[];
    folders?: string[];
  }) => {
    return this.request("GET", Api.item.list, schemas.getItemListSchema, { query: data });
  };

  /**
   * Move items to trash.
   *
   * @param data - Parameters
   * @param data.itemIds - Array of item IDs
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/move-to-trash
   */
  moveItemToTrash = async (data: { itemIds: string[] }) => {
    return this.request("POST", Api.item.moveToTrash, schemas.moveItemToTrashSchema, { body: data });
  };

  /**
   * Refresh item color palette.
   *
   * @param data - Parameters
   * @param data.id - Item ID
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/refresh-palette
   */
  refreshItemPalette = async (data: { id: string }) => {
    return this.request("POST", Api.item.refreshPalette, schemas.refreshItemPaletteSchema, { body: data });
  };

  /**
   * Refresh item thumbnail.
   *
   * @param data - Parameters
   * @param data.id - Item ID
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/refresh-thumbnail
   */
  refreshThumbnail = async (data: { id: string }) => {
    return this.request("POST", Api.item.refreshThumbnail, schemas.refreshThumbnailSchema, { body: data });
  };

  /**
   * Update item metadata.
   *
   * @param data - Update parameters
   * @returns Updated item information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/update
   */
  updateItem = async (data: { id: string; tags?: string[]; annotation?: string; url?: string; star?: number }) => {
    return this.request("POST", Api.item.update, schemas.updateItemSchema, { body: data });
  };

  /**
   * Get current library information.
   *
   * @returns Library information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/info
   */
  getLibraryInfo = async () => {
    return this.request("GET", Api.library.info, schemas.getLibraryInfoSchema);
  };

  /**
   * Get library history.
   *
   * @returns Array of library paths
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/history
   */
  getLibraryHistory = async () => {
    return this.request("GET", Api.library.history, schemas.getLibraryHistorySchema);
  };

  /**
   * Switch to a different library.
   *
   * @param data - Parameters
   * @param data.libraryPath - Path to the library
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/switch
   */
  switchLibrary = async (data: { libraryPath: string }) => {
    return this.request("POST", Api.library.switch, schemas.switchLibrarySchema, { body: data });
  };

  /**
   * Get the icon image of a library.
   *
   * @param data - Parameters
   * @param data.libraryPath - Path to the library
   * @returns Icon image data
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/icon
   */
  getLibraryIcon = async (data: { libraryPath: string }): Promise<ArrayBuffer> => {
    const res = await this.send("GET", Api.library.icon, { query: data });
    const buffer = await res.arrayBuffer();
    if (res.headers.get("content-type")?.includes("json")) {
      const text = new TextDecoder().decode(buffer);
      const json = parseJson(text);
      if (isErrorStatus(json)) {
        throw new EagleApiError("GET", Api.library.icon, res.status, toErrorResponse(json, text, res));
      }
    }
    return buffer;
  };
}
