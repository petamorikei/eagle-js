import { OutgoingHttpHeaders } from "http";

export const Color = {
  red: "red",
  orange: "orange",
  green: "green",
  yellow: "yellow",
  aqua: "aqua",
  blue: "blue",
  purple: "purple",
  pink: "pink",
} as const;

export type Color = typeof Color[keyof typeof Color];

export type GetApplicationInfoResult = {
  status: string;
  data: {
    version: string;
    prereleaseVersion: unknown;
    buildVersion: string;
    execPath: string;
    platform: string;
  };
};

export type Child = {
  id: string;
  name: string;
  images: unknown[];
  folders: unknown[];
  modificationTime: number;
  editable: boolean;
  imagesMappings: unknown;
  tags: string[];
  children: Child[];
  isExpand: boolean;
  size: number;
  vstype: string;
  styles: {
    depth: number;
    first: boolean;
    last: boolean;
  };
  isVisible: boolean;
  index: number;
  $$hashKey: string;
  newFolderName: string;
  imageCount: number;
  descendantImageCount: number;
  pinyin: string;
  extendTags: unknown[];
  covers: unknown[];
  parent: string;
};

export type CreateFolderResult = {
  status: string;
  data: {
    id: string;
    name: string;
    images: unknown[];
    folders: unknown[];
    modificationTime: number;
    imagesMappings: unknown;
    tags: string[];
    children: unknown[];
    isExpand: boolean;
  };
};

export type RenameFolderResult = {
  status: string;
  data: {
    id: string;
    name: string;
    images: unknown[];
    folders: unknown[];
    modificationTime: number;
    imagesMappings: unknown;
    tags: string[];
    children: Child[];
    isExpand: boolean;
    size: number;
    vstype: string;
    styles: {
      depth: number;
      first: boolean;
      last: boolean;
    };
    isVisible: boolean;
    $$hashKey: string;
    newFolderName: string;
    editable: boolean;
    pinyin: string;
  };
};

export type UpdateFolderResult = {
  status: string;
  data: {
    id: string;
    name: string;
    description: string;
    images: unknown[];
    folders: unknown[];
    modificationTime: number;
    imagesMapping: unknown;
    tags: string[];
    children: Child[];
    isExpand: boolean;
    size: number;
    vstype: string;
    styles: {
      depth: number;
      first: boolean;
      last: boolean;
    };
    isVisible: boolean;
    $$hashKey: string;
    editable: boolean;
  };
};

export type GetFolderListResult = {
  status: string;
  data: {
    id: string;
    name: string;
    description: string;
    children: Child[];
    modificationTime: number;
    tags: string[];
    imageCount: number;
    descendantImageCount: number;
    pinyin: string;
    extendTags: string[];
  }[];
};

export type GetRecentFolderListResult = {
  status: string;
  data: {
    id: string;
    name: string;
    description: string;
    children: Child[];
    modificationTime: number;
    tags: string[];
    password: string;
    passwordTips: string;
    images: unknown[];
    isExpand: boolean;
    newFolderName: string;
    imagesMappings: unknown;
    imageCount: number;
    descendantImageCount: number;
    pinyin: string;
    extendTags: string[];
  }[];
};

export type AddItemFromUrlResult = {
  status: string;
};

export type Item = {
  url: string;
  name?: string;
  website?: string;
  annotation?: string;
  tags?: string[];
  modificationTime?: number;
  headers?: OutgoingHttpHeaders;
};

export type AddItemFromUrlsResult = {
  status: string;
};

export type AddItemFromPathResult = {
  status: string;
};

export type AddItemFromPathsResult = {
  status: string;
};

export type AddBookmarkResult = {
  status: string;
};

export type GetItemInfoResult = {
  status: string;
  data: {
    id: string;
    name: string;
    size: number;
    ext: string;
    tags: string[];
    folders: string[];
    isDeleted: boolean;
    url: string;
    annotation: string;
    modificationTime: number;
    width: number;
    height: number;
    noThumbnail: boolean;
    lastModified: number;
    palettes: { color: number[]; ratio: number; $$hashKey: string }[];
  };
};

export type GetItemThumbnailResult = {
  status: string;
  data: string;
};

export type Order = {
  manual: "MANUAL";
  createDateAsc: "CREATEDATE";
  createDateDesc: "-CREATEDATE";
  fileSizeAsc: "FILESIZE";
  fileSizeDesc: "-FILESIZE";
  nameAsc: "NAME";
  nameDesc: "-NAME";
  resolutionAsc: "RESOLUTION";
  resolutionDesc: "-RESOLUTION";
};

export type GetItemListResult = {
  status: string;
  data: {
    id: string;
    name: string;
    size: number;
    ext: string;
    tags: string[];
    folders: string[];
    isDeleted: boolean;
    url: string;
    annotation: string;
    modificationTime: number;
    height: number;
    width: number;
    lastModified: number;
    palettes: { color: number[]; ratio: number; $$hashKey: string }[];
  }[];
};

export type MoveItemToTrashResult = {
  status: string;
};

export type RefreshItemPaletteResult = {
  status: string;
};

export type RefreshThumbnailResult = {
  status: string;
};

export type UpdateItemResult = {
  status: string;
  data: {
    id: string;
    name: string;
    size: number;
    ext: string;
    tags: string[];
    folders: string[];
    isDeleted: boolean;
    url: string;
    annotation: string;
    modificationTime: number;
    width: number;
    height: number;
    noThumbnail: boolean;
    lastModified: number;
    palettes: { color: number[]; ratio: number; $$hashKey: string }[];
  };
};

export type GetLibraryInfoResult = {
  status: string;
  data: {
    folders: {
      id: string;
      name: string;
      description: "";
      children: {
        id: string;
        name: string;
        description: string;
        children: unknown[];
        modificationTime: number;
        tags: string[];
        iconColor: string;
        password: string;
        passwordTips: string;
        coverId: string;
        orderBy: Order;
        sortIncrease: boolean;
      }[];
      modificationTime: number;
      tags: string[];
      iconColor: string;
      password: string;
      passwordTips: string;
      coverId: string;
      orderBy: Order;
      sortIncrease: boolean;
    }[];
    smartFolders: {
      id: string;
      icon: string;
      name: string;
      description: string;
      modificationTime: string;
      conditions: {
        match: string;
        rules: {
          method: string;
          property: string;
          value: number[];
        }[];
      }[];
    }[];
    quickAccess: {
      type: string;
      id: string;
    }[];
    tagsGroups: {
      id: string;
      name: string;
      tags: string[];
      color: Color;
    }[];
    modificationTime: number;
    applicationVersion: string;
  };
};

export type GetLibraryHistoryResult = {
  status: string;
  data: string[];
};

export type SwitchLibraryResult = {
  status: string;
};
