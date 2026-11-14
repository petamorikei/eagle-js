import { Api } from "./Api.ts";
import { EagleApiError } from "./EagleApiError.ts";
import { decodeTextError, type EagleClientOptions, EagleHttp, parseJson, toErrorResponse } from "./http.ts";
import * as schemas from "./schemas.ts";
import type { AddItemFromUrlsItem, Color, HttpHeaders, Order } from "./types.ts";
import { EagleV2 } from "./v2/EagleV2.ts";

export type { EagleClientOptions } from "./http.ts";

/**
 * Client for interacting with the Eagle API.
 *
 * The methods on the client itself call the legacy API (v1, `/api/...`).
 * The Web API v2 (`/api/v2/...`) is available under {@link EagleClient.v2}.
 *
 * @see https://api.eagle.cool/
 * @see https://developer.eagle.cool/web-api
 */
export class EagleClient {
  private static _instance: EagleClient;
  private readonly http: EagleHttp;

  /**
   * Eagle Web API v2 (`/api/v2/...`), grouped by category. It shares this client's connection settings.
   *
   * @see https://developer.eagle.cool/web-api
   */
  readonly v2: EagleV2;

  /**
   * Create a client. Use {@link EagleClient.instance} for the default connection (`http://localhost:41595`).
   *
   * @param options - Connection settings (host, port and API token)
   */
  constructor(options: EagleClientOptions = {}) {
    this.http = new EagleHttp(options);
    this.v2 = new EagleV2(this.http);
  }

  /**
   * Get the shared instance of EagleClient, connected to `http://localhost:41595` without a token.
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
   * Get Eagle application information.
   *
   * @returns Application information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/application/info
   */
  getApplicationInfo = async () => {
    return this.http.request("GET", Api.application.info, schemas.getApplicationInfoSchema);
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
    return this.http.request("POST", Api.folder.create, schemas.createFolderSchema, { body: data });
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
    return this.http.request("POST", Api.folder.rename, schemas.renameFolderSchema, { body: data });
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
    return this.http.request("POST", Api.folder.update, schemas.updateFolderSchema, { body: data });
  };

  /**
   * Get list of all folders.
   *
   * @returns List of folders
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/list
   */
  getFolderList = async () => {
    return this.http.request("GET", Api.folder.list, schemas.getFolderListSchema);
  };

  /**
   * Get list of recently used folders.
   *
   * @returns List of recent folders
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/list-recent
   */
  getRecentFolderList = async () => {
    return this.http.request("GET", Api.folder.listRecent, schemas.getRecentFolderListSchema);
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
    return this.http.request("POST", Api.item.addFromUrl, schemas.addItemFromUrlSchema, { body: data });
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
    return this.http.request("POST", Api.item.addFromUrls, schemas.addItemFromUrlsSchema, { body: data });
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
    return this.http.request("POST", Api.item.addFromPath, schemas.addItemFromPathSchema, { body: data });
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
    return this.http.request("POST", Api.item.addFromPaths, schemas.addItemFromPathsSchema, { body: data });
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
    return this.http.request("POST", Api.item.addBookmark, schemas.addBookmarkSchema, { body: data });
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
    return this.http.request("GET", Api.item.info, schemas.getItemInfoSchema, { query: data });
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
    return this.http.request("GET", Api.item.thumbnail, schemas.getItemThumbnailSchema, { query: data });
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
    return this.http.request("GET", Api.item.list, schemas.getItemListSchema, { query: data });
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
    return this.http.request("POST", Api.item.moveToTrash, schemas.moveItemToTrashSchema, { body: data });
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
    return this.http.request("POST", Api.item.refreshPalette, schemas.refreshItemPaletteSchema, { body: data });
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
    return this.http.request("POST", Api.item.refreshThumbnail, schemas.refreshThumbnailSchema, { body: data });
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
    return this.http.request("POST", Api.item.update, schemas.updateItemSchema, { body: data });
  };

  /**
   * Get current library information.
   *
   * @returns Library information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/info
   */
  getLibraryInfo = async () => {
    return this.http.request("GET", Api.library.info, schemas.getLibraryInfoSchema);
  };

  /**
   * Get library history.
   *
   * @returns Array of library paths
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/history
   */
  getLibraryHistory = async () => {
    return this.http.request("GET", Api.library.history, schemas.getLibraryHistorySchema);
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
    return this.http.request("POST", Api.library.switch, schemas.switchLibrarySchema, { body: data });
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
    const res = await this.http.send("GET", Api.library.icon, { query: data });
    const buffer = await res.arrayBuffer();
    if (res.headers.get("content-type")?.startsWith("image/")) {
      return buffer;
    }
    // Eagle 4 returns both the icon and errors such as "Library icon does not exist." with HTTP 200
    // and no Content-Type, so a short text body is treated as an error.
    const text = buffer.byteLength === 0 ? "" : decodeTextError(buffer);
    if (text !== undefined) {
      throw new EagleApiError("GET", Api.library.icon, res.status, toErrorResponse(parseJson(text), text, res));
    }
    return buffer;
  };
}
