import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";
import type {
  AddCommentParams,
  AddItemParams,
  AddItemResult,
  AddItemsParams,
  AddItemsResult,
  GetItemsResult,
  GetItemsWithFieldsResult,
  ItemField,
  ItemFilterParams,
  PageParams,
  UpdateCommentParams,
  UpdateItemParams,
} from "./types.ts";

/** Response schema for items that only have the requested `fields`. */
export const itemsWithFieldsSchema = (fields: readonly ItemField[]) => {
  const mask = Object.fromEntries(fields.map((field) => [field, true])) as { [K in ItemField]?: true };
  return schemas.success(schemas.page(schemas.itemSchema.pick(mask)));
};

type GetItems = {
  /**
   * List items, optionally filtered. Trashed items are not included.
   *
   * With `fields`, each item has only the requested fields, which is faster on large libraries.
   * An unknown `id` returns an empty page rather than an error.
   *
   * @param params - Filters, `fields` and pagination (`offset`, `limit`)
   * @returns Page of items
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#list-post
   */
  <K extends ItemField>(params: ItemFilterParams & { fields: readonly K[] }): Promise<GetItemsWithFieldsResult<K>>;
  (params?: ItemFilterParams): Promise<GetItemsResult>;
};

type AddItem = {
  /**
   * Add items in one request (up to 1000).
   *
   * Eagle returns the IDs before the items are indexed, so other calls may not see them for a short time.
   * Poll {@link ItemApiV2.get} with `ids` if you need them right away.
   *
   * @param params - Items, each from `url`, `base64`, `path` or `bookmarkURL`
   * @returns IDs of the new items
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#add
   */
  (params: AddItemsParams): Promise<AddItemsResult>;
  /**
   * Add an item from `url`, `base64`, `path` or `bookmarkURL`.
   *
   * Eagle returns the ID before the item is indexed, so other calls may not see the item for a short time
   * (about 0.1 seconds for a local file). Poll {@link ItemApiV2.get} with `ids` if you need it right away.
   *
   * @param params - Item source and metadata
   * @returns ID of the new item
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#add
   */
  (params: AddItemParams): Promise<AddItemResult>;
};

/**
 * Item API (v2), including comments.
 *
 * @see https://developer.eagle.cool/web-api/api/item
 */
export class ItemApiV2 {
  constructor(private readonly http: EagleHttp) {}

  // Sent as POST: GET with `fields` fails on Eagle 4.0 ("fields.forEach is not a function").
  get: GetItems = ((params: ItemFilterParams & { fields?: readonly ItemField[] } = {}) => {
    const schema = params.fields ? itemsWithFieldsSchema(params.fields) : schemas.getItemsSchema;
    return this.http.request("POST", ApiV2.item.get, schema, { body: params });
  }) as GetItems;

  /**
   * Full-text search across names, tags, annotations, URLs, folder names and more.
   *
   * Supports `a b` (AND), `a OR b`, `-word` (NOT), `"exact phrase"` and grouping with parentheses.
   *
   * @param params - Query and pagination (`offset`, `limit`)
   * @returns Page of matching items
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#query
   */
  query = async (params: PageParams & { query: string }) => {
    return this.http.request("POST", ApiV2.item.query, schemas.getItemsSchema, { body: params });
  };

  /**
   * Count all items in the library, including items in the trash.
   *
   * @returns Number of items
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#count
   */
  countAll = async () => {
    return this.http.request("GET", ApiV2.item.countAll, schemas.countAllItemsSchema);
  };

  add: AddItem = ((params: AddItemParams | AddItemsParams) => {
    const schema = "items" in params ? schemas.addItemsSchema : schemas.addItemSchema;
    return this.http.request("POST", ApiV2.item.add, schema, { body: params });
  }) as AddItem;

  /**
   * Update an item. Only the given fields are changed; `isDeleted: true` moves it to the trash.
   *
   * @param params - Item ID and fields to change
   * @returns The updated item, or `data: false` when the item does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#update
   */
  update = async (params: UpdateItemParams) => {
    return this.http.request("POST", ApiV2.item.update, schemas.updateItemSchema, { body: params });
  };

  /**
   * Set a custom thumbnail from a local image file. Eagle waits up to 10 seconds for it to be generated.
   *
   * @param params - Parameters
   * @param params.itemId - Item ID
   * @param params.filePath - Path to the thumbnail image
   * @returns Whether the thumbnail was set
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#set-thumbnail
   */
  setCustomThumbnail = async (params: { itemId: string; filePath: string }) => {
    return this.http.request("POST", ApiV2.item.setCustomThumbnail, schemas.setCustomThumbnailSchema, {
      body: params,
    });
  };

  /**
   * Regenerate the thumbnail, updating the file size, dimensions and color palette.
   *
   * @param params - Parameters
   * @param params.itemId - Item ID
   * @returns `data: true` on success, `false` when the item does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/item#refresh-thumbnail
   */
  refreshThumbnail = async (params: { itemId: string }) => {
    return this.http.request("POST", ApiV2.item.refreshThumbnail, schemas.refreshThumbnailSchema, { body: params });
  };

  /**
   * Get the comments of an item (image regions or video timestamps).
   *
   * @param params - Parameters
   * @param params.id - Item ID
   * @returns All comments of the item
   * @throws {EagleApiError} When the item does not exist or the request fails
   * @see https://developer.eagle.cool/web-api/api/item#get-comments
   */
  getComments = async (params: { id: string }) => {
    return this.http.request("GET", ApiV2.item.getComments, schemas.getCommentsSchema, { query: params });
  };

  /**
   * Add a comment: an image region (`x`, `y`, `width`, `height`) or a video timestamp (`duration`).
   *
   * @param params - Item ID, comment text and position
   * @returns The new comment
   * @throws {EagleApiError} When the position is invalid or the request fails
   * @see https://developer.eagle.cool/web-api/api/item#add-comment
   */
  addComment = async (params: AddCommentParams) => {
    return this.http.request("POST", ApiV2.item.addComment, schemas.commentResultSchema, { body: params });
  };

  /**
   * Update a comment. Image comments accept only `x`/`y`/`width`/`height`, video comments only `duration`.
   *
   * @param params - Item ID, comment ID and fields to change
   * @returns The updated comment
   * @throws {EagleApiError} When the comment does not exist, the fields do not fit its type, or the request fails
   * @see https://developer.eagle.cool/web-api/api/item#update-comment
   */
  updateComment = async (params: UpdateCommentParams) => {
    return this.http.request("POST", ApiV2.item.updateComment, schemas.commentResultSchema, { body: params });
  };

  /**
   * Remove a comment.
   *
   * @param params - Parameters
   * @param params.id - Item ID
   * @param params.commentId - Comment ID
   * @returns `data: true` on success
   * @throws {EagleApiError} When the comment does not exist or the request fails
   * @see https://developer.eagle.cool/web-api/api/item#remove-comment
   */
  removeComment = async (params: { id: string; commentId: string }) => {
    return this.http.request("POST", ApiV2.item.removeComment, schemas.removeCommentSchema, { body: params });
  };
}
