import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import { itemsWithFieldsSchema } from "./item.ts";
import * as schemas from "./schemas.ts";
import type {
  CreateSmartFolderParams,
  GetItemsResult,
  GetItemsWithFieldsResult,
  GetSmartFolderItemsParams,
  ItemField,
  PageParams,
  UpdateSmartFolderParams,
} from "./types.ts";

type GetSmartFolderItems = {
  /**
   * Get the items matching a smart folder's conditions.
   *
   * With `fields`, each item has only the requested fields.
   *
   * @param params - Smart folder ID, sort order, `fields` and pagination (`offset`, `limit`)
   * @returns Page of matching items
   * @throws {EagleApiError} When the smart folder does not exist or the request fails
   * @see https://developer.eagle.cool/web-api/api/smart-folder#get-items-post
   */
  <K extends ItemField>(
    params: GetSmartFolderItemsParams & { fields: readonly K[] },
  ): Promise<GetItemsWithFieldsResult<K>>;
  (params: GetSmartFolderItemsParams): Promise<GetItemsResult>;
};

/**
 * Smart folder API (v2).
 *
 * @see https://developer.eagle.cool/web-api/api/smart-folder
 */
export class SmartFolderApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * List smart folders, optionally by ID.
   *
   * @param params - IDs and pagination (`offset`, `limit`)
   * @returns Page of smart folders
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/smart-folder#list-post
   */
  get = async (params: PageParams & { id?: string; ids?: string[] } = {}) => {
    return this.http.request("POST", ApiV2.smartFolder.get, schemas.getSmartFoldersSchema, { body: params });
  };

  /**
   * Create a smart folder. Use {@link SmartFolderApiV2.getRules} to see the valid properties and methods.
   *
   * @param params - Name, conditions and display settings
   * @returns The new smart folder
   * @throws {EagleApiError} When the parameters are invalid or the request fails
   * @see https://developer.eagle.cool/web-api/api/smart-folder#create
   */
  create = async (params: CreateSmartFolderParams) => {
    return this.http.request("POST", ApiV2.smartFolder.create, schemas.smartFolderResultSchema, { body: params });
  };

  /**
   * Update a smart folder. Only the given fields are changed.
   *
   * @param params - Smart folder ID and fields to change
   * @returns The updated smart folder
   * @throws {EagleApiError} When the smart folder does not exist or the request fails
   * @see https://developer.eagle.cool/web-api/api/smart-folder#update
   */
  update = async (params: UpdateSmartFolderParams) => {
    return this.http.request("POST", ApiV2.smartFolder.update, schemas.smartFolderResultSchema, { body: params });
  };

  /**
   * Delete a smart folder and its child smart folders.
   *
   * @param params - Parameters
   * @param params.id - Smart folder ID
   * @returns `data: true` on success
   * @throws {EagleApiError} When the smart folder does not exist or the request fails
   * @see https://developer.eagle.cool/web-api/api/smart-folder#remove
   */
  remove = async (params: { id: string }) => {
    return this.http.request("POST", ApiV2.smartFolder.remove, schemas.removeSmartFolderSchema, { body: params });
  };

  getItems: GetSmartFolderItems = ((params: GetSmartFolderItemsParams & { fields?: readonly ItemField[] }) => {
    const schema = params.fields ? itemsWithFieldsSchema(params.fields) : schemas.getItemsSchema;
    return this.http.request("POST", ApiV2.smartFolder.getItems, schema, { body: params });
  }) as GetSmartFolderItems;

  /**
   * Get the filter rules available for smart folder conditions.
   *
   * @returns Methods, value type and options for each property
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/smart-folder#get-rules
   */
  getRules = async () => {
    return this.http.request("GET", ApiV2.smartFolder.getRules, schemas.getSmartFolderRulesSchema);
  };
}
