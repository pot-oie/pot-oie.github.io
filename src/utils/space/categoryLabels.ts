export const SPACE_CATEGORY_LABELS = {
  "learn:frontend": "INTERFACE_DESIGN",
  "learn:backend": "SYSTEM_ARCHITECTURE",
  "learn:ai": "MACHINE_LEARNING",
  "learn:leetcode": "ALGORITHMIC_STUDIES",
  "learn:classroom": "KNOWLEDGE_ARCHIVE",
  "life:daily": "PERSONAL_NOTES",
  "life:album": "MUSIC_CRITICISM",
  "life:movie": "CINEMA_STUDIES",
} as const;

export type SpaceCategoryId = keyof typeof SPACE_CATEGORY_LABELS;

export interface SpaceCategorySource {
  category: "learn" | "life";
  techCategory?: string;
  lifeCategory?: string;
}

export function resolveSpaceCategory(
  source: SpaceCategorySource,
): { categoryId: SpaceCategoryId; categoryLabel: string } {
  const detail =
    source.category === "learn" ? source.techCategory : source.lifeCategory;
  const categoryId = `${source.category}:${detail ?? ""}` as SpaceCategoryId;
  const categoryLabel = SPACE_CATEGORY_LABELS[categoryId];
  if (!categoryLabel) {
    throw new Error(`Missing /space category label for ${categoryId}.`);
  }
  return { categoryId, categoryLabel };
}
