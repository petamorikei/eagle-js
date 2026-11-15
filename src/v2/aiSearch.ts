import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";
import type { AiSearchOptions } from "./types.ts";

/**
 * AI Search API (v2). Requires the Eagle AI Search plugin; check {@link AiSearchApiV2.isReady} before searching.
 *
 * The response shapes follow the documentation and have not been verified against a running plugin.
 *
 * @see https://developer.eagle.cool/web-api/api/ai-search
 */
export class AiSearchApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * Check whether the AI Search plugin is installed.
   *
   * @see https://developer.eagle.cool/web-api/api/ai-search#is-installed
   */
  isInstalled = async () => {
    return this.http.request("GET", ApiV2.aiSearch.isInstalled, schemas.aiSearchFlagSchema);
  };

  /**
   * Check whether AI Search is ready to accept searches.
   *
   * @see https://developer.eagle.cool/web-api/api/ai-search#is-ready
   */
  isReady = async () => {
    return this.http.request("GET", ApiV2.aiSearch.isReady, schemas.aiSearchFlagSchema);
  };

  /**
   * Check whether AI Search is starting up.
   *
   * @see https://developer.eagle.cool/web-api/api/ai-search#is-starting
   */
  isStarting = async () => {
    return this.http.request("GET", ApiV2.aiSearch.isStarting, schemas.aiSearchFlagSchema);
  };

  /**
   * Check whether AI Search is indexing the library.
   *
   * @see https://developer.eagle.cool/web-api/api/ai-search#is-syncing
   */
  isSyncing = async () => {
    return this.http.request("GET", ApiV2.aiSearch.isSyncing, schemas.aiSearchFlagSchema);
  };

  /**
   * Get the indexing progress.
   *
   * @see https://developer.eagle.cool/web-api/api/ai-search#sync-status
   */
  getSyncStatus = async () => {
    return this.http.request("GET", ApiV2.aiSearch.getSyncStatus, schemas.aiSearchSyncStatusResultSchema);
  };

  /**
   * Check the health of the AI Search service.
   *
   * @see https://developer.eagle.cool/web-api/api/ai-search#health
   */
  checkServiceHealth = async () => {
    return this.http.request("GET", ApiV2.aiSearch.checkServiceHealth, schemas.aiSearchHealthResultSchema);
  };

  /**
   * Search items by a text description.
   *
   * @param params - Parameters
   * @param params.query - Text describing what to find
   * @param params.options - Search options such as `limit`
   * @returns Matching items with similarity scores
   * @throws {EagleApiError} When AI Search is not available or the request fails
   * @see https://developer.eagle.cool/web-api/api/ai-search#search-by-text
   */
  searchByText = async (params: { query: string; options?: AiSearchOptions }) => {
    return this.http.request("POST", ApiV2.aiSearch.searchByText, schemas.aiSearchResultsSchema, { body: params });
  };

  /**
   * Find items visually similar to a Base64-encoded image.
   *
   * @param params - Parameters
   * @param params.base64 - Base64-encoded image data
   * @param params.options - Search options such as `limit`
   * @returns Similar items with similarity scores
   * @throws {EagleApiError} When AI Search is not available or the request fails
   * @see https://developer.eagle.cool/web-api/api/ai-search#search-by-image
   */
  searchByBase64 = async (params: { base64: string; options?: AiSearchOptions }) => {
    return this.http.request("POST", ApiV2.aiSearch.searchByBase64, schemas.aiSearchResultsSchema, { body: params });
  };

  /**
   * Find items visually similar to an item in the library.
   *
   * @param params - Parameters
   * @param params.itemId - Item ID
   * @param params.options - Search options such as `limit`
   * @returns Similar items with similarity scores
   * @throws {EagleApiError} When AI Search is not available or the request fails
   * @see https://developer.eagle.cool/web-api/api/ai-search#search-by-item
   */
  searchByItemId = async (params: { itemId: string; options?: AiSearchOptions }) => {
    return this.http.request("POST", ApiV2.aiSearch.searchByItemId, schemas.aiSearchResultsSchema, { body: params });
  };
}
