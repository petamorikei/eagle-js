import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";
import type { PageParams, TagGroupParams } from "./types.ts";

/**
 * Tag group API (v2).
 *
 * @see https://developer.eagle.cool/web-api/api/tag-group
 */
export class TagGroupApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * List tag groups.
   *
   * @param params - Pagination (`offset`, `limit`)
   * @returns Page of tag groups
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag-group#list
   */
  get = async (params: PageParams = {}) => {
    return this.http.request("GET", ApiV2.tagGroup.get, schemas.getTagGroupsSchema, { query: params });
  };

  /**
   * Create a tag group. `color` and `description` are left out of the group when not given.
   *
   * @param params - Name, tags, color and description
   * @returns The new tag group, or `data: false` when it could not be created
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag-group#create
   */
  create = async (params: TagGroupParams) => {
    return this.http.request("POST", ApiV2.tagGroup.create, schemas.createTagGroupSchema, { body: params });
  };

  /**
   * Update a tag group. `tags` replaces all tags in the group.
   *
   * @param params - Group ID, name, tags, color and description
   * @returns The updated tag group; `data` is missing when the group does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag-group#update
   */
  update = async (params: TagGroupParams & { id: string }) => {
    return this.http.request("POST", ApiV2.tagGroup.update, schemas.updateTagGroupSchema, { body: params });
  };

  /**
   * Delete a tag group. The tags themselves are kept.
   *
   * @param params - Parameters
   * @param params.id - Tag group ID
   * @returns `data: true` on success, `false` when the group does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag-group#remove
   */
  remove = async (params: { id: string }) => {
    return this.http.request("POST", ApiV2.tagGroup.remove, schemas.removeTagGroupSchema, { body: params });
  };

  /**
   * Add tags to a tag group.
   *
   * @param params - Parameters
   * @param params.groupId - Tag group ID
   * @param params.tags - Tag names to add
   * @param params.removeFromSource - Remove the tags from their current groups first
   * @returns The updated tag group; `data` is missing when the group does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag-group#add-tags
   */
  addTags = async (params: { groupId: string; tags: string[]; removeFromSource?: boolean }) => {
    return this.http.request("POST", ApiV2.tagGroup.addTags, schemas.tagGroupResultSchema, { body: params });
  };

  /**
   * Remove tags from a tag group. The tags themselves are kept.
   *
   * @param params - Parameters
   * @param params.groupId - Tag group ID
   * @param params.tags - Tag names to remove from the group
   * @returns The updated tag group; `data` is missing when the group does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag-group#remove-tags
   */
  removeTags = async (params: { groupId: string; tags: string[] }) => {
    return this.http.request("POST", ApiV2.tagGroup.removeTags, schemas.tagGroupResultSchema, { body: params });
  };
}
