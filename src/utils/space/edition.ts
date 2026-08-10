export const SPACE_EDITION = {
  id: "space-2025-2026",
  period: "2025.08—2026.08",
  identity: {
    operator: "桂圆子",
    operatorLatin: "GUOYIZE",
    role: "STUDENT / LEARNER",
    location: "CHANGCHUN",
  },
  chapters: [
    { id: "learning", number: "01", name: "LEARNING", label: "LEARNING / NOTES & ARTICLES", summary: "Notes and selected articles", action: "ENTER ARTICLES", measure: "06 SELECTED TEXTS", keywords: "MODEL · RELATION · MEMORY", transition: { color: "#1646a0", direction: "lr", rotation: 0 } },
    { id: "film", number: "02", name: "FILM", label: "WATCH / SELECTED RECORDS", summary: "A partial viewing record", action: "ENTER FILM MONTAGE", measure: "08 VIEWING RECORDS", keywords: "FRAME · CUT · AFTERIMAGE", transition: { color: "#e54a2c", direction: "diag-up", rotation: -12 } },
    { id: "music", number: "03", name: "MUSIC", label: "LISTEN / SELECTED TRACKS", summary: "Tracks retained by date", action: "ENTER MUSIC SCORE", measure: "08 TRACK PREVIEWS", keywords: "PULSE · INTERVAL · RETURN", transition: { color: "#1fcbd0", direction: "bt", rotation: 0 } },
    { id: "development", number: "04", name: "DEVELOPMENT", label: "MAKE / DEVELOPMENT & TOOLS", summary: "Selected things made along the way", action: "ENTER PROJECT SYSTEM", measure: "05 PROJECT ANCHORS", keywords: "SYSTEM · TOOL · ITERATION", transition: { color: "#087e62", direction: "rl", rotation: 0 } },
    { id: "direction", number: "05", name: "DIRECTION", label: "VECTOR / CURRENT DIRECTION", summary: "What currently receives attention", action: "ENTER DIRECTION FIELD", measure: "05 EMPHASIS FIELDS", keywords: "ATTENTION · VECTOR · NOW", transition: { color: "#c6ef26", direction: "diag-up", rotation: -10 } },
  ],
  articles: [
    { sourceId: "ml-01-introduction", title: "机器如何开始学习", summary: "从问题、数据与模型之间建立最初的关系。" },
    { sourceId: "dl-01-perceptron-to-mlp", title: "从感知机走向深度网络", summary: "由简单边界开始，理解层次如何带来表达能力。" },
    { sourceId: "cnn-01-local-patterns", title: "局部模式与卷积", summary: "观察共享参数如何让图像结构变得可以学习。" },
    { sourceId: "gnn-01-message-passing", title: "把信息传入图结构", summary: "从规则网格离开，让节点在邻域之间交换信息。" },
    { sourceId: "transformer-01-self-attention", title: "注意力如何组织信息", summary: "以 Q、K、V 为入口理解关系与上下文。" },
    { sourceId: "SQL-source", title: "散落的数据库课程资料", summary: "一份课程材料的重新整理与共享。" },
  ],
  randomSelection: {
    filmCount: 8,
    trackCount: 8,
    maxTracksPerArtist: 2,
    maxTracksPerDate: 2,
  },
  filmCropOverrides: {
    "the-grand-budapest-hotel": "center 28%",
    dune: "center 22%",
    prisoners: "52% center",
    sunset: "center 32%",
    "jojo-rabbit": "center 24%",
  },
  projects: [
    { id: "northward", label: "NORTHWARD", url: "https://northward.zone/" },
    { id: "sparkhub", label: "SPARKHUB", url: "https://github.com/pot-oie/sparkhub-platform" },
    { id: "passpot", label: "PASSPOT", url: "/" },
    { id: "smarthome", label: "SMARTHOME", url: "https://github.com/pot-oie/SmartHome" },
    { id: "pebble", label: "PEBBLE", url: "https://github.com/pot-oie/Pebble" },
  ],
  direction: [
    { id: "learning", label: "KEEP LEARNING", state: "CONTINUOUS" },
    { id: "graduate", label: "GRADUATE STUDY", state: "APPROACHING" },
    { id: "research", label: "RESEARCH", state: "FORMING" },
    { id: "408", label: "408", state: "IMMEDIATE" },
    { id: "code-practice", label: "CODE PRACTICE", state: "RECURRING" },
  ],
} as const;

export type SpaceEditionConfig = typeof SPACE_EDITION;

export interface SpacePosterVariant {
  src: string;
  srcset: string;
  width: number;
  height: number;
}

export interface ResolvedSpaceEdition {
  id: string;
  period: string;
  identity: SpaceEditionConfig["identity"];
  chapters: SpaceEditionConfig["chapters"];
  randomSelection: SpaceEditionConfig["randomSelection"];
  articles: Array<{ id: string; title: string; summary: string; href: string }>;
  films: Array<{ id: string; title: string; rating: string; poster: SpacePosterVariant; objectPosition?: string }>;
  tracks: Array<{ id: string; title: string; artist: string; date: string; audioPreview: string }>;
  projects: SpaceEditionConfig["projects"];
  direction: SpaceEditionConfig["direction"];
}
