import type { z } from "zod";
import { EagleApiError } from "./EagleApiError.ts";
import { eagleErrorResponseSchema } from "./schemas.ts";
import type { EagleErrorResponse } from "./types.ts";

export type HttpMethod = "GET" | "POST";

export type QueryValue = string | number | boolean | readonly string[] | undefined;

export type RequestOptions = {
  /** Query parameters. `undefined` values are omitted and arrays are joined with `,`. */
  query?: Record<string, QueryValue>;
  /** Request body, serialized as JSON. */
  body?: unknown;
};

/**
 * Connection settings for {@link EagleClient}.
 */
export type EagleClientOptions = {
  /** Host name or IP address of the machine running Eagle. Defaults to `"localhost"`. */
  host?: string;
  /** Port of the Eagle API server. Defaults to `41595`. */
  port?: number;
  /**
   * API token, shown in Eagle under Preferences > Developer.
   * Required when connecting from another machine; requests from localhost do not need it.
   * When set, it is sent as the `token` query parameter on every request.
   */
  token?: string;
};

const toSearchParams = (query: Record<string, QueryValue>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }
    params.append(key, Array.isArray(value) ? value.join(",") : String(value));
  }
  return params;
};

export const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

// Error messages such as "Library icon does not exist." are short; images are larger and not valid UTF-8 text.
const MAX_TEXT_ERROR_BYTES = 1024;

/**
 * Return the body as text if it looks like a plain-text error message rather than image data.
 */
export const decodeTextError = (buffer: ArrayBuffer) => {
  if (buffer.byteLength > MAX_TEXT_ERROR_BYTES) {
    return undefined;
  }
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    // SVG and other XML images are text too; keep them as image data.
    return text.trimStart().startsWith("<") ? undefined : text;
  } catch {
    return undefined;
  }
};

export const isErrorStatus = (json: unknown) =>
  typeof json === "object" && json !== null && "status" in json && json.status === "error";

export const toErrorResponse = (json: unknown, text: string, res: Response): EagleErrorResponse => {
  const parsed = eagleErrorResponseSchema.safeParse(json);
  if (parsed.success) {
    return parsed.data;
  }
  return { status: "error", data: text || `${res.status} ${res.statusText}`.trim() };
};

/**
 * HTTP transport shared by the v1 methods of {@link EagleClient} and its `v2` namespace.
 *
 * @internal
 */
export class EagleHttp {
  private readonly baseUrl: string;
  private readonly token: string | undefined;

  constructor({ host = "localhost", port = 41595, token }: EagleClientOptions = {}) {
    this.baseUrl = `http://${host}:${port}`;
    this.token = token;
  }

  /**
   * Send a request to the Eagle API. A non-OK HTTP response is thrown as {@link EagleApiError}.
   * The token is added to the URL but never to the `endpoint` reported in errors.
   */
  async send(method: HttpMethod, endpoint: string, { query, body }: RequestOptions = {}) {
    const params = toSearchParams({ ...query, token: this.token });
    const search = params.toString();
    const url = `${this.baseUrl}${endpoint}${search ? `?${search}` : ""}`;
    const res = await fetch(url, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "follow",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new EagleApiError(method, endpoint, res.status, toErrorResponse(parseJson(text), text, res));
    }
    return res;
  }

  /**
   * Send a request to the Eagle API and validate the JSON response.
   *
   * Any non-OK HTTP response, and any response whose `status` is `"error"`, is thrown as {@link EagleApiError}.
   * A successful response that does not match `schema` is thrown as a `ZodError`.
   */
  async request<S extends z.ZodType>(
    method: HttpMethod,
    endpoint: string,
    schema: S,
    options?: RequestOptions,
  ): Promise<z.output<S>> {
    const res = await this.send(method, endpoint, options);
    const text = await res.text();
    const json = parseJson(text);
    if (isErrorStatus(json)) {
      throw new EagleApiError(method, endpoint, res.status, toErrorResponse(json, text, res));
    }
    return schema.parse(json);
  }
}
