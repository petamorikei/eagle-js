import type { EagleHttp } from "../http.ts";
import { AiSearchApiV2 } from "./aiSearch.ts";
import { AppApiV2 } from "./app.ts";
import { FolderApiV2 } from "./folder.ts";
import { ItemApiV2 } from "./item.ts";
import { LibraryApiV2 } from "./library.ts";
import { SmartFolderApiV2 } from "./smartFolder.ts";
import { TagApiV2 } from "./tag.ts";
import { TagGroupApiV2 } from "./tagGroup.ts";

export { AiSearchApiV2 } from "./aiSearch.ts";
export { AppApiV2 } from "./app.ts";
export { FolderApiV2 } from "./folder.ts";
export { ItemApiV2 } from "./item.ts";
export { LibraryApiV2 } from "./library.ts";
export { SmartFolderApiV2 } from "./smartFolder.ts";
export { TagApiV2 } from "./tag.ts";
export { TagGroupApiV2 } from "./tagGroup.ts";

/**
 * Eagle Web API v2 (`/api/v2/...`), available as `EagleClient#v2`.
 *
 * Methods are grouped by category and named after the endpoints, so `/api/v2/tagGroup/create`
 * is `client.v2.tagGroup.create()`. Every method returns the whole response (`{ status, data }`).
 *
 * Some calls report a missing target as a success with `data: false` or without `data`
 * instead of an error; see each method's description.
 *
 * Requires Eagle 4.0 build 21 or later.
 *
 * @see https://developer.eagle.cool/web-api
 */
export class EagleV2 {
  readonly app: AppApiV2;
  readonly library: LibraryApiV2;
  readonly item: ItemApiV2;
  readonly folder: FolderApiV2;
  readonly smartFolder: SmartFolderApiV2;
  readonly tag: TagApiV2;
  readonly tagGroup: TagGroupApiV2;
  readonly aiSearch: AiSearchApiV2;

  /** @internal Use `EagleClient#v2` instead. */
  constructor(http: EagleHttp) {
    this.app = new AppApiV2(http);
    this.library = new LibraryApiV2(http);
    this.item = new ItemApiV2(http);
    this.folder = new FolderApiV2(http);
    this.smartFolder = new SmartFolderApiV2(http);
    this.tag = new TagApiV2(http);
    this.tagGroup = new TagGroupApiV2(http);
    this.aiSearch = new AiSearchApiV2(http);
  }
}
