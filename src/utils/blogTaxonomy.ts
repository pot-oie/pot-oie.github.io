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
    label: "知识学习",
    englishLabel: "Knowledge Notes",
    description:
      "Exploring concepts, building foundations, deepening understanding.",
    slug: "classroom",
    icon: "mingcute:book-2-line",
    order: 5,
  },
];

export type TagStyleToken =
  | "ai"
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
  AI: {
    label: "AI",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  机器学习: {
    label: "机器学习",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  深度学习: {
    label: "深度学习",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  监督学习: {
    label: "监督学习",
    icon: "mingcute:book-2-line",
    styleToken: "study",
  },
  线性回归: {
    label: "线性回归",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  梯度下降: {
    label: "梯度下降",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  泛化: {
    label: "泛化",
    icon: "mingcute:check-2-line",
    styleToken: "study",
  },
  分类: {
    label: "分类",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  概率模型: {
    label: "概率模型",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  生成模型: {
    label: "生成模型",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  判别模型: {
    label: "判别模型",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  Sigmoid: {
    label: "Sigmoid",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  神经网络: {
    label: "神经网络",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  MLP: {
    label: "MLP",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  特征复用: {
    label: "特征复用",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  AI史: {
    label: "AI史",
    icon: "mingcute:book-2-line",
    styleToken: "study",
  },
  反向传播: {
    label: "反向传播",
    icon: "mingcute:process-line",
    styleToken: "algorithm",
  },
  数学: {
    label: "数学",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  梯度消失: {
    label: "梯度消失",
    icon: "mingcute:process-line",
    styleToken: "algorithm",
  },
  激活函数: {
    label: "激活函数",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  优化器: {
    label: "优化器",
    icon: "mingcute:process-line",
    styleToken: "algorithm",
  },
  Adam: {
    label: "Adam",
    icon: "mingcute:process-line",
    styleToken: "algorithm",
  },
  正则化: {
    label: "正则化",
    icon: "mingcute:check-2-line",
    styleToken: "study",
  },
  训练技巧: {
    label: "训练技巧",
    icon: "mingcute:check-2-line",
    styleToken: "study",
  },
  解码策略: {
    label: "解码策略",
    icon: "mingcute:shuffle-2-line",
    styleToken: "algorithm",
  },
  网络结构: {
    label: "网络结构",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  CNN: {
    label: "CNN",
    icon: "mingcute:grid-line",
    styleToken: "ai",
  },
  ResNet: {
    label: "ResNet",
    icon: "mingcute:grid-line",
    styleToken: "ai",
  },
  "U-Net": {
    label: "U-Net",
    icon: "mingcute:grid-line",
    styleToken: "ai",
  },
  GNN: {
    label: "GNN",
    icon: "mingcute:share-2-line",
    styleToken: "ai",
  },
  RNN: {
    label: "RNN",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  LSTM: {
    label: "LSTM",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  GRU: {
    label: "GRU",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  序列模型: {
    label: "序列模型",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  Attention: {
    label: "Attention",
    icon: "mingcute:eye-2-line",
    styleToken: "ai",
  },
  Transformer: {
    label: "Transformer",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  GPT: {
    label: "GPT",
    icon: "mingcute:ai-line",
    styleToken: "ai",
  },
  BERT: {
    label: "BERT",
    icon: "mingcute:book-2-line",
    styleToken: "ai",
  },
  LoRA: {
    label: "LoRA",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  Diffusion: {
    label: "Diffusion",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  DiT: {
    label: "DiT",
    icon: "mingcute:process-line",
    styleToken: "ai",
  },
  论文: {
    label: "论文",
    icon: "mingcute:book-2-line",
    styleToken: "study",
  },
  卷积: {
    label: "卷积",
    icon: "mingcute:grid-line",
    styleToken: "algorithm",
  },
  特征可视化: {
    label: "特征可视化",
    icon: "mingcute:eye-2-line",
    styleToken: "ai",
  },
  风格迁移: {
    label: "风格迁移",
    icon: "mingcute:palette-line",
    styleToken: "ai",
  },
  跨模态: {
    label: "跨模态",
    icon: "mingcute:transfer-3-line",
    styleToken: "ai",
  },
  消息传递: {
    label: "消息传递",
    icon: "mingcute:share-forward-line",
    styleToken: "ai",
  },
  聚合函数: {
    label: "聚合函数",
    icon: "mingcute:merge-line",
    styleToken: "algorithm",
  },
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
  数据结构: {
    label: "数据结构",
    icon: "mingcute:braces-line",
    styleToken: "algorithm",
  },
  计组: {
    label: "计组",
    icon: "mingcute:chip-line",
    styleToken: "system",
  },
  操作系统: {
    label: "操作系统",
    icon: "mingcute:server-line",
    styleToken: "system",
  },
  "C++": {
    label: "C++",
    icon: "mingcute:code-line",
    styleToken: "system",
  },
};

export const TAG_ALIASES: Record<string, string> = {
  ai: "AI",
  ml: "机器学习",
  "machine learning": "机器学习",
  dl: "深度学习",
  "deep learning": "深度学习",
  cnn: "CNN",
  resnet: "ResNet",
  unet: "U-Net",
  "u-net": "U-Net",
  gnn: "GNN",
  rnn: "RNN",
  lstm: "LSTM",
  gru: "GRU",
  attention: "Attention",
  transformer: "Transformer",
  gpt: "GPT",
  bert: "BERT",
  lora: "LoRA",
  diffusion: "Diffusion",
  dit: "DiT",
  decoding: "解码策略",
  sampling: "解码策略",
  sequence: "序列模型",
  "sequence model": "序列模型",
  "sequence models": "序列模型",
  sigmoid: "Sigmoid",
  mlp: "MLP",
  adam: "Adam",
  adamw: "Adam",
  backprop: "反向传播",
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
  "c++": "C++",
  cpp: "C++",
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
