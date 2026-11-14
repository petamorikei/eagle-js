import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";
import type { PageParams } from "./types.ts";

/**
 * Tag API (v2).
 *
 * @see https://developer.eagle.cool/web-api/api/tag
 */
export class TagApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * List tags, optionally filtered by name.
   *
   * @param params - Name filter (substring match) and pagination (`offset`, `limit`)
   * @returns Page of tags
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag#list-post
   */
  get = async (params: PageParams & { name?: string } = {}) => {
    return this.http.request("POST", ApiV2.tag.get, schemas.getTagsSchema, { body: params });
  };

  /**
   * Get recently used tags.
   *
   * @param params - Pagination (`offset`, `limit`)
   * @returns Page of tags
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag#recent
   */
  getRecentTags = async (params: PageParams = {}) => {
    return this.http.request("GET", ApiV2.tag.getRecentTags, schemas.getRecentOrStarredTagsSchema, { query: params });
  };

  /**
   * Get starred tags.
   *
   * @param params - Pagination (`offset`, `limit`)
   * @returns Page of tags
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag#starred
   */
  getStarredTags = async (params: PageParams = {}) => {
    return this.http.request("GET", ApiV2.tag.getStarredTags, schemas.getRecentOrStarredTagsSchema, {
      query: params,
    });
  };

  /**
   * Rename a tag on every item that has it.
   *
   * @param params - Parameters
   * @param params.originalName - Current tag name
   * @param params.name - New tag name
   * @returns The renamed tag; `data` is missing when the tag does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag#update
   */
  update = async (params: { originalName: string; name: string }) => {
    return this.http.request("POST", ApiV2.tag.update, schemas.updateTagSchema, { body: params });
  };

  /**
   * Merge a tag into another. Items with `source` get `target` instead, and `source` is removed.
   *
   * @param params - Parameters
   * @param params.source - Tag to merge and remove
   * @param params.target - Tag to keep
   * @returns Number of affected items; `data` is missing when `source` does not exist
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/tag#merge
   */
  merge = async (params: { source: string; target: string }) => {
    return this.http.request("POST", ApiV2.tag.merge, schemas.mergeTagsSchema, { body: params });
  };
}
