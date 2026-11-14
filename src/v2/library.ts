import { EagleApiError } from "../EagleApiError.ts";
import { decodeTextError, type EagleHttp, isErrorStatus, parseJson, toErrorResponse } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";
import type { PageParams } from "./types.ts";

/**
 * Library API (v2).
 *
 * @see https://developer.eagle.cool/web-api/api/library
 */
export class LibraryApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * Get information about the open library, including its folders, smart folders and tag groups.
   *
   * @returns Library information
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/library#info
   */
  info = async () => {
    return this.http.request("GET", ApiV2.library.info, schemas.getLibraryInfoSchema);
  };

  /**
   * Get the paths of recently opened libraries.
   *
   * @param params - Pagination (`offset`, `limit`)
   * @returns Page of library paths
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/library#history
   */
  history = async (params: PageParams = {}) => {
    return this.http.request("GET", ApiV2.library.history, schemas.getLibraryHistorySchema, { query: params });
  };

  /**
   * Switch to another library.
   *
   * @param params - Parameters
   * @param params.libraryPath - Path to the `.library` directory
   * @returns Success response
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/library#switch
   */
  switch = async (params: { libraryPath: string }) => {
    return this.http.request("POST", ApiV2.library.switch, schemas.switchLibrarySchema, { body: params });
  };

  /**
   * Get the icon image of a library.
   *
   * @param params - Parameters
   * @param params.libraryPath - Path to the `.library` directory
   * @returns Icon image data
   * @throws {EagleApiError} When the library or its icon does not exist
   * @see https://developer.eagle.cool/web-api/api/library#icon
   */
  icon = async (params: { libraryPath: string }): Promise<ArrayBuffer> => {
    const endpoint = ApiV2.library.icon;
    const res = await this.http.send("GET", endpoint, { query: params });
    const buffer = await res.arrayBuffer();
    if (res.headers.get("content-type")?.startsWith("image/")) {
      return buffer;
    }
    const text = new TextDecoder().decode(buffer);
    const json = parseJson(text);
    if (json === undefined) {
      // Not JSON: raw image bytes, or a plain-text error as the v1 API sends.
      const error = buffer.byteLength === 0 ? "" : decodeTextError(buffer);
      if (error !== undefined) {
        throw new EagleApiError("GET", endpoint, res.status, toErrorResponse(undefined, error, res));
      }
      return buffer;
    }
    if (isErrorStatus(json)) {
      throw new EagleApiError("GET", endpoint, res.status, toErrorResponse(json, text, res));
    }
    // Eagle 4 sends the image as a serialized Node.js Buffer: {"type":"Buffer","data":[...bytes]}.
    const { data } = schemas.getLibraryIconSchema.parse(json);
    return Uint8Array.from(data.data).buffer;
  };
}
