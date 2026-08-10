export type BlogEntryRelationData = {
  category?: string;
  lifeCategory?: string;
  techCategory?: string;
  albumId?: string;
  series?: unknown;
};

export type BlogEntryRelationIssue = {
  field:
    | "lifeCategory"
    | "techCategory"
    | "albumId"
    | "series";
  message: string;
};

export function validateBlogEntryRelations(
  data: BlogEntryRelationData,
): BlogEntryRelationIssue[] {
  const issues: BlogEntryRelationIssue[] = [];

  if (data.category === "learn") {
    if (!data.techCategory) {
      issues.push({
        field: "techCategory",
        message: "learn 分类文章必须设置 techCategory。",
      });
    }
    if (data.lifeCategory) {
      issues.push({
        field: "lifeCategory",
        message: "learn 分类文章不能设置 lifeCategory。",
      });
    }
  }

  if (data.category === "life") {
    if (!data.lifeCategory) {
      issues.push({
        field: "lifeCategory",
        message: "life 分类文章必须设置 lifeCategory。",
      });
    }
    if (data.techCategory) {
      issues.push({
        field: "techCategory",
        message: "life 分类文章不能设置 techCategory。",
      });
    }
    if (data.series) {
      issues.push({
        field: "series",
        message: "series 仅用于 learn 分类文章。",
      });
    }
  }

  const isAlbum =
    data.category === "life" && data.lifeCategory === "album";
  if (isAlbum) {
    if (!data.albumId) {
      issues.push({
        field: "albumId",
        message: "album 文章必须设置 albumId。",
      });
    }
  } else {
    if (data.albumId) {
      issues.push({
        field: "albumId",
        message: "albumId 只能用于 life/album 文章。",
      });
    }
  }

  return issues;
}
