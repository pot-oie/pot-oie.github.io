import {
  TAG_REGISTRY,
  normalizeBlogTag,
} from "./blogTaxonomy";

export type BlogIntegritySeverity = "error" | "warning";

export type BlogIntegrityDiagnostic = {
  severity: BlogIntegritySeverity;
  entryId: string;
  field: string;
  message: string;
};

export type BlogIntegritySeries = {
  key: string;
  title: string;
  section?: {
    title: string;
    order: number;
  };
  order: number;
};

export type BlogIntegrityEntry = {
  id: string;
  data: {
    draft?: boolean;
    category?: string;
    lifeCategory?: string;
    techCategory?: string;
    albumTitle?: string;
    albumArtist?: string;
    tags?: string[];
    series?: BlogIntegritySeries;
  };
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

export function validateBlogIntegrity(
  entries: readonly BlogIntegrityEntry[],
): BlogIntegrityDiagnostic[] {
  return [
    ...validateEntryRelationDiagnostics(entries),
    ...validateTagDiagnostics(entries),
    ...validateSeriesDiagnostics(entries),
  ].sort(compareDiagnostics);
}

export function validateBlogEntryRelations(
  data: BlogIntegrityEntry["data"],
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

function validateEntryRelationDiagnostics(
  entries: readonly BlogIntegrityEntry[],
): BlogIntegrityDiagnostic[] {
  return entries.flatMap((entry) =>
    validateBlogEntryRelations(entry.data).map((issue) => ({
      severity: "error" as const,
      entryId: entry.id,
      field: issue.field,
      message: issue.message,
    })),
  );
}

function validateTagDiagnostics(
  entries: readonly BlogIntegrityEntry[],
): BlogIntegrityDiagnostic[] {
  const diagnostics: BlogIntegrityDiagnostic[] = [];

  for (const entry of entries) {
    const normalizedTags = new Map<string, number>();

    for (const [index, rawTag] of (entry.data.tags ?? []).entries()) {
      const normalizedTag = normalizeBlogTag(rawTag);
      const field = `tags[${index}]`;

      if (rawTag !== normalizedTag) {
        diagnostics.push({
          severity: "warning",
          entryId: entry.id,
          field,
          message: `"${rawTag}" 会被规范化为 "${normalizedTag}"；建议在 frontmatter 中直接使用规范标签。`,
        });
      }

      const firstIndex = normalizedTags.get(normalizedTag);
      if (firstIndex !== undefined) {
        diagnostics.push({
          severity: "error",
          entryId: entry.id,
          field,
          message: `与 tags[${firstIndex}] 规范化后都为 "${normalizedTag}"，会造成重复标签。`,
        });
      } else {
        normalizedTags.set(normalizedTag, index);
      }

      if (!Object.hasOwn(TAG_REGISTRY, normalizedTag)) {
        diagnostics.push({
          severity: "warning",
          entryId: entry.id,
          field,
          message: `"${normalizedTag}" 未注册，将继续发布并使用默认标签样式。`,
        });
      }
    }
  }

  return diagnostics;
}

function validateSeriesDiagnostics(
  entries: readonly BlogIntegrityEntry[],
): BlogIntegrityDiagnostic[] {
  const diagnostics: BlogIntegrityDiagnostic[] = [];
  const seriesGroups = new Map<string, BlogIntegrityEntry[]>();

  for (const entry of entries) {
    const seriesKey = entry.data.series?.key;
    if (!seriesKey) continue;

    const group = seriesGroups.get(seriesKey) ?? [];
    group.push(entry);
    seriesGroups.set(seriesKey, group);
  }

  for (const [seriesKey, seriesEntries] of seriesGroups) {
    const firstEntry = seriesEntries[0];
    const expectedTitle = firstEntry.data.series!.title;
    const sectionTitleByOrder = new Map<number, BlogIntegrityEntry>();
    const sectionOrderByTitle = new Map<string, BlogIntegrityEntry>();
    const itemByPosition = new Map<string, BlogIntegrityEntry>();

    for (const entry of seriesEntries) {
      const series = entry.data.series!;

      if (series.title !== expectedTitle) {
        diagnostics.push({
          severity: "error",
          entryId: entry.id,
          field: "series.title",
          message: `系列 "${seriesKey}" 的标题应为 "${expectedTitle}"，与 ${firstEntry.id} 保持一致。`,
        });
      }

      if (series.section) {
        const sameOrderEntry = sectionTitleByOrder.get(series.section.order);
        if (
          sameOrderEntry &&
          sameOrderEntry.data.series!.section!.title !== series.section.title
        ) {
          diagnostics.push({
            severity: "error",
            entryId: entry.id,
            field: "series.section.title",
            message: `系列 "${seriesKey}" 的 section.order ${series.section.order} 已由 ${sameOrderEntry.id} 用于 "${sameOrderEntry.data.series!.section!.title}"。`,
          });
        } else {
          sectionTitleByOrder.set(series.section.order, entry);
        }

        const sameTitleEntry = sectionOrderByTitle.get(series.section.title);
        if (
          sameTitleEntry &&
          sameTitleEntry.data.series!.section!.order !== series.section.order
        ) {
          diagnostics.push({
            severity: "error",
            entryId: entry.id,
            field: "series.section.order",
            message: `系列 "${seriesKey}" 的分组 "${series.section.title}" 应使用 order ${sameTitleEntry.data.series!.section!.order}，与 ${sameTitleEntry.id} 保持一致。`,
          });
        } else {
          sectionOrderByTitle.set(series.section.title, entry);
        }
      }

      const sectionPosition = series.section
        ? `section:${series.section.order}`
        : "unsectioned";
      const itemPosition = `${sectionPosition}:item:${series.order}`;
      const duplicateEntry = itemByPosition.get(itemPosition);

      if (duplicateEntry) {
        diagnostics.push({
          severity: "error",
          entryId: entry.id,
          field: "series.order",
          message: `系列 "${seriesKey}" 的同一分组中 order ${series.order} 已被 ${duplicateEntry.id} 使用。`,
        });
      } else {
        itemByPosition.set(itemPosition, entry);
      }
    }
  }

  return diagnostics;
}

function compareDiagnostics(
  a: BlogIntegrityDiagnostic,
  b: BlogIntegrityDiagnostic,
): number {
  const severityDiff =
    Number(a.severity === "warning") - Number(b.severity === "warning");
  if (severityDiff !== 0) return severityDiff;

  return (
    a.entryId.localeCompare(b.entryId) ||
    a.field.localeCompare(b.field) ||
    a.message.localeCompare(b.message)
  );
}
