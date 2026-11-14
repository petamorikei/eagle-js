import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";
import type { GetFoldersParams, UpdateFolderParams } from "./types.ts";

/**
 * Folder API (v2).
 *
 * @see https://developer.eagle.cool/web-api/api/folder
 */
export class FolderApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * List folders, optionally filtered.
   *
   * @param params - Filters and pagination (`offset`, `limit`)
   * @returns Page of folders
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/folder#list-post
   */
  get = async (params: GetFoldersParams = {}) => {
    return this.http.request("POST", ApiV2.folder.get, schemas.getFoldersSchema, { body: params });
  };

  /**
   * Create a folder.
   *
   * @param params - Parameters
   * @param params.name - Folder name
   * @param params.description - Folder description
   * @param params.parent - Parent folder ID; omit to create it at the root
   * @returns The new folder, or `data: false` when it could not be created
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/folder#create
   */
  create = async (params: { name: string; description?: string; parent?: string }) => {
    return this.http.request("POST", ApiV2.folder.create, schemas.createFolderSchema, { body: params });
  };

  /**
   * Update a folder. Only the given fields are changed.
   *
   * @param params - Folder ID and fields to change
   * @returns The updated folder; `data` is missing when the folder does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/folder#update
   */
  update = async (params: UpdateFolderParams) => {
    return this.http.request("POST", ApiV2.folder.update, schemas.updateFolderSchema, { body: params });
  };
}
