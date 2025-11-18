import type { OutgoingHttpHeaders } from "node:http";
import { Api } from "./Api";
import { EagleApiError } from "./EagleApiError";
import * as schemas from "./schemas";
import type { Color, Item, Order } from "./types";

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

  getApplicationInfo = async () => {
    const res = await fetch(this._url + Api.application.info, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.application.info);
    }
    const json = await res.json();
    return schemas.getApplicationInfoSchema.parse(json);
  };

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

  getFolderList = async () => {
    const res = await fetch(this._url + Api.folder.list, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.folder.list);
    }
    const json = await res.json();
    return schemas.getFolderListSchema.parse(json);
  };

  getRecentFolderList = async () => {
    const res = await fetch(this._url + Api.folder.listRecent, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.folder.listRecent);
    }
    const json = await res.json();
    return schemas.getRecentFolderListSchema.parse(json);
  };

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

  getItemInfo = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.info}?${params.toString()}`, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.item.info);
    }
    const json = await res.json();
    return schemas.getItemInfoSchema.parse(json);
  };

  getItemThumbnail = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.thumbnail}?${params.toString()}`, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.item.thumbnail);
    }
    const json = await res.json();
    return schemas.getItemThumbnailSchema.parse(json);
  };
  // TODO: Implement method to get thumbnail data not path

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

  getLibraryInfo = async () => {
    const res = await fetch(this._url + Api.library.info, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.library.info);
    }
    const json = await res.json();
    return schemas.getLibraryInfoSchema.parse(json);
  };

  getLibraryHistory = async () => {
    const res = await fetch(this._url + Api.library.history, { redirect: "follow" });
    if (!res.ok) {
      await this.handleErrorResponse(res, "GET", Api.library.history);
    }
    const json = await res.json();
    return schemas.getLibraryHistorySchema.parse(json);
  };

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
