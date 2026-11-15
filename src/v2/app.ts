import type { EagleHttp } from "../http.ts";
import { ApiV2 } from "./endpoints.ts";
import * as schemas from "./schemas.ts";

/**
 * Application API (v2).
 *
 * @see https://developer.eagle.cool/web-api/api/app
 */
export class AppApiV2 {
  constructor(private readonly http: EagleHttp) {}

  /**
   * Get information about the running Eagle application.
   *
   * @returns Version, build and platform
   * @throws {EagleApiError} When the API request fails
   * @see https://developer.eagle.cool/web-api/api/app#info
   */
  info = async () => {
    return this.http.request("GET", ApiV2.app.info, schemas.getAppInfoSchema);
  };
}
