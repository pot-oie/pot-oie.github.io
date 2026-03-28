export const TECH_CATEGORIES = [
  "classroom",
  "leetcode",
  "frontend",
  "backend",
  "ai",
] as const;

export type TechCategory = (typeof TECH_CATEGORIES)[number];

export type TechCategoryMeta = {
  key: TechCategory;
  label: string;
  englishLabel: string;
  description: string;
  slug: string;
  icon: string;
  order: number;
};

export const TECH_CATEGORY_META_LIST: TechCategoryMeta[] = [
  {
    key: "frontend",
    label: "前端学习",
    englishLabel: "Frontend Notes",
    description:
      "Build interfaces, touch interactions, master frontend practice.",
    slug: "frontend",
    icon: "mingcute:paint-brush-line",
    order: 1,
  },
  {
    key: "backend",
    label: "后端学习",
    englishLabel: "Backend Notes",
    description: "Protocols, mechanisms, and the foundation of backend.",
    slug: "backend",
    icon: "mingcute:server-line",
    order: 2,
  },
  {
    key: "ai",
    label: "AI相关",
    englishLabel: "AI Notes",
    description:
      "Understanding models, practicing applications, reflecting on intelligent systems.",
    slug: "ai",
    icon: "mingcute:ai-line",
    order: 3,
  },
  {
    key: "leetcode",
    label: "leetcode题解",
    englishLabel: "LeetCode Notes",
    description: "Solving algorithms, dissecting logic, reviewing code.",
    slug: "leetcode",
    icon: "mingcute:code-line",
    order: 4,
  },
  {
    key: "classroom",
    label: "课程学习",
    englishLabel: "Classroom Notes",
    description:
      "Absorbing lectures, grasping knowledge, grounding fundamentals.",
    slug: "classroom",
    icon: "mingcute:book-2-line",
    order: 5,
  },
];

export type TagStyleToken =
  | "interaction"
  | "design"
  | "frontend"
  | "backend"
  | "algorithm"
  | "study"
  | "system"
  | "database"
  | "default";

export type BlogTagMeta = {
  label: string;
  icon: string;
  styleToken: TagStyleToken;
};

export const DEFAULT_TAG_META: BlogTagMeta = {
  label: "未分类",
  icon: "mingcute:tag-2-line",
  styleToken: "default",
};

export const TAG_REGISTRY: Record<string, BlogTagMeta> = {
  交互: {
    label: "交互",
    icon: "mingcute:cursor-2-line",
    styleToken: "interaction",
  },
  "UI/UX": {
    label: "UI/UX",
    icon: "mingcute:palette-line",
    styleToken: "design",
  },
  JavaScript: {
    label: "JavaScript",
    icon: "mingcute:code-line",
    styleToken: "frontend",
  },
  CSS: {
    label: "CSS",
    icon: "mingcute:paint-line",
    styleToken: "frontend",
  },
  Astro: {
    label: "Astro",
    icon: "mingcute:planet-line",
    styleToken: "frontend",
  },
  SSG: {
    label: "SSG",
    icon: "mingcute:rocket-line",
    styleToken: "frontend",
  },
  Android: {
    label: "Android",
    icon: "mingcute:android-2-line",
    styleToken: "system",
  },
  Kotlin: {
    label: "Kotlin",
    icon: "mingcute:code-line",
    styleToken: "frontend",
  },
  ARM: {
    label: "ARM",
    icon: "mingcute:process-line",
    styleToken: "system",
  },
  ICMP: {
    label: "ICMP",
    icon: "mingcute:wifi-line",
    styleToken: "backend",
  },
  计网: {
    label: "计网",
    icon: "mingcute:earth-line",
    styleToken: "backend",
  },
  SQL: {
    label: "SQL",
    icon: "mingcute:storage-line",
    styleToken: "database",
  },
  数据库: {
    label: "数据库",
    icon: "mingcute:storage-line",
    styleToken: "database",
  },
  嵌入式: {
    label: "嵌入式",
    icon: "mingcute:chip-line",
    styleToken: "system",
  },
  算法: {
    label: "算法",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  资料: {
    label: "资料",
    icon: "mingcute:book-6-line",
    styleToken: "study",
  },
  复习: {
    label: "复习",
    icon: "mingcute:check-2-line",
    styleToken: "study",
  },
  leetcode: {
    label: "leetcode",
    icon: "mingcute:code-line",
    styleToken: "algorithm",
  },
};

export const TAG_ALIASES: Record<string, string> = {
  javascript: "JavaScript",
  js: "JavaScript",
  css3: "CSS",
  ui: "UI/UX",
  ux: "UI/UX",
  uiux: "UI/UX",
  interaction: "交互",
  交互设计: "交互",
  leetcode: "leetcode",
  sql: "SQL",
  review: "复习",
  network: "计网",
  networking: "计网",
  database: "数据库",
  embedded: "嵌入式",
  编码: "算法",
  algorithm: "算法",
};

export function normalizeBlogTag(rawTag: string): string {
  const trimmed = rawTag.trim();
  if (!trimmed) return trimmed;

  const normalizedKey = trimmed.toLowerCase();
  return TAG_ALIASES[normalizedKey] ?? trimmed;
}

export function getBlogTagMeta(rawTag: string): BlogTagMeta {
  const normalized = normalizeBlogTag(rawTag);
  return (
    TAG_REGISTRY[normalized] ?? {
      label: normalized,
      icon: DEFAULT_TAG_META.icon,
      styleToken: DEFAULT_TAG_META.styleToken,
    }
  );
}

export const LIFE_CATEGORIES = ["daily", "album", "movie"] as const;
export type LifeCategory = (typeof LIFE_CATEGORIES)[number];

export type LifeCategoryMeta = {
  key: LifeCategory;
  label: string;
  englishLabel: string;
  description: string;
  slug: string;
  icon: string;
  order: number;
};

export const LIFE_CATEGORY_META_LIST: LifeCategoryMeta[] = [
  {
    key: "daily",
    label: "日常随笔",
    englishLabel: "Daily Essays",
    description: "浮生碎影，心迹常录",
    slug: "daily",
    icon: "mingcute:drink-line",
    order: 1,
  },
  {
    key: "album",
    label: "专辑鉴赏",
    englishLabel: "Album Reviews",
    description: "律韵入耳，心曲留声",
    slug: "album",
    icon: "mingcute:album-fill",
    order: 2,
  },
  {
    key: "movie",
    label: "电影长评",
    englishLabel: "Movie Reviews",
    description: "光影叙语，观后留痕",
    slug: "movie",
    icon: "mingcute:movie-line",
    order: 3,
  },
];
