/**
 * Eagle Web API v2 endpoint paths.
 *
 * @see https://developer.eagle.cool/web-api
 */
export const ApiV2 = {
  app: {
    info: "/api/v2/app/info",
  },
  library: {
    info: "/api/v2/library/info",
    history: "/api/v2/library/history",
    switch: "/api/v2/library/switch",
    icon: "/api/v2/library/icon",
  },
  item: {
    get: "/api/v2/item/get",
    query: "/api/v2/item/query",
    countAll: "/api/v2/item/countAll",
    add: "/api/v2/item/add",
    update: "/api/v2/item/update",
    setCustomThumbnail: "/api/v2/item/setCustomThumbnail",
    refreshThumbnail: "/api/v2/item/refreshThumbnail",
    getComments: "/api/v2/item/getComments",
    addComment: "/api/v2/item/addComment",
    updateComment: "/api/v2/item/updateComment",
    removeComment: "/api/v2/item/removeComment",
  },
  folder: {
    get: "/api/v2/folder/get",
    create: "/api/v2/folder/create",
    update: "/api/v2/folder/update",
  },
  smartFolder: {
    get: "/api/v2/smartFolder/get",
    create: "/api/v2/smartFolder/create",
    update: "/api/v2/smartFolder/update",
    remove: "/api/v2/smartFolder/remove",
    getItems: "/api/v2/smartFolder/getItems",
    getRules: "/api/v2/smartFolder/getRules",
  },
  tag: {
    get: "/api/v2/tag/get",
    getRecentTags: "/api/v2/tag/getRecentTags",
    getStarredTags: "/api/v2/tag/getStarredTags",
    update: "/api/v2/tag/update",
    merge: "/api/v2/tag/merge",
  },
  tagGroup: {
    get: "/api/v2/tagGroup/get",
    create: "/api/v2/tagGroup/create",
    update: "/api/v2/tagGroup/update",
    remove: "/api/v2/tagGroup/remove",
    addTags: "/api/v2/tagGroup/addTags",
    removeTags: "/api/v2/tagGroup/removeTags",
  },
  aiSearch: {
    isInstalled: "/api/v2/aiSearch/isInstalled",
    isReady: "/api/v2/aiSearch/isReady",
    isStarting: "/api/v2/aiSearch/isStarting",
    isSyncing: "/api/v2/aiSearch/isSyncing",
    getSyncStatus: "/api/v2/aiSearch/getSyncStatus",
    checkServiceHealth: "/api/v2/aiSearch/checkServiceHealth",
    searchByText: "/api/v2/aiSearch/searchByText",
    searchByBase64: "/api/v2/aiSearch/searchByBase64",
    searchByItemId: "/api/v2/aiSearch/searchByItemId",
  },
} as const;
