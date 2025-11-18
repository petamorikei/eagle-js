import type { OutgoingHttpHeaders } from "node:http";
import { Api } from "./Api";
import { EagleApiError } from "./EagleApiError";
import * as schemas from "./schemas";
import type { Color, Item, Order } from "./types";

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

  private async handleErrorResponse(res: Response, method: string, endpoint: string): Promise<never> {
    const json = await res.json();
    const errorBody = schemas.eagleErrorResponseSchema.parse(json);
    throw new EagleApiError(method, endpoint, res.status, errorBody);
  }

  /**
   * Get Eagle application information.
   *
   * @returns Application information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/application/info
   */
  getApplicationInfo = async () => {
    const res = await fetch(this._url + Api.application.info, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.application.info);
    }
    const json = await res.json();
    return schemas.getApplicationInfoSchema.parse(json);
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
    const res = await fetch(this._url + Api.folder.create, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.folder.create);
    }
    const json = await res.json();
    return schemas.createFolderSchema.parse(json);
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
    const res = await fetch(this._url + Api.folder.rename, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.folder.rename);
    }
    const json = await res.json();
    return schemas.renameFolderSchema.parse(json);
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
    const res = await fetch(this._url + Api.folder.update, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.folder.update);
    }
    const json = await res.json();
    return schemas.updateFolderSchema.parse(json);
  };

  /**
   * Get list of all folders.
   *
   * @returns List of folders
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/list
   */
  getFolderList = async () => {
    const res = await fetch(this._url + Api.folder.list, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.folder.list);
    }
    const json = await res.json();
    return schemas.getFolderListSchema.parse(json);
  };

  /**
   * Get list of recently used folders.
   *
   * @returns List of recent folders
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/folder/list-recent
   */
  getRecentFolderList = async () => {
    const res = await fetch(this._url + Api.folder.listRecent, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.folder.listRecent);
    }
    const json = await res.json();
    return schemas.getRecentFolderListSchema.parse(json);
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
    headers?: OutgoingHttpHeaders;
  }) => {
    const res = await fetch(this._url + Api.item.addFromUrl, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.addFromUrl);
    }
    const json = await res.json();
    return schemas.addItemFromUrlSchema.parse(json);
  };

  /**
   * Add multiple items from URLs.
   *
   * @param data - Items parameters
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/add-from-urls
   */
  addItemFromUrls = async (data: { items: Item[]; folderId?: string }) => {
    const res = await fetch(this._url + Api.item.addFromUrls, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.addFromUrls);
    }
    const json = await res.json();
    return schemas.addItemFromUrlsSchema.parse(json);
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
    name?: string;
    website?: string;
    annotation?: string;
    tags?: string[];
    folderId?: string;
  }) => {
    const res = await fetch(this._url + Api.item.addFromPath, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.addFromPath);
    }
    const json = await res.json();
    return schemas.addItemFromPathSchema.parse(json);
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
      name?: string;
      website?: string;
      annotation?: string;
      tags?: string[];
    }[];
    folderId?: string;
  }) => {
    const res = await fetch(this._url + Api.item.addFromPaths, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.addFromPaths);
    }
    const json = await res.json();
    return schemas.addItemFromPathsSchema.parse(json);
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
    const res = await fetch(this._url + Api.item.addBookmark, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.addBookmark);
    }
    const json = await res.json();
    return schemas.addBookmarkSchema.parse(json);
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
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.info}?${params.toString()}`, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.item.info);
    }
    const json = await res.json();
    return schemas.getItemInfoSchema.parse(json);
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
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.thumbnail}?${params.toString()}`, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.item.thumbnail);
    }
    const json = await res.json();
    return schemas.getItemThumbnailSchema.parse(json);
  };

  /**
   * Get list of items.
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
    const stringifiedData = Object.entries(data).map(([key, value]): [string, string] => {
      return typeof value !== "string" ? [key, `${value}`] : [key, value];
    });
    const params = new URLSearchParams(stringifiedData);
    const res = await fetch(`${this._url}${Api.item.list}?${params.toString()}`, { redirect: "follow" });

    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.item.list);
    }
    const json = await res.json();
    return schemas.getItemListSchema.parse(json);
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
    const res = await fetch(this._url + Api.item.moveToTrash, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.moveToTrash);
    }
    const json = await res.json();
    return schemas.moveItemToTrashSchema.parse(json);
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
    const res = await fetch(this._url + Api.item.refreshPalette, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.refreshPalette);
    }
    const json = await res.json();
    return schemas.refreshItemPaletteSchema.parse(json);
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
    const res = await fetch(this._url + Api.item.refreshThumbnail, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.refreshThumbnail);
    }
    const json = await res.json();
    return schemas.refreshThumbnailSchema.parse(json);
  };

  /**
   * Update item metadata.
   *
   * @param data - Update parameters
   * @returns Updated item information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/item/update
   */
  updateItem = async (data: { id: string; tags?: string[]; annotation?: string[]; url?: string; star?: number }) => {
    const res = await fetch(this._url + Api.item.update, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.item.update);
    }
    const json = await res.json();
    return schemas.updateItemSchema.parse(json);
  };

  /**
   * Get current library information.
   *
   * @returns Library information
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/info
   */
  getLibraryInfo = async () => {
    const res = await fetch(this._url + Api.library.info, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.library.info);
    }
    const json = await res.json();
    return schemas.getLibraryInfoSchema.parse(json);
  };

  /**
   * Get library history.
   *
   * @returns Array of library paths
   * @throws {EagleApiError} When the API request fails
   * @see https://api.eagle.cool/library/history
   */
  getLibraryHistory = async () => {
    const res = await fetch(this._url + Api.library.history, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.library.history);
    }
    const json = await res.json();
    return schemas.getLibraryHistorySchema.parse(json);
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
    const res = await fetch(this._url + Api.library.switch, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      await this.handleErrorResponse(res, "POST", Api.library.switch);
    }
    const json = await res.json();
    return schemas.switchLibrarySchema.parse(json);
  };
}
