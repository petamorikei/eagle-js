export const Api = {
  application: {
    info: "/api/application/info",
  },
  folder: {
    create: "/api/folder/create",
    rename: "/api/folder/rename",
    update: "/api/folder/update",
    list: "/api/folder/list",
    listRecent: "/api/folder/listRecent",
  },
  item: {
    addFromUrl: "/api/item/addFromURL",
    addFromUrls: "/api/item/addFromURLs",
    addFromPath: "/api/item/addFromPath",
    addFromPaths: "/api/item/addFromPaths",
    addBookmark: "/api/item/addBookmark",
    info: "/api/item/info",
    thumbnail: "/api/item/thumbnail",
    list: "/api/item/list",
    moveToTrash: "/api/item/moveToTrash",
    refreshPalette: "/api/item/refreshPalette",
    refreshThumbnail: "/api/item/refreshThumbnail",
    update: "/api/item/update",
  },
  library: {
    info: "/api/library/info",
    history: "/api/library/history",
    switch: "/api/library/switch",
  },
};
