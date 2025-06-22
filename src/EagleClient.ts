import type { OutgoingHttpHeaders } from "node:http";
import { Api } from "./Api";
import type {
  AddBookmarkResult,
  AddItemFromPathResult,
  AddItemFromPathsResult,
  AddItemFromUrlResult,
  AddItemFromUrlsResult,
  Color,
  CreateFolderResult,
  GetApplicationInfoResult,
  GetFolderListResult,
  GetItemInfoResult,
  GetItemListResult,
  GetItemThumbnailResult,
  GetLibraryHistoryResult,
  GetLibraryInfoResult,
  GetRecentFolderListResult,
  Item,
  MoveItemToTrashResult,
  Order,
  RefreshItemPaletteResult,
  RenameFolderResult,
  SwitchLibraryResult,
  UpdateFolderResult,
  UpdateItemResult,
} from "./types";

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

  getApplicationInfo = async () => {
    const res = await fetch(this._url + Api.application.info, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getApplicationInfoResult = (await res.json()) as GetApplicationInfoResult;
    return getApplicationInfoResult;
  };

  createFolder = async (data: { folderName: string; parentFolderId?: string }) => {
    const res = await fetch(this._url + Api.folder.create, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const createFolderResult = (await res.json()) as CreateFolderResult;
    return createFolderResult;
  };

  renameFolder = async (data: { folderId: string; newName: string }) => {
    const res = await fetch(this._url + Api.folder.rename, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const renameFolderResult = (await res.json()) as RenameFolderResult;
    return renameFolderResult;
  };

  updateFolder = async (data: { folderId: string; newName?: string; newDescription?: string; newColor?: Color }) => {
    const res = await fetch(this._url + Api.folder.update, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const updateFolderResult = (await res.json()) as UpdateFolderResult;
    return updateFolderResult;
  };

  getFolderList = async () => {
    const res = await fetch(this._url + Api.folder.list, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getFolderListResult = (await res.json()) as GetFolderListResult;
    return getFolderListResult;
  };

  getRecentFolderList = async () => {
    const res = await fetch(this._url + Api.folder.listRecent, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getRecentFolderListResult = (await res.json()) as GetRecentFolderListResult;
    return getRecentFolderListResult;
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
      throw new Error();
    }
    const addItemFromUrlResult = (await res.json()) as AddItemFromUrlResult;
    return addItemFromUrlResult;
  };

  addItemFromUrls = async (data: { items: Item[]; folderId?: string }) => {
    const res = await fetch(this._url + Api.item.addFromUrls, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const addItemFromUrlsResult = (await res.json()) as AddItemFromUrlsResult;
    return addItemFromUrlsResult;
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
      throw new Error();
    }
    const addItemFromPathResult = (await res.json()) as AddItemFromPathResult;
    return addItemFromPathResult;
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
      throw new Error();
    }
    const addItemsFromPathsResult = (await res.json()) as AddItemFromPathsResult;
    return addItemsFromPathsResult;
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
      throw new Error();
    }
    const addBookmarkResult = (await res.json()) as AddBookmarkResult;
    return addBookmarkResult;
  };

  getItemInfo = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.info}?${params.toString()}`, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getItemInfoResult = (await res.json()) as GetItemInfoResult;
    return getItemInfoResult;
  };

  getItemThumbnail = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.thumbnail}?${params.toString()}`, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getItemThumbnailResult = (await res.json()) as GetItemThumbnailResult;
    return getItemThumbnailResult;
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
    const stringifiedData = Object.entries(data).map(([key, value]) => {
      return typeof value !== "string" ? [key, `${value}`] : [key, value];
    });
    const params = new URLSearchParams(stringifiedData);
    const res = await fetch(`${this._url}${Api.item.list}?${params.toString()}`, { redirect: "follow" });

    if (!res.ok) {
      throw new Error();
    }
    const getItemListResult = (await res.json()) as GetItemListResult;
    return getItemListResult;
  };

  moveItemToTrash = async (data: { itemIds: string[] }) => {
    const res = await fetch(this._url + Api.item.moveToTrash, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const moveItemToTrashResult = (await res.json()) as MoveItemToTrashResult;
    return moveItemToTrashResult;
  };

  refreshItemPalette = async (data: { id: string }) => {
    const res = await fetch(this._url + Api.item.refreshPalette, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const refreshItemPaletteResult = (await res.json()) as RefreshItemPaletteResult;
    return refreshItemPaletteResult;
  };

  refreshThumbnail = async (data: { id: string }) => {
    const res = await fetch(this._url + Api.item.refreshThumbnail, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const refreshThumbnailResult = (await res.json()) as RefreshItemPaletteResult;
    return refreshThumbnailResult;
  };

  updateItem = async (data: { id: string; tags?: string[]; annotation?: string[]; url?: string; star?: number }) => {
    const res = await fetch(this._url + Api.item.update, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const updateItemResult = (await res.json()) as UpdateItemResult;
    return updateItemResult;
  };

  getLibraryInfo = async () => {
    const res = await fetch(this._url + Api.library.info, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getLibraryInfoResult = (await res.json()) as GetLibraryInfoResult;
    return getLibraryInfoResult;
  };

  getLibraryHistory = async () => {
    const res = await fetch(this._url + Api.library.history, { redirect: "follow" });
    if (!res.ok) {
      throw new Error();
    }
    const getLibraryHistoryResult = (await res.json()) as GetLibraryHistoryResult;
    return getLibraryHistoryResult;
  };

  switchLibrary = async (data: { libraryPath: string }) => {
    const res = await fetch(this._url + Api.library.switch, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (!res.ok) {
      throw new Error();
    }
    const switchLibraryResult = (await res.json()) as SwitchLibraryResult;
    return switchLibraryResult;
  };
}
