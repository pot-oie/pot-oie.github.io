export type BlogEntryRelationData = {
  category?: string;
  lifeCategory?: string;
  techCategory?: string;
  albumTitle?: string;
  albumArtist?: string;
  series?: unknown;
};

export type BlogEntryRelationIssue = {
  field:
    | "lifeCategory"
    | "techCategory"
    | "albumTitle"
    | "albumArtist"
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
    if (!data.albumTitle) {
      issues.push({
        field: "albumTitle",
        message: "album 文章必须设置 albumTitle。",
      });
    }
    if (!data.albumArtist) {
      issues.push({
        field: "albumArtist",
        message: "album 文章必须设置 albumArtist。",
      });
    }
  } else {
    if (data.albumTitle) {
      issues.push({
        field: "albumTitle",
        message: "albumTitle 只能用于 life/album 文章。",
      });
    }
    if (data.albumArtist) {
      issues.push({
        field: "albumArtist",
        message: "albumArtist 只能用于 life/album 文章。",
      });
    }
  }

  return issues;
}
