import type { z } from "zod";
import type { Color } from "../types.ts";
import type * as schemas from "./schemas.ts";

// Types for the Eagle Web API v2, exported from the package as the `V2` namespace (e.g. `V2.Item`).

export type { Folder, SmartFolder } from "./schemas.ts";

/** Successful response wrapping `data`. */
export type Success<T> = { status: "success"; data: T };

/** Paginated list. Pass `offset` and `limit` to get the next pages; `total` counts all matches. */
export type Page<T> = { data: T[]; total: number; offset: number; limit: number; [key: string]: unknown };

/**
 * Pagination parameters. `limit` defaults to 50 and is capped at 1000 by Eagle.
 * Unlike the v1 API, `limit: 0` is treated as the default (50), not as "no items".
 */
export type PageParams = { offset?: number; limit?: number };

// Entities

export type AppInfo = z.infer<typeof schemas.appInfoSchema>;
export type Item = z.infer<typeof schemas.itemSchema>;
export type PartialItem = z.infer<typeof schemas.partialItemSchema>;
export type Palette = z.infer<typeof schemas.paletteSchema>;
export type Comment = z.infer<typeof schemas.commentSchema>;
export type SmartFolderRule = z.infer<typeof schemas.smartFolderRuleSchema>;
export type SmartFolderCondition = z.infer<typeof schemas.smartFolderConditionSchema>;
export type SmartFolderRules = z.infer<typeof schemas.smartFolderRulesSchema>;
export type Tag = z.infer<typeof schemas.tagSchema>;
export type RecentOrStarredTag = z.infer<typeof schemas.recentOrStarredTagSchema>;
export type MergeTagsData = z.infer<typeof schemas.mergeTagsResultSchema>;
export type TagGroup = z.infer<typeof schemas.tagGroupSchema>;
export type LibraryInfo = z.infer<typeof schemas.libraryInfoSchema>;
export type AiSearchSyncStatus = z.infer<typeof schemas.aiSearchSyncStatusSchema>;
export type AiSearchHealth = z.infer<typeof schemas.aiSearchHealthSchema>;
export type AiSearchResult = z.infer<typeof schemas.aiSearchResultSchema>;

/** Item fields that can be requested with `fields`. */
export type ItemField = keyof typeof schemas.itemSchema.shape;

/** Item with only the requested fields. Optional fields such as `star` stay optional because Eagle omits them when unset. */
export type ItemWithFields<K extends ItemField> = Pick<Item, K>;

// Inputs

export type ItemFilterParams = PageParams & {
  /** Return a single item by ID. An unknown ID returns an empty page, not an error. */
  id?: string;
  ids?: string[];
  /** Items currently selected in Eagle. */
  isSelected?: boolean;
  isUntagged?: boolean;
  isUnfiled?: boolean;
  keywords?: string[];
  tags?: string[];
  /** Folder IDs. */
  folders?: string[];
  /** Smart folder IDs (matches any). */
  smartFolders?: string[];
  /** File extension, e.g. `"png"`. */
  ext?: string;
  annotation?: string;
  /** Rating (0-5). */
  rating?: number;
  /** Source URL. */
  url?: string;
  shape?: "square" | "portrait" | "panoramic-portrait" | "landscape" | "panoramic-landscape";
};

type ItemSource =
  | { url: string; base64?: never; path?: never; bookmarkURL?: never }
  | { base64: string; url?: never; path?: never; bookmarkURL?: never }
  | { path: string; url?: never; base64?: never; bookmarkURL?: never }
  | { bookmarkURL: string; url?: never; base64?: never; path?: never };

/** One item to add, from exactly one of `url`, `base64`, `path` or `bookmarkURL`. */
export type AddItemParams = ItemSource & {
  /** Custom item ID. */
  id?: string;
  name?: string;
  tags?: string[];
  /** Folder IDs to add the item to. */
  folders?: string[];
  annotation?: string;
  /** Source website URL. */
  website?: string;
};

/** Up to 1000 items added at once. */
export type AddItemsParams = { items: AddItemParams[] };

export type UpdateItemParams = {
  id: string;
  name?: string;
  /** Replaces the tags. */
  tags?: string[];
  /** Replaces the folder assignments. */
  folders?: string[];
  annotation?: string;
  url?: string;
  /** Rating (0-5). */
  star?: number;
  modificationTime?: number;
  noThumbnail?: boolean;
  noPreview?: boolean;
  /** `true` moves the item to the trash; `false` restores it. */
  isDeleted?: boolean;
};

/** A comment marking a region of an image, or a point in a video. */
export type AddCommentParams = { id: string; annotation?: string } & (
  | { x: number; y: number; width: number; height: number; duration?: never }
  | { duration: number; x?: never; y?: never; width?: never; height?: never }
);

/** Image comments accept only `x`/`y`/`width`/`height`; video comments accept only `duration`. */
export type UpdateCommentParams = {
  id: string;
  commentId: string;
  annotation?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  duration?: number;
};

export type GetFoldersParams = PageParams & {
  id?: string;
  ids?: string[];
  /** The folder currently selected in Eagle. */
  isSelected?: boolean;
  /** Recently used folders. */
  isRecent?: boolean;
};

export type UpdateFolderParams = {
  id: string;
  name?: string;
  description?: string;
  /** Replaces the folder tags. */
  tags?: string[];
  iconColor?: Color;
  /** Parent folder ID; `null` moves the folder to the root. */
  parent?: string | null;
};

/** Filter conditions of a smart folder. Use `smartFolder.getRules()` to see the valid properties and methods. */
export type SmartFolderConditionInput = {
  rules: { property: string; method: string; value?: unknown }[];
  match: "AND" | "OR";
  boolean?: "TRUE" | "FALSE";
};

export type CreateSmartFolderParams = {
  name: string;
  conditions: SmartFolderConditionInput[];
  description?: string;
  icon?: string;
  iconColor?: Color;
  /** Parent smart folder ID. */
  parent?: string;
};

export type UpdateSmartFolderParams = {
  id: string;
  name?: string;
  conditions?: SmartFolderConditionInput[];
  description?: string;
  icon?: string;
  iconColor?: Color;
};

export type GetSmartFolderItemsParams = PageParams & {
  smartFolderId: string;
  /** Sort field. */
  orderBy?: string;
};

export type TagGroupParams = {
  name: string;
  /** Tag names in the group. */
  tags: string[];
  color?: Color;
  description?: string;
};

export type AiSearchOptions = {
  /** Maximum number of results. */
  limit?: number;
};

// Results

export type GetAppInfoResult = z.infer<typeof schemas.getAppInfoSchema>;
export type GetLibraryInfoResult = z.infer<typeof schemas.getLibraryInfoSchema>;
export type GetLibraryHistoryResult = z.infer<typeof schemas.getLibraryHistorySchema>;
export type SwitchLibraryResult = z.infer<typeof schemas.switchLibrarySchema>;
export type GetItemsResult = z.infer<typeof schemas.getItemsSchema>;
export type GetItemsWithFieldsResult<K extends ItemField> = Success<Page<ItemWithFields<K>>>;
export type CountAllItemsResult = z.infer<typeof schemas.countAllItemsSchema>;
export type AddItemResult = z.infer<typeof schemas.addItemSchema>;
export type AddItemsResult = z.infer<typeof schemas.addItemsSchema>;
export type UpdateItemResult = z.infer<typeof schemas.updateItemSchema>;
export type GetCommentsResult = z.infer<typeof schemas.getCommentsSchema>;
export type CommentResult = z.infer<typeof schemas.commentResultSchema>;
export type GetFoldersResult = z.infer<typeof schemas.getFoldersSchema>;
export type CreateFolderResult = z.infer<typeof schemas.createFolderSchema>;
export type UpdateFolderResult = z.infer<typeof schemas.updateFolderSchema>;
export type GetSmartFoldersResult = z.infer<typeof schemas.getSmartFoldersSchema>;
export type SmartFolderResult = z.infer<typeof schemas.smartFolderResultSchema>;
export type GetSmartFolderRulesResult = z.infer<typeof schemas.getSmartFolderRulesSchema>;
export type GetTagsResult = z.infer<typeof schemas.getTagsSchema>;
export type GetRecentOrStarredTagsResult = z.infer<typeof schemas.getRecentOrStarredTagsSchema>;
export type UpdateTagResult = z.infer<typeof schemas.updateTagSchema>;
export type MergeTagsResult = z.infer<typeof schemas.mergeTagsSchema>;
export type GetTagGroupsResult = z.infer<typeof schemas.getTagGroupsSchema>;
export type CreateTagGroupResult = z.infer<typeof schemas.createTagGroupSchema>;
export type UpdateTagGroupResult = z.infer<typeof schemas.updateTagGroupSchema>;
export type TagGroupResult = z.infer<typeof schemas.tagGroupResultSchema>;
export type AiSearchResultsResult = z.infer<typeof schemas.aiSearchResultsSchema>;
