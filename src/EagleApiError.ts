import type { EagleErrorResponse } from "./types";

/**
 * Error thrown when Eagle API request fails.
 */
export class EagleApiError extends Error {
  /**
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param httpStatus - HTTP status code
   * @param errorResponse - Error response from API
   */
  constructor(
    public readonly method: string,
    public readonly endpoint: string,
    public readonly httpStatus: number,
    public readonly errorResponse: EagleErrorResponse,
  ) {
    const errorMsg = "code" in errorResponse ? `${errorResponse.code}: ${errorResponse.message}` : errorResponse.data;

    super(`Eagle API Error [${method} ${endpoint}]: ${errorMsg}`);
    this.name = "EagleApiError";
  }
}
