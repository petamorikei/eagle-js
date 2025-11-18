import type { OutgoingHttpHeaders } from "node:http";
import type { z } from "zod";
import type * as schemas from "./schemas";

// Color
export const Color = {
  red: "red",
  orange: "orange",
  green: "green",
  yellow: "yellow",
  aqua: "aqua",
  blue: "blue",
  purple: "purple",
  pink: "pink",
} as const;

export type Color = (typeof Color)[keyof typeof Color];

// Order
export type Order = z.infer<typeof schemas.orderSchema>;

// Child (recursive type from schema)
export type Child = z.infer<typeof schemas.childFolderSchema>;

// Item input type
export type Item = {
  url: string;
  name?: string;
  website?: string;
  annotation?: string;
  tags?: string[];
  modificationTime?: number;
  headers?: OutgoingHttpHeaders;
};

// API Response types (inferred from schemas)
export type GetApplicationInfoResult = z.infer<typeof schemas.getApplicationInfoSchema>;
export type CreateFolderResult = z.infer<typeof schemas.createFolderSchema>;
export type RenameFolderResult = z.infer<typeof schemas.renameFolderSchema>;
export type UpdateFolderResult = z.infer<typeof schemas.updateFolderSchema>;
export type GetFolderListResult = z.infer<typeof schemas.getFolderListSchema>;
export type GetRecentFolderListResult = z.infer<typeof schemas.getRecentFolderListSchema>;

export type AddItemFromUrlResult = z.infer<typeof schemas.addItemFromUrlSchema>;
export type AddItemFromUrlsResult = z.infer<typeof schemas.addItemFromUrlsSchema>;
export type AddItemFromPathResult = z.infer<typeof schemas.addItemFromPathSchema>;
export type AddItemFromPathsResult = z.infer<typeof schemas.addItemFromPathsSchema>;
export type AddBookmarkResult = z.infer<typeof schemas.addBookmarkSchema>;
export type GetItemInfoResult = z.infer<typeof schemas.getItemInfoSchema>;
export type GetItemThumbnailResult = z.infer<typeof schemas.getItemThumbnailSchema>;
export type GetItemListResult = z.infer<typeof schemas.getItemListSchema>;
export type MoveItemToTrashResult = z.infer<typeof schemas.moveItemToTrashSchema>;
export type RefreshItemPaletteResult = z.infer<typeof schemas.refreshItemPaletteSchema>;
export type RefreshThumbnailResult = z.infer<typeof schemas.refreshThumbnailSchema>;
export type UpdateItemResult = z.infer<typeof schemas.updateItemSchema>;

export type GetLibraryInfoResult = z.infer<typeof schemas.getLibraryInfoSchema>;
export type GetLibraryHistoryResult = z.infer<typeof schemas.getLibraryHistorySchema>;
export type SwitchLibraryResult = z.infer<typeof schemas.switchLibrarySchema>;

export type EagleErrorResponse = z.infer<typeof schemas.eagleErrorResponseSchema>;
