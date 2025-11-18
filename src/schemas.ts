import { z } from "zod";

// Color enum schema
export const colorSchema = z.enum(["red", "orange", "green", "yellow", "aqua", "blue", "purple", "pink"]);

// Order schema
export const orderSchema = z.enum([
  "MANUAL",
  "CREATEDATE",
  "-CREATEDATE",
  "FILESIZE",
  "-FILESIZE",
  "NAME",
  "-NAME",
  "RESOLUTION",
  "-RESOLUTION",
]);

// Error response schemas
export const eagleErrorResponseSchema = z.union([
  z.object({
    status: z.literal("error"),
    code: z.number(),
    message: z.string(),
  }),
  z.object({
    status: z.literal("error"),
    data: z.string(),
  }),
]);

// Child folder schema (recursive)
export type ChildFolder = {
  id: string;
  name: string;
  images: unknown[];
  folders: unknown[];
  modificationTime: number;
  editable?: boolean;
  imagesMappings?: unknown;
  tags: string[];
  children: ChildFolder[];
  isExpand: boolean;
  size?: number;
  vstype?: string;
  styles?: {
    depth: number;
    first: boolean;
    last: boolean;
  };
  isVisible?: boolean;
  index?: number;
  $$hashKey?: string;
  newFolderName?: string;
  imageCount?: number;
  descendantImageCount?: number;
  pinyin?: string;
  extendTags?: unknown[];
  covers?: unknown[];
  parent?: string;
};

const childSchema: z.ZodType<ChildFolder> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.unknown()),
    folders: z.array(z.unknown()),
    modificationTime: z.number(),
    editable: z.boolean().optional(),
    imagesMappings: z.unknown().optional(),
    tags: z.array(z.string()),
    children: z.array(childSchema),
    isExpand: z.boolean(),
    size: z.number().optional(),
    vstype: z.string().optional(),
    styles: z
      .object({
        depth: z.number(),
        first: z.boolean(),
        last: z.boolean(),
      })
      .optional(),
    isVisible: z.boolean().optional(),
    index: z.number().optional(),
    $$hashKey: z.string().optional(),
    newFolderName: z.string().optional(),
    imageCount: z.number().optional(),
    descendantImageCount: z.number().optional(),
    pinyin: z.string().optional(),
    extendTags: z.array(z.unknown()).optional(),
    covers: z.array(z.unknown()).optional(),
    parent: z.string().optional(),
  }),
);

export const childFolderSchema = childSchema;

// Application Info
export const getApplicationInfoSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    version: z.string(),
    prereleaseVersion: z.unknown(),
    buildVersion: z.string(),
    execPath: z.string().optional(),
    platform: z.string(),
    preferences: z.unknown().optional(),
  }),
});

// Folder schemas
export const createFolderSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.unknown()),
    folders: z.array(z.unknown()),
    modificationTime: z.number(),
    imagesMappings: z.unknown().optional(),
    tags: z.array(z.string()),
    children: z.array(z.unknown()),
    isExpand: z.boolean(),
  }),
});

export const renameFolderSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.unknown()),
    folders: z.array(z.unknown()),
    modificationTime: z.number(),
    imagesMappings: z.unknown().optional(),
    tags: z.array(z.string()),
    children: z.array(childFolderSchema),
    isExpand: z.boolean(),
    size: z.number().optional(),
    vstype: z.string().optional(),
    styles: z
      .object({
        depth: z.number(),
        first: z.boolean(),
        last: z.boolean(),
      })
      .optional(),
    isVisible: z.boolean().optional(),
    $$hashKey: z.string().optional(),
    newFolderName: z.string().optional(),
    editable: z.boolean().optional(),
    pinyin: z.string().optional(),
  }),
});

export const updateFolderSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    images: z.array(z.unknown()),
    folders: z.array(z.unknown()),
    modificationTime: z.number(),
    imagesMapping: z.unknown().optional(),
    tags: z.array(z.string()),
    children: z.array(childFolderSchema),
    isExpand: z.boolean(),
    size: z.number().optional(),
    vstype: z.string().optional(),
    styles: z
      .object({
        depth: z.number(),
        first: z.boolean(),
        last: z.boolean(),
      })
      .optional(),
    isVisible: z.boolean().optional(),
    $$hashKey: z.string().optional(),
    editable: z.boolean().optional(),
  }),
});

export const getFolderListSchema = z.object({
  status: z.literal("success"),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      children: z.array(childFolderSchema),
      modificationTime: z.number(),
      tags: z.array(z.string()),
      imageCount: z.number().optional(),
      descendantImageCount: z.number().optional(),
      pinyin: z.string().optional(),
      extendTags: z.array(z.string()).optional(),
    }),
  ),
});

export const getRecentFolderListSchema = z.object({
  status: z.literal("success"),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      children: z.array(childFolderSchema),
      modificationTime: z.number(),
      tags: z.array(z.string()),
      password: z.string().optional(),
      passwordTips: z.string().optional(),
      images: z.array(z.unknown()).optional(),
      isExpand: z.boolean().optional(),
      newFolderName: z.string().optional(),
      imagesMappings: z.unknown().optional(),
      imageCount: z.number().optional(),
      descendantImageCount: z.number().optional(),
      pinyin: z.string().optional(),
      extendTags: z.array(z.string()).optional(),
    }),
  ),
});

// Item schemas
export const addItemFromUrlSchema = z.object({
  status: z.literal("success"),
});

export const addItemFromUrlsSchema = z.object({
  status: z.literal("success"),
});

export const addItemFromPathSchema = z.object({
  status: z.literal("success"),
});

export const addItemFromPathsSchema = z.object({
  status: z.literal("success"),
});

export const addBookmarkSchema = z.object({
  status: z.literal("success"),
});

export const getItemInfoSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    ext: z.string(),
    tags: z.array(z.string()),
    folders: z.array(z.string()),
    isDeleted: z.boolean(),
    url: z.string(),
    annotation: z.string(),
    modificationTime: z.number(),
    width: z.number(),
    height: z.number(),
    noThumbnail: z.boolean().optional(),
    lastModified: z.number(),
    palettes: z.array(
      z.object({
        color: z.array(z.number()),
        ratio: z.number(),
        $$hashKey: z.string().optional(),
      }),
    ),
  }),
});

export const getItemThumbnailSchema = z.object({
  status: z.literal("success"),
  data: z.string(),
});

export const getItemListSchema = z.object({
  status: z.literal("success"),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      size: z.number(),
      ext: z.string(),
      tags: z.array(z.string()),
      folders: z.array(z.string()),
      isDeleted: z.boolean(),
      url: z.string(),
      annotation: z.string(),
      modificationTime: z.number(),
      height: z.number(),
      width: z.number(),
      lastModified: z.number(),
      palettes: z.array(
        z.object({
          color: z.array(z.number()),
          ratio: z.number(),
          $$hashKey: z.string().optional(),
        }),
      ),
    }),
  ),
});

export const moveItemToTrashSchema = z.object({
  status: z.literal("success"),
});

export const refreshItemPaletteSchema = z.object({
  status: z.literal("success"),
});

export const refreshThumbnailSchema = z.object({
  status: z.literal("success"),
});

export const updateItemSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    id: z.string(),
    name: z.string(),
    size: z.number(),
    ext: z.string(),
    tags: z.array(z.string()),
    folders: z.array(z.string()),
    isDeleted: z.boolean(),
    url: z.string(),
    annotation: z.string(),
    modificationTime: z.number(),
    width: z.number(),
    height: z.number(),
    noThumbnail: z.boolean().optional(),
    lastModified: z.number(),
    palettes: z.array(
      z.object({
        color: z.array(z.number()),
        ratio: z.number(),
        $$hashKey: z.string().optional(),
      }),
    ),
  }),
});

// Library schemas
export const getLibraryInfoSchema = z.object({
  status: z.literal("success"),
  data: z.object({
    folders: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        children: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
            children: z.array(z.unknown()),
            modificationTime: z.number(),
            tags: z.array(z.string()),
            iconColor: z.string().optional(),
            password: z.string().optional(),
            passwordTips: z.string().optional(),
            coverId: z.string().optional(),
            orderBy: orderSchema.optional(),
            sortIncrease: z.boolean().optional(),
          }),
        ),
        modificationTime: z.number(),
        tags: z.array(z.string()),
        iconColor: z.string().optional(),
        password: z.string().optional(),
        passwordTips: z.string().optional(),
        coverId: z.string().optional(),
        orderBy: orderSchema.optional(),
        sortIncrease: z.boolean().optional(),
      }),
    ),
    smartFolders: z.array(
      z.object({
        id: z.string(),
        icon: z.string().optional(),
        name: z.string(),
        description: z.string().optional(),
        modificationTime: z.string(),
        conditions: z.array(
          z.object({
            match: z.string(),
            rules: z.array(
              z.object({
                method: z.string(),
                property: z.string(),
                value: z.array(z.number()),
              }),
            ),
          }),
        ),
      }),
    ),
    quickAccess: z.array(
      z.object({
        type: z.string(),
        id: z.string(),
      }),
    ),
    tagsGroups: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        tags: z.array(z.string()),
        color: colorSchema,
      }),
    ),
    modificationTime: z.number(),
    applicationVersion: z.string(),
    library: z.object({
      path: z.string(),
      name: z.string(),
    }),
  }),
});

export const getLibraryHistorySchema = z.object({
  status: z.literal("success"),
  data: z.array(z.string()),
});

export const switchLibrarySchema = z.object({
  status: z.literal("success"),
});
