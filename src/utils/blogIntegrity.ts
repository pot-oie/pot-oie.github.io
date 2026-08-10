import {
  TAG_REGISTRY,
  normalizeBlogTag,
} from "./blogTaxonomy";
import { validateBlogEntryRelations } from "../content-schema/blogRelations";

export {
  validateBlogEntryRelations,
  type BlogEntryRelationIssue,
} from "../content-schema/blogRelations";

export type BlogIntegritySeverity = "error" | "warning";

export type BlogIntegrityDiagnostic = {
  severity: BlogIntegritySeverity;
  entryId: string;
  field: string;
  message: string;
};

export type BlogIntegritySeries = {
  id: string;
  section?: string;
  order: number;
};

export type BlogIntegritySeriesDefinition = {
  id: string;
  title: string;
  sections?: {
    id: string;
    title: string;
    order: number;
  }[];
};

export type BlogIntegrityEntry = {
  id: string;
  data: {
    draft?: boolean;
    category?: string;
    lifeCategory?: string;
    techCategory?: string;
    albumId?: string;
    tags?: string[];
    series?: BlogIntegritySeries;
  };
};

export function validateBlogIntegrity(
  entries: readonly BlogIntegrityEntry[],
  seriesDefinitions: readonly BlogIntegritySeriesDefinition[] = [],
): BlogIntegrityDiagnostic[] {
  return [
    ...validateEntryRelationDiagnostics(entries),
    ...validateTagDiagnostics(entries),
    ...validateSeriesDiagnostics(entries, seriesDefinitions),
  ].sort(compareDiagnostics);
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
  seriesDefinitions: readonly BlogIntegritySeriesDefinition[],
): BlogIntegrityDiagnostic[] {
  const diagnostics: BlogIntegrityDiagnostic[] = [];
  const definitionsById = new Map<string, BlogIntegritySeriesDefinition>();
  const itemByPosition = new Map<string, BlogIntegrityEntry>();

  for (const definition of seriesDefinitions) {
    if (definitionsById.has(definition.id)) {
      diagnostics.push({
        severity: "error",
        entryId: `blog-series:${definition.id}`,
        field: "id",
        message: `系列 id "${definition.id}" 重复。`,
      });
      continue;
    }
    definitionsById.set(definition.id, definition);

    const sectionIds = new Set<string>();
    const sectionOrders = new Set<number>();
    for (const section of definition.sections ?? []) {
      if (!Number.isInteger(section.order) || section.order <= 0) {
        diagnostics.push({
          severity: "error",
          entryId: `blog-series:${definition.id}`,
          field: "sections.order",
          message: `分组 "${section.id}" 的 order 必须是正整数。`,
        });
      }
      if (sectionIds.has(section.id)) {
        diagnostics.push({
          severity: "error",
          entryId: `blog-series:${definition.id}`,
          field: "sections.id",
          message: `分组 id "${section.id}" 重复。`,
        });
      }
      sectionIds.add(section.id);

      if (sectionOrders.has(section.order)) {
        diagnostics.push({
          severity: "error",
          entryId: `blog-series:${definition.id}`,
          field: "sections.order",
          message: `分组 order ${section.order} 重复。`,
        });
      }
      sectionOrders.add(section.order);
    }
  }

  for (const entry of entries) {
    const series = entry.data.series;
    if (!series) continue;

    if (!Number.isInteger(series.order) || series.order <= 0) {
      diagnostics.push({
        severity: "error",
        entryId: entry.id,
        field: "series.order",
        message: "系列成员 order 必须是正整数。",
      });
      continue;
    }

    const definition = definitionsById.get(series.id);
    if (!definition) {
      diagnostics.push({
        severity: "error",
        entryId: entry.id,
        field: "series.id",
        message: `引用的系列 "${series.id}" 不存在。`,
      });
      continue;
    }

    if (
      series.section &&
      !definition.sections?.some((section) => section.id === series.section)
    ) {
      diagnostics.push({
        severity: "error",
        entryId: entry.id,
        field: "series.section",
        message: `系列 "${series.id}" 中不存在分组 "${series.section}"。`,
      });
      continue;
    }

    const sectionPosition = series.section ?? "unsectioned";
    const itemPosition = `${series.id}:${sectionPosition}:item:${series.order}`;
    const duplicateEntry = itemByPosition.get(itemPosition);

    if (duplicateEntry) {
      diagnostics.push({
        severity: "error",
        entryId: entry.id,
        field: "series.order",
        message: `系列 "${series.id}" 的同一分组中 order ${series.order} 已被 ${duplicateEntry.id} 使用。`,
      });
    } else {
      itemByPosition.set(itemPosition, entry);
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
