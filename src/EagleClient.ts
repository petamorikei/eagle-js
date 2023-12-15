import { OutgoingHttpHeaders } from "http";
import { Api } from "./Api";
import {
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
    if (!this._instance) {
      this._instance = new EagleClient();
    }
    return this._instance;
  }

  getApplicationInfo = async () => {
    const res = await fetch(this._url + Api.application.info);
    if (res.ok) {
      const getApplicationInfoResult =
        (await res.json()) as GetApplicationInfoResult;
      return getApplicationInfoResult;
    } else {
      throw new Error();
    }
  };

  createFolder = async (data: {
    folderName: string;
    parentFolderId?: string;
  }) => {
    const res = await fetch(this._url + Api.folder.create, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const createFolderResult = (await res.json()) as CreateFolderResult;
      return createFolderResult;
    } else {
      throw new Error();
    }
  };

  renameFolder = async (data: { folderId: string; newName: string }) => {
    const res = await fetch(this._url + Api.folder.rename, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const renameFolderResult = (await res.json()) as RenameFolderResult;
      return renameFolderResult;
    } else {
      throw new Error();
    }
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
    });
    if (res.ok) {
      const updateFolderResult = (await res.json()) as UpdateFolderResult;
      return updateFolderResult;
    } else {
      throw new Error();
    }
  };

  getFolderList = async () => {
    const res = await fetch(this._url + Api.folder.list);
    if (res.ok) {
      const getFolderListResult = (await res.json()) as GetFolderListResult;
      return getFolderListResult;
    } else {
      throw new Error();
    }
  };

  getRecentFolderList = async () => {
    const res = await fetch(this._url + Api.folder.listRecent);
    if (res.ok) {
      const getRecentFolderListResult =
        (await res.json()) as GetRecentFolderListResult;
      return getRecentFolderListResult;
    } else {
      throw new Error();
    }
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
    });
    if (res.ok) {
      const addItemFromUrlResult = (await res.json()) as AddItemFromUrlResult;
      return addItemFromUrlResult;
    } else {
      throw new Error();
    }
  };

  addItemFromUrls = async (data: { items: Item[]; folderId?: string }) => {
    const res = await fetch(this._url + Api.item.addFromUrls, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const addItemFromUrlsResult = (await res.json()) as AddItemFromUrlsResult;
      return addItemFromUrlsResult;
    } else {
      throw new Error();
    }
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
    });
    if (res.ok) {
      const addItemFromPathResult = (await res.json()) as AddItemFromPathResult;
      return addItemFromPathResult;
    } else {
      throw new Error();
    }
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
    });
    if (res.ok) {
      const addItemsFromPathsResult =
        (await res.json()) as AddItemFromPathsResult;
      return addItemsFromPathsResult;
    } else {
      throw new Error();
    }
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
    });
    if (res.ok) {
      const addBookmarkResult = (await res.json()) as AddBookmarkResult;
      return addBookmarkResult;
    } else {
      throw new Error();
    }
  };

  getItemInfo = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(
      `${this._url}${Api.item.info}?${params.toString()}`,
    );
    if (res.ok) {
      const getItemInfoResult = (await res.json()) as GetItemInfoResult;
      return getItemInfoResult;
    } else {
      throw new Error();
    }
  };

  getItemThumbnail = async (data: { id: string }) => {
    const params = new URLSearchParams(data);
    const res = await fetch(
      `${this._url}${Api.item.thumbnail}?${params.toString()}`,
    );
    if (res.ok) {
      const getItemThumbnailResult =
        (await res.json()) as GetItemThumbnailResult;
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
      } else {
        return [key, value];
      }
    });
    const params = new URLSearchParams(stringifiedData);
    const res = await fetch(
      `${this._url}${Api.item.list}?${params.toString()}`,
    );

    if (res.ok) {
      const getItemListResult = (await res.json()) as GetItemListResult;
      return getItemListResult;
    } else {
      throw new Error();
    }
  };

  moveItemToTrash = async (data: { itemIds: string[] }) => {
    const res = await fetch(this._url + Api.item.moveToTrash, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const moveItemToTrashResult = (await res.json()) as MoveItemToTrashResult;
      return moveItemToTrashResult;
    } else {
      throw new Error();
    }
  };

  refreshItemPalette = async (data: { id: string }) => {
    const res = await fetch(this._url + Api.item.refreshPalette, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const refreshItemPaletteResult =
        (await res.json()) as RefreshItemPaletteResult;
      return refreshItemPaletteResult;
    } else {
      throw new Error();
    }
  };

  refreshThumbnail = async (data: { id: string }) => {
    const res = await fetch(this._url + Api.item.refreshThumbnail, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const refreshThumbnailResult =
        (await res.json()) as RefreshItemPaletteResult;
      return refreshThumbnailResult;
    } else {
      throw new Error();
    }
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
    });
    if (res.ok) {
      const updateItemResult = (await res.json()) as UpdateItemResult;
      return updateItemResult;
    } else {
      throw new Error();
    }
  };

  getLibraryInfo = async () => {
    const res = await fetch(this._url + Api.library.info);
    if (res.ok) {
      const getLibraryInfoResult = (await res.json()) as GetLibraryInfoResult;
      return getLibraryInfoResult;
    } else {
      throw new Error();
    }
  };

  getLibraryHistory = async () => {
    const res = await fetch(this._url + Api.library.history);
    if (res.ok) {
      const getLibraryHistoryResult =
        (await res.json()) as GetLibraryHistoryResult;
      return getLibraryHistoryResult;
    } else {
      throw new Error();
    }
  };

  switchLibrary = async (data: { libraryPath: string }) => {
    const res = await fetch(this._url + Api.library.switch, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const switchLibraryResult = (await res.json()) as SwitchLibraryResult;
      return switchLibraryResult;
    } else {
      throw new Error();
    }
  };
}
