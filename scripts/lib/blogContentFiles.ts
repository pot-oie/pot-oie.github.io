import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse } from "yaml";
import {
  validateBlogIntegrity,
  type BlogIntegrityDiagnostic,
  type BlogIntegrityEntry,
  type BlogIntegritySeries,
} from "../../src/utils/blogIntegrity";
import {
  getPublishedBlogArchiveRoutePaths,
  normalizeBlogRoutePath,
} from "../../src/domain/blogRoutes";

type RawBlogData = {
  draft?: unknown;
  category?: unknown;
  lifeCategory?: unknown;
  techCategory?: unknown;
  albumTitle?: unknown;
  albumArtist?: unknown;
  tags?: unknown;
  series?: unknown;
  heroImage?: unknown;
  coverImage?: unknown;
};

type BlogSourceEntry = BlogIntegrityEntry & {
  absolutePath: string;
  body: string;
  rawData: RawBlogData;
};

export type BlogContentCheckResult = {
  entries: BlogSourceEntry[];
  diagnostics: BlogIntegrityDiagnostic[];
};

export async function checkBlogContent(
  projectRoot: string,
): Promise<BlogContentCheckResult> {
  const contentRoot = path.join(projectRoot, "src/content/blog");
  const sourcePaths = await findMdxFiles(contentRoot);
  const entries: BlogSourceEntry[] = [];
  const diagnostics: BlogIntegrityDiagnostic[] = [];

  for (const absolutePath of sourcePaths) {
    const source = await readFile(absolutePath, "utf8");
    const relativePath = toPosixPath(path.relative(projectRoot, absolutePath));
    const parsed = parseMdxSource(source);

    if (!parsed) {
      diagnostics.push({
        severity: "error",
        entryId: relativePath,
        field: "frontmatter",
        message: "无法找到有效的 --- frontmatter 区块。",
      });
      continue;
    }

    let rawData: RawBlogData;
    try {
      rawData = (parse(parsed.frontmatter) ?? {}) as RawBlogData;
    } catch (error) {
      diagnostics.push({
        severity: "error",
        entryId: relativePath,
        field: "frontmatter",
        message: `YAML 解析失败：${getErrorMessage(error)}`,
      });
      continue;
    }

    entries.push({
      id: relativePath,
      absolutePath,
      body: parsed.body,
      rawData,
      data: {
        draft: typeof rawData.draft === "boolean" ? rawData.draft : undefined,
        category: getString(rawData.category),
        lifeCategory: getString(rawData.lifeCategory),
        techCategory: getString(rawData.techCategory),
        albumTitle: getString(rawData.albumTitle),
        albumArtist: getString(rawData.albumArtist),
        tags: getStringArray(rawData.tags),
        series: getSeries(rawData.series),
      },
    });
  }

  diagnostics.push(...validateBlogIntegrity(entries));
  diagnostics.push(
    ...(await validateReferences(projectRoot, entries)),
  );

  diagnostics.sort((a, b) => {
    const severityDiff =
      Number(a.severity === "warning") - Number(b.severity === "warning");
    return (
      severityDiff ||
      a.entryId.localeCompare(b.entryId) ||
      a.field.localeCompare(b.field)
    );
  });

  return { entries, diagnostics };
}

function parseMdxSource(
  source: string,
): { frontmatter: string; body: string } | undefined {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return undefined;

  return {
    frontmatter: match[1],
    body: source.slice(match[0].length),
  };
}

async function validateReferences(
  projectRoot: string,
  entries: readonly BlogSourceEntry[],
): Promise<BlogIntegrityDiagnostic[]> {
  const diagnostics: BlogIntegrityDiagnostic[] = [];
  const publishedSlugs = new Set(
    entries
      .filter((entry) => entry.data.draft !== true)
      .map((entry) =>
        path
          .relative(path.join(projectRoot, "src/content/blog"), entry.absolutePath)
          .replace(/\.mdx?$/i, "")
          .split(path.sep)
          .join("/"),
      ),
  );
  const allSlugs = new Set(
    entries.map((entry) =>
      path
        .relative(path.join(projectRoot, "src/content/blog"), entry.absolutePath)
        .replace(/\.mdx?$/i, "")
        .split(path.sep)
        .join("/"),
    ),
  );
  const publishedArchiveRoutes = getPublishedBlogArchiveRoutePaths(
    entries.map((entry) => entry.data),
  );

  for (const entry of entries) {
    const references = [
      ...extractMarkdownReferences(entry.body),
      ...extractImportReferences(entry.body),
      ...extractFrontmatterAssetReferences(entry.rawData),
    ];

    for (const reference of references) {
      const diagnostic = await validateReference(
        projectRoot,
        entry,
        reference,
        publishedSlugs,
        allSlugs,
        publishedArchiveRoutes,
      );
      if (diagnostic) diagnostics.push(diagnostic);
    }
  }

  return diagnostics;
}

type ContentReference = {
  kind: "asset" | "link" | "import";
  target: string;
  field: string;
};

export function extractMarkdownReferences(
  body: string,
): ContentReference[] {
  const references: ContentReference[] = [];
  const pattern = /(!?)\[[^\]]*]\((<[^>]+>|[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
  const searchableBody = maskMdxComments(body);

  for (const match of searchableBody.matchAll(pattern)) {
    references.push({
      kind: match[1] === "!" ? "asset" : "link",
      target: stripAngleBrackets(match[2]),
      field: `body:${getLineNumber(searchableBody, match.index ?? 0)}`,
    });
  }

  return references;
}

function extractImportReferences(body: string): ContentReference[] {
  return [...body.matchAll(/\bfrom\s+["']([^"']+)["']/g)].map((match) => ({
    kind: "import",
    target: match[1],
    field: `body:${getLineNumber(body, match.index ?? 0)}`,
  }));
}

function extractFrontmatterAssetReferences(
  data: RawBlogData,
): ContentReference[] {
  return (["heroImage", "coverImage"] as const).flatMap((field) =>
    typeof data[field] === "string"
      ? [{ kind: "asset" as const, target: data[field], field }]
      : [],
  );
}

async function validateReference(
  projectRoot: string,
  entry: BlogSourceEntry,
  reference: ContentReference,
  publishedSlugs: ReadonlySet<string>,
  allSlugs: ReadonlySet<string>,
  publishedArchiveRoutes: ReadonlySet<string>,
): Promise<BlogIntegrityDiagnostic | undefined> {
  const target = reference.target.trim();
  if (
    !target ||
    target.startsWith("#") ||
    /^(?:https?:|mailto:|tel:|data:)/i.test(target)
  ) {
    return undefined;
  }

  const pathname = stripQueryAndHash(target);

  if (pathname === "/blog" || pathname.startsWith("/blog/")) {
    const blogTarget = pathname.slice("/blog/".length).replace(/\/+$/, "");
    const firstSegment = blogTarget.split("/")[0];

    if (firstSegment === "gif") {
      return validateFileReference(
        entry,
        reference,
        path.join(projectRoot, "public", pathname),
      );
    }

    if (publishedArchiveRoutes.has(normalizeBlogRoutePath(pathname))) {
      return undefined;
    }

    if (publishedSlugs.has(blogTarget)) {
      return undefined;
    }

    if (allSlugs.has(blogTarget)) {
      return {
        severity: "warning",
        entryId: entry.id,
        field: reference.field,
        message: `内部文章链接 "${target}" 当前指向草稿，发布前不会生成对应路由。`,
      };
    }

    return {
      severity: "error",
      entryId: entry.id,
      field: reference.field,
      message: `内部文章链接 "${target}" 没有对应的已发布博客路由。`,
    };
  }

  if (pathname.startsWith("/")) {
    const publicPath = path.join(projectRoot, "public", pathname);
    if (path.extname(pathname)) {
      return validateFileReference(entry, reference, publicPath);
    }
    return undefined;
  }

  if (!pathname.startsWith(".")) {
    return {
      severity: "warning",
      entryId: entry.id,
      field: reference.field,
      message: `相对链接 "${target}" 无法可靠映射到静态路由，请改用站点根路径或明确文件路径。`,
    };
  }

  const absoluteTarget = path.resolve(
    path.dirname(entry.absolutePath),
    pathname,
  );
  return validateFileReference(
    entry,
    reference,
    absoluteTarget,
    reference.kind === "import",
  );
}

async function validateFileReference(
  entry: BlogSourceEntry,
  reference: ContentReference,
  absoluteTarget: string,
  allowSourceExtension = false,
): Promise<BlogIntegrityDiagnostic | undefined> {
  const candidates = allowSourceExtension
    ? getSourceCandidates(absoluteTarget)
    : [absoluteTarget];

  for (const candidate of candidates) {
    if (await pathExists(candidate)) {
      return undefined;
    }
  }

  return {
    severity: entry.data.draft === true ? "warning" : "error",
    entryId: entry.id,
    field: reference.field,
    message: `${getReferenceLabel(reference.kind)} "${reference.target}" 指向的文件不存在。`,
  };
}

async function pathExists(absolutePath: string): Promise<boolean> {
  try {
    await access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function findMdxFiles(directory: string): Promise<string[]> {
  const results: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await findMdxFiles(absolutePath)));
    } else if (entry.isFile() && /\.mdx?$/i.test(entry.name)) {
      results.push(absolutePath);
    }
  }

  return results.sort();
}

function getSeries(value: unknown): BlogIntegritySeries | undefined {
  if (!isRecord(value)) return undefined;
  if (
    typeof value.key !== "string" ||
    typeof value.title !== "string" ||
    typeof value.order !== "number"
  ) {
    return undefined;
  }

  const section =
    isRecord(value.section) &&
    typeof value.section.title === "string" &&
    typeof value.section.order === "number"
      ? {
          title: value.section.title,
          order: value.section.order,
        }
      : undefined;

  return {
    key: value.key,
    title: value.title,
    order: value.order,
    section,
  };
}

function getStringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stripAngleBrackets(value: string): string {
  return value.startsWith("<") && value.endsWith(">")
    ? value.slice(1, -1)
    : value;
}

function stripQueryAndHash(value: string): string {
  return value.split(/[?#]/, 1)[0];
}

function getLineNumber(source: string, index: number): number {
  return source.slice(0, index).split(/\r?\n/).length;
}

function getReferenceLabel(kind: ContentReference["kind"]): string {
  if (kind === "link") return "链接";
  if (kind === "import") return "导入";
  return "资源";
}

function getSourceCandidates(absolutePath: string): string[] {
  if (path.extname(absolutePath)) return [absolutePath];

  const extensions = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".astro"];
  return [
    absolutePath,
    ...extensions.map((extension) => `${absolutePath}${extension}`),
    ...extensions.map((extension) =>
      path.join(absolutePath, `index${extension}`),
    ),
  ];
}

function maskMdxComments(source: string): string {
  return source.replace(/\{\/\*[\s\S]*?\*\/\}/g, (comment) =>
    comment.replace(/[^\r\n]/g, " "),
  );
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
