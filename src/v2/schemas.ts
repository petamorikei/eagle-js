import { z } from "zod";
import { colorSchema } from "../schemas.ts";

// Zod schemas for the Eagle Web API v2.
//
// The shapes follow what Eagle 4.0 actually returns, which differs from the documentation in places
// (for example tags have `imageCount` instead of `count`, and `library/info` uses `tagsGroups`).
// Entities are loose objects: fields not listed here, such as Eagle's UI state, are kept as is.

/** Successful response wrapping `data`. */
export const success = <T extends z.ZodType>(data: T) => z.object({ status: z.literal("success"), data });

/** Successful response whose `data` may be missing (Eagle omits it when, for example, the target does not exist). */
export const successOptional = <T extends z.ZodType>(data: T) =>
  z.object({ status: z.literal("success"), data: data.optional() });

/** Paginated list. */
export const page = <T extends z.ZodType>(item: T) =>
  z.looseObject({
    data: z.array(item),
    /** Number of matching entries before pagination. */
    total: z.number(),
    offset: z.number(),
    limit: z.number(),
  });

/** Color name, or `""` when no color is set. */
export const optionalColorSchema = z.union([colorSchema, z.literal("")]).optional();

// App

export const appInfoSchema = z.looseObject({
  version: z.string(),
  prereleaseVersion: z.string().nullable(),
  buildVersion: z.string().nullable(),
  platform: z.string(),
});

// Item

export const paletteSchema = z.looseObject({
  color: z.array(z.number()),
  ratio: z.number(),
});

export const itemSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  ext: z.string(),
  size: z.number(),
  width: z.number(),
  height: z.number(),
  url: z.string(),
  annotation: z.string(),
  tags: z.array(z.string()),
  folders: z.array(z.string()),
  isDeleted: z.boolean(),
  modificationTime: z.number(),
  /** Rating (0-5). Missing when the item has never been rated. */
  star: z.number().optional(),
  palettes: z.array(paletteSchema).optional(),
  noThumbnail: z.boolean().optional(),
  noPreview: z.boolean().optional(),
  lastModified: z.number().optional(),
  btime: z.number().optional(),
  mtime: z.number().optional(),
});

/** Item returned when only some `fields` are requested, and by AI Search. */
export const partialItemSchema = itemSchema.partial();

export const addItemResultSchema = z.looseObject({ id: z.string() });

export const addItemsResultSchema = z.looseObject({ ids: z.array(z.string()) });

export const commentSchema = z.looseObject({
  id: z.string(),
  annotation: z.string().optional(),
  lastModified: z.number(),
  // Image rect comment
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  // Video timestamp comment (seconds)
  duration: z.number().optional(),
});

// Folder

export type Folder = {
  id: string;
  name: string;
  description?: string;
  children: Folder[];
  modificationTime: number;
  tags: string[];
  iconColor?: z.infer<typeof optionalColorSchema>;
  imageCount?: number;
  [key: string]: unknown;
};

export const folderSchema: z.ZodType<Folder> = z.lazy(() =>
  z.looseObject({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    children: z.array(folderSchema),
    modificationTime: z.number(),
    tags: z.array(z.string()),
    iconColor: optionalColorSchema,
    imageCount: z.number().optional(),
  }),
);

// Smart folder

export const smartFolderRuleSchema = z.looseObject({
  property: z.string(),
  method: z.string(),
  /** Depends on the property and method, e.g. `"cat"`, `[1920]` or `["tag"]`. */
  value: z.unknown(),
});

export const smartFolderConditionSchema = z.looseObject({
  rules: z.array(smartFolderRuleSchema),
  /** `"AND"` (all rules) or `"OR"` (any rule). */
  match: z.string(),
  /** `"TRUE"` (include, default) or `"FALSE"` (exclude). */
  boolean: z.string().optional(),
});

export type SmartFolder = {
  id: string;
  name: string;
  conditions: z.infer<typeof smartFolderConditionSchema>[];
  description?: string;
  icon?: string;
  iconColor?: z.infer<typeof optionalColorSchema>;
  children?: SmartFolder[];
  modificationTime: number | string;
  imageCount?: number;
  [key: string]: unknown;
};

export const smartFolderSchema: z.ZodType<SmartFolder> = z.lazy(() =>
  z.looseObject({
    id: z.string(),
    name: z.string(),
    conditions: z.array(smartFolderConditionSchema),
    description: z.string().optional(),
    icon: z.string().optional(),
    iconColor: optionalColorSchema,
    children: z.array(smartFolderSchema).optional(),
    modificationTime: z.union([z.number(), z.string()]),
    imageCount: z.number().optional(),
  }),
);

/** Available filter rules, keyed by property name (e.g. `name`, `width`, `tags`). */
export const smartFolderRulesSchema = z.record(
  z.string(),
  z.looseObject({
    methods: z.array(z.string()),
    /** e.g. `"string"` or `"number_pair"`; `null` for some properties such as `fontActivated`. */
    valueType: z.string().nullable(),
    category: z.string().optional(),
    /** Methods that take no value, such as `"empty"`. */
    noValueMethods: z.array(z.string()).optional(),
    options: z.array(z.unknown()).optional(),
  }),
);

// Tag

export const tagSchema = z.looseObject({
  name: z.string(),
  /** Number of items with this tag. */
  imageCount: z.number(),
  /** IDs of the tag groups containing this tag. */
  groups: z.array(z.string()),
  pinyin: z.string(),
  color: z.string().optional(),
});

// Recent and starred tags have not been observed with entries yet; tag names are accepted as well as tag objects.
export const recentOrStarredTagSchema = z.union([tagSchema, z.string()]);

export const mergeTagsResultSchema = z.looseObject({
  affectedItems: z.number(),
  sourceRemoved: z.boolean(),
});

// Tag group

export const tagGroupSchema = z.looseObject({
  id: z.string(),
  name: z.string(),
  tags: z.array(z.string()),
  /** Missing when no color is set. */
  color: optionalColorSchema,
  /** Missing when no description is set. */
  description: z.string().optional(),
});

// Library

export const libraryInfoSchema = z.looseObject({
  name: z.string(),
  path: z.string(),
  modificationTime: z.number(),
  applicationVersion: z.string(),
  folders: z.array(folderSchema),
  smartFolders: z.array(smartFolderSchema),
  quickAccess: z.array(z.looseObject({ type: z.string(), id: z.string() })),
  tagsGroups: z.array(tagGroupSchema),
});

/** Library icon as Eagle 4 sends it: a serialized Node.js Buffer. */
export const serializedBufferSchema = z.looseObject({
  type: z.literal("Buffer"),
  data: z.array(z.number()),
});

// AI Search (shapes from the documentation; not verified against a running AI Search plugin)

export const aiSearchSyncStatusSchema = z.looseObject({
  isSyncing: z.boolean().optional(),
  syncedCount: z.number().optional(),
  totalCount: z.number().optional(),
  progress: z.number().optional(),
});

export const aiSearchHealthSchema = z.looseObject({
  healthy: z.boolean(),
});

export const aiSearchResultSchema = z.looseObject({
  results: z.array(
    z.looseObject({
      item: partialItemSchema,
      /** Similarity score; higher is more similar. */
      score: z.number(),
    }),
  ),
});

// Responses

export const getAppInfoSchema = success(appInfoSchema);

export const getLibraryInfoSchema = success(libraryInfoSchema);
export const getLibraryHistorySchema = success(page(z.string()));
// Not verified against Eagle (switching libraries would disrupt the test library); the docs show `data: true`.
export const switchLibrarySchema = successOptional(z.unknown());
export const getLibraryIconSchema = success(serializedBufferSchema);

export const getItemsSchema = success(page(itemSchema));
export const countAllItemsSchema = success(z.number());
export const addItemSchema = success(addItemResultSchema);
export const addItemsSchema = success(addItemsResultSchema);
/** `data` is `false` when the item does not exist. */
export const updateItemSchema = success(z.union([itemSchema, z.literal(false)]));
/** `data` is `false` when the item does not exist. */
export const setCustomThumbnailSchema = success(z.boolean());
/** `data` is `false` when the item does not exist. */
export const refreshThumbnailSchema = success(z.boolean());
export const getCommentsSchema = success(z.array(commentSchema));
export const commentResultSchema = success(commentSchema);
export const removeCommentSchema = success(z.boolean());

export const getFoldersSchema = success(page(folderSchema));
/** `data` is `false` when the folder could not be created (e.g. no name). */
export const createFolderSchema = success(z.union([folderSchema, z.literal(false)]));
/** `data` is missing when the folder does not exist. */
export const updateFolderSchema = successOptional(folderSchema);

export const getSmartFoldersSchema = success(page(smartFolderSchema));
export const smartFolderResultSchema = success(smartFolderSchema);
export const removeSmartFolderSchema = success(z.boolean());
export const getSmartFolderRulesSchema = success(smartFolderRulesSchema);

export const getTagsSchema = success(page(tagSchema));
export const getRecentOrStarredTagsSchema = success(page(recentOrStarredTagSchema));
/** `data` is missing when the tag does not exist. */
export const updateTagSchema = successOptional(tagSchema);
/** `data` is missing when the source tag does not exist. */
export const mergeTagsSchema = successOptional(mergeTagsResultSchema);

export const getTagGroupsSchema = success(page(tagGroupSchema));
/** `data` is `false` when the group could not be created (e.g. no name). */
export const createTagGroupSchema = success(z.union([tagGroupSchema, z.literal(false)]));
/** `data` is missing when the group does not exist. */
export const updateTagGroupSchema = successOptional(tagGroupSchema);
/** `data` is `false` when the group does not exist. */
export const removeTagGroupSchema = success(z.boolean());
/** `data` is missing when the group does not exist. */
export const tagGroupResultSchema = successOptional(tagGroupSchema);

export const aiSearchFlagSchema = success(z.boolean());
export const aiSearchSyncStatusResultSchema = success(aiSearchSyncStatusSchema);
export const aiSearchHealthResultSchema = success(aiSearchHealthSchema);
export const aiSearchResultsSchema = success(aiSearchResultSchema);
