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
    const res = await fetch(this._url + Api.application.info, {
      redirect: "follow",
    });
    if (res.ok) {
      const getApplicationInfoResult = (await res.json()) as GetApplicationInfoResult;
      return getApplicationInfoResult;
    }
    throw new Error();
  };

  createFolder = async (data: {
    folderName: string;
    parentFolderId?: string;
  }) => {
    const res = await fetch(this._url + Api.folder.create, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const createFolderResult = (await res.json()) as CreateFolderResult;
      return createFolderResult;
    }
    throw new Error();
  };

  renameFolder = async (data: { folderId: string; newName: string }) => {
    const res = await fetch(this._url + Api.folder.rename, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const renameFolderResult = (await res.json()) as RenameFolderResult;
      return renameFolderResult;
    }
    throw new Error();
  };

  updateFolder = async (data: {
    folderId: string;
    newName?: string;
    newDescription?: string;
    newColor?: Color;
  }) => {
    const res = await fetch(this._url + Api.folder.update, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const updateFolderResult = (await res.json()) as UpdateFolderResult;
      return updateFolderResult;
    }
    throw new Error();
  };

  getFolderList = async () => {
    const res = await fetch(this._url + Api.folder.list, {
      redirect: "follow",
    });
    if (res.ok) {
      const getFolderListResult = (await res.json()) as GetFolderListResult;
      return getFolderListResult;
    }
    throw new Error();
  };

  getRecentFolderList = async () => {
    const res = await fetch(this._url + Api.folder.listRecent, {
      redirect: "follow",
    });
    if (res.ok) {
      const getRecentFolderListResult = (await res.json()) as GetRecentFolderListResult;
      return getRecentFolderListResult;
    }
    throw new Error();
  };

  addItemFromUrl = async (data: {
    url: string;
    name?: string;
    website?: string;
    tags?: string[];
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
    if (res.ok) {
      const addItemFromUrlResult = (await res.json()) as AddItemFromUrlResult;
      return addItemFromUrlResult;
    }
    throw new Error();
  };

  addItemFromUrls = async (data: { items: Item[]; folderId?: string }) => {
    const res = await fetch(this._url + Api.item.addFromUrls, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const addItemFromUrlsResult = (await res.json()) as AddItemFromUrlsResult;
      return addItemFromUrlsResult;
    }
    throw new Error();
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
    if (res.ok) {
      const addItemFromPathResult = (await res.json()) as AddItemFromPathResult;
      return addItemFromPathResult;
    }
    throw new Error();
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
    if (res.ok) {
      const addItemsFromPathsResult = (await res.json()) as AddItemFromPathsResult;
      return addItemsFromPathsResult;
    }
    throw new Error();
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
    if (res.ok) {
      const addBookmarkResult = (await res.json()) as AddBookmarkResult;
      return addBookmarkResult;
    }
    throw new Error();
  };

  getItemInfo = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.info}?${params.toString()}`, {
      redirect: "follow",
    });
    if (res.ok) {
      const getItemInfoResult = (await res.json()) as GetItemInfoResult;
      return getItemInfoResult;
    }
    throw new Error();
  };

  getItemThumbnail = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(`${this._url}${Api.item.thumbnail}?${params.toString()}`, {
      redirect: "follow",
    });
    if (res.ok) {
      const getItemThumbnailResult = (await res.json()) as GetItemThumbnailResult;
      return getItemThumbnailResult;
    }
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
      if (typeof value !== "string") {
        return [key, `${value}`];
      }
      return [key, value];
    });
    const params = new URLSearchParams(stringifiedData);
    const res = await fetch(`${this._url}${Api.item.list}?${params.toString()}`, {
      redirect: "follow",
    });

    if (res.ok) {
      const getItemListResult = (await res.json()) as GetItemListResult;
      return getItemListResult;
    }
    throw new Error();
  };

  moveItemToTrash = async (data: { itemIds: string[] }) => {
    const res = await fetch(this._url + Api.item.moveToTrash, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const moveItemToTrashResult = (await res.json()) as MoveItemToTrashResult;
      return moveItemToTrashResult;
    }
    throw new Error();
  };

  refreshItemPalette = async (data: { id: string }) => {
    const res = await fetch(this._url + Api.item.refreshPalette, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const refreshItemPaletteResult = (await res.json()) as RefreshItemPaletteResult;
      return refreshItemPaletteResult;
    }
    throw new Error();
  };

  refreshThumbnail = async (data: { id: string }) => {
    const res = await fetch(this._url + Api.item.refreshThumbnail, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const refreshThumbnailResult = (await res.json()) as RefreshItemPaletteResult;
      return refreshThumbnailResult;
    }
    throw new Error();
  };

  updateItem = async (data: {
    id: string;
    tags?: string[];
    annotation?: string[];
    url?: string;
    star?: number;
  }) => {
    const res = await fetch(this._url + Api.item.update, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const updateItemResult = (await res.json()) as UpdateItemResult;
      return updateItemResult;
    }
    throw new Error();
  };

  getLibraryInfo = async () => {
    const res = await fetch(this._url + Api.library.info, {
      redirect: "follow",
    });
    if (res.ok) {
      const getLibraryInfoResult = (await res.json()) as GetLibraryInfoResult;
      return getLibraryInfoResult;
    }
    throw new Error();
  };

  getLibraryHistory = async () => {
    const res = await fetch(this._url + Api.library.history, {
      redirect: "follow",
    });
    if (res.ok) {
      const getLibraryHistoryResult = (await res.json()) as GetLibraryHistoryResult;
      return getLibraryHistoryResult;
    }
    throw new Error();
  };

  switchLibrary = async (data: { libraryPath: string }) => {
    const res = await fetch(this._url + Api.library.switch, {
      method: "POST",
      body: JSON.stringify(data),
      redirect: "follow",
    });
    if (res.ok) {
      const switchLibraryResult = (await res.json()) as SwitchLibraryResult;
      return switchLibraryResult;
    }
    throw new Error();
  };
}
