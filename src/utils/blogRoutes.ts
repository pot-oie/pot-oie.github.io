import {
  LIFE_CATEGORY_META_LIST,
  TECH_CATEGORY_META_LIST,
} from "./blogTaxonomy";

export const BLOG_ARCHIVE_PAGE_SIZE = 12;

export type BlogArchiveRouteEntry = {
  draft?: boolean;
  category?: string;
  techCategory?: string;
  lifeCategory?: string;
};

export const BLOG_ARCHIVE_BASE_PATHS = [
  "/blog/",
  "/blog/learn/",
  "/blog/life/",
  ...TECH_CATEGORY_META_LIST.map((meta) => `/blog/learn/${meta.slug}/`),
  ...LIFE_CATEGORY_META_LIST.map((meta) => `/blog/life/${meta.slug}/`),
] as const;

export function normalizeBlogRoutePath(pathname: string): string {
  const pathOnly = pathname.split(/[?#]/, 1)[0] || "/";
  const withLeadingSlash = pathOnly.startsWith("/")
    ? pathOnly
    : `/${pathOnly}`;

  return withLeadingSlash.length > 1
    ? withLeadingSlash.replace(/\/+$/, "")
    : withLeadingSlash;
}

/**
 * Recognizes the route shapes used by generated blog archives. This structural
 * check is appropriate for an already-built search index; content validation
 * should use getPublishedBlogArchiveRoutePaths for an exact route set.
 */
export function isBlogArchiveRoutePath(pathname: string): boolean {
  const normalizedPath = normalizeBlogRoutePath(pathname);

  return BLOG_ARCHIVE_BASE_PATHS.some((basePath) => {
    const normalizedBase = normalizeBlogRoutePath(basePath);
    if (normalizedPath === normalizedBase) return true;

    const pagePrefix = `${normalizedBase}/page/`;
    if (!normalizedPath.startsWith(pagePrefix)) return false;

    const page = normalizedPath.slice(pagePrefix.length);
    return /^[1-9]\d*$/.test(page) && Number(page) >= 2;
  });
}

export function getBlogArchivePageHref(
  basePath: string,
  page: number,
): string {
  const normalizedBasePath = `/${basePath.replace(/^\/+|\/+$/g, "")}/`;
  return page === 1
    ? normalizedBasePath
    : `${normalizedBasePath}page/${page}/`;
}

export function getBlogArchivePageNumbers(
  totalItems: number,
  pageSize = BLOG_ARCHIVE_PAGE_SIZE,
): number[] {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  return Array.from({ length: totalPages }, (_, index) => index + 1);
}

export function getPublishedBlogArchiveRoutePaths(
  entries: readonly BlogArchiveRouteEntry[],
  pageSize = BLOG_ARCHIVE_PAGE_SIZE,
): Set<string> {
  const publishedEntries = entries.filter((entry) => entry.draft !== true);
  const routes = new Set<string>();

  addArchiveRoutes(routes, "/blog/", publishedEntries.length, pageSize);

  for (const category of ["learn", "life"] as const) {
    const categoryEntries = publishedEntries.filter(
      (entry) => entry.category === category,
    );
    addArchiveRoutes(
      routes,
      `/blog/${category}/`,
      categoryEntries.length,
      pageSize,
    );
  }

  for (const meta of TECH_CATEGORY_META_LIST) {
    const totalItems = publishedEntries.filter(
      (entry) =>
        entry.category === "learn" && entry.techCategory === meta.key,
    ).length;
    addArchiveRoutes(
      routes,
      `/blog/learn/${meta.slug}/`,
      totalItems,
      pageSize,
    );
  }

  for (const meta of LIFE_CATEGORY_META_LIST) {
    const totalItems = publishedEntries.filter(
      (entry) =>
        entry.category === "life" && entry.lifeCategory === meta.key,
    ).length;
    addArchiveRoutes(
      routes,
      `/blog/life/${meta.slug}/`,
      totalItems,
      pageSize,
    );
  }

  return routes;
}

function addArchiveRoutes(
  routes: Set<string>,
  basePath: string,
  totalItems: number,
  pageSize: number,
) {
  for (const page of getBlogArchivePageNumbers(totalItems, pageSize)) {
    routes.add(normalizeBlogRoutePath(getBlogArchivePageHref(basePath, page)));
  }
}
