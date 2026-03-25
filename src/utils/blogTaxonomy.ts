export const TECH_CATEGORIES = [
  'classroom',
  'leetcode',
  'frontend',
  'backend',
  'ai',
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
    key: 'frontend',
    label: '前端学习',
    englishLabel: 'Frontend Notes',
    description: '界面实现、交互细节与前端工程实践。',
    slug: 'frontend',
    icon: 'mingcute:paint-brush-line',
    order: 1,
  },
  {
    key: 'backend',
    label: '后端学习',
    englishLabel: 'Backend Notes',
    description: '网络协议、服务端机制与基础后端能力。',
    slug: 'backend',
    icon: 'mingcute:server-line',
    order: 2,
  },
  {
    key: 'ai',
    label: 'AI相关',
    englishLabel: 'AI Notes',
    description: '模型理解、应用实践与智能系统思考。',
    slug: 'ai',
    icon: 'mingcute:ai-line',
    order: 3,
  },
  {
    key: 'leetcode',
    label: 'leetcode题解',
    englishLabel: 'LeetCode Notes',
    description: '算法题解、思路拆解与代码复盘。',
    slug: 'leetcode',
    icon: 'mingcute:code-line',
    order: 4,
  },
  {
    key: 'classroom',
    label: '课程学习',
    englishLabel: 'Classroom Notes',
    description: '课程内容、教材知识点与基础原理笔记。',
    slug: 'classroom',
    icon: 'mingcute:book-2-line',
    order: 5,
  },
];

export type TagStyleToken =
  | 'interaction'
  | 'design'
  | 'frontend'
  | 'backend'
  | 'algorithm'
  | 'study'
  | 'system'
  | 'database'
  | 'default';

export type BlogTagMeta = {
  label: string;
  icon: string;
  styleToken: TagStyleToken;
};

export const DEFAULT_TAG_META: BlogTagMeta = {
  label: '未分类',
  icon: 'mingcute:tag-2-line',
  styleToken: 'default',
};

export const TAG_REGISTRY: Record<string, BlogTagMeta> = {
  '交互': {
    label: '交互',
    icon: 'mingcute:cursor-2-line',
    styleToken: 'interaction',
  },
  'UI/UX': {
    label: 'UI/UX',
    icon: 'mingcute:palette-line',
    styleToken: 'design',
  },
  'JavaScript': {
    label: 'JavaScript',
    icon: 'mingcute:code-line',
    styleToken: 'frontend',
  },
  'CSS': {
    label: 'CSS',
    icon: 'mingcute:paint-line',
    styleToken: 'frontend',
  },
  'Astro': {
    label: 'Astro',
    icon: 'mingcute:planet-line',
    styleToken: 'frontend',
  },
  'SSG': {
    label: 'SSG',
    icon: 'mingcute:rocket-line',
    styleToken: 'frontend',
  },
  'Android': {
    label: 'Android',
    icon: 'mingcute:android-2-line',
    styleToken: 'system',
  },
  'Kotlin': {
    label: 'Kotlin',
    icon: 'mingcute:code-line',
    styleToken: 'frontend',
  },
  'ARM': {
    label: 'ARM',
    icon: 'mingcute:process-line',
    styleToken: 'system',
  },
  'ICMP': {
    label: 'ICMP',
    icon: 'mingcute:wifi-line',
    styleToken: 'backend',
  },
  '计网': {
    label: '计网',
    icon: 'mingcute:earth-line',
    styleToken: 'backend',
  },
  'SQL': {
    label: 'SQL',
    icon: 'mingcute:storage-line',
    styleToken: 'database',
  },
  '数据库': {
    label: '数据库',
    icon: 'mingcute:storage-line',
    styleToken: 'database',
  },
  '嵌入式': {
    label: '嵌入式',
    icon: 'mingcute:chip-line',
    styleToken: 'system',
  },
  '算法': {
    label: '算法',
    icon: 'mingcute:braces-line',
    styleToken: 'algorithm',
  },
  '资料': {
    label: '资料',
    icon: 'mingcute:book-6-line',
    styleToken: 'study',
  },
  '复习': {
    label: '复习',
    icon: 'mingcute:check-2-line',
    styleToken: 'study',
  },
  'leetcode': {
    label: 'leetcode',
    icon: 'mingcute:code-line',
    styleToken: 'algorithm',
  },
};

export const TAG_ALIASES: Record<string, string> = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  css3: 'CSS',
  ui: 'UI/UX',
  ux: 'UI/UX',
  uiux: 'UI/UX',
  interaction: '交互',
  '交互设计': '交互',
  leetcode: 'leetcode',
  sql: 'SQL',
  review: '复习',
  network: '计网',
  networking: '计网',
  database: '数据库',
  embedded: '嵌入式',
  '编码': '算法',
  algorithm: '算法',
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