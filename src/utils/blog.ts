import type { CollectionEntry } from "astro:content";
import type { ArchiveFilterItem } from "./archive";
import {
  LIFE_CATEGORY_META_LIST,
  TECH_CATEGORY_META_LIST,
  type LifeCategory,
  type TechCategory,
} from "./blogTaxonomy";
import {
  BLOG_ARCHIVE_PAGE_SIZE,
  getBlogArchivePageHref,
  getBlogArchivePageNumbers,
} from "./blogRoutes";

export {
  BLOG_ARCHIVE_PAGE_SIZE,
  getBlogArchivePageHref,
  getBlogArchivePageNumbers,
} from "./blogRoutes";

export type BlogPost = CollectionEntry<"blog">;
export type BlogArchiveCategory = "learn" | "life";

export type BlogArchiveModel = {
  posts: BlogPost[];
  filters: ArchiveFilterItem[];
};

export type BlogArchivePageLink = {
  number: number;
  href: string;
  current: boolean;
};

export type BlogArchivePagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  previousHref?: string;
  nextHref?: string;
  pages: BlogArchivePageLink[];
};

export type PaginatedBlogArchiveModel = BlogArchiveModel & {
  pagination: BlogArchivePagination;
};

export type BlogSeriesItem = {
  title: string;
  subtitle?: string;
  href: string;
  order: number;
  sectionTitle?: string;
  sectionOrder?: number;
  current: boolean;
};

export type BlogSeriesSection = {
  title: string;
  order: number;
  items: BlogSeriesItem[];
};

export type BlogSeries = {
  key: string;
  title: string;
  items: BlogSeriesItem[];
  sections: BlogSeriesSection[];
};

export function getPublishedBlogPosts(
  posts: readonly BlogPost[],
): BlogPost[] {
  return posts.filter((post) => post.data.draft !== true);
}

export function getBlogPostSlug(post: BlogPost): string {
  return post.id.replace(/\.mdx?$/, "");
}

export function getBlogPostHref(post: BlogPost): string {
  return `/blog/${getBlogPostSlug(post)}/`;
}

export function getBlogPostDisplayDate(post: BlogPost): Date {
  return post.data.updatedDate ?? post.data.pubDate;
}

/**
 * Archive ordering uses the most recent visible activity: updatedDate when it
 * exists, otherwise pubDate. Equal timestamps retain their input order.
 */
export function sortBlogPostsForArchive(
  posts: readonly BlogPost[],
): BlogPost[] {
  return [...posts].sort(
    (a, b) =>
      getBlogPostDisplayDate(b).valueOf() -
      getBlogPostDisplayDate(a).valueOf(),
  );
}

/**
 * Publication ordering ignores updatedDate and sorts only by pubDate.
 * Equal timestamps retain their input order.
 */
export function sortBlogPostsByPublicationDate(
  posts: readonly BlogPost[],
): BlogPost[] {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function getBlogRootArchive(
  publishedPosts: readonly BlogPost[],
): BlogArchiveModel {
  return {
    posts: sortBlogPostsForArchive(publishedPosts),
    filters: getBlogRootFilters(publishedPosts),
  };
}

export function getBlogCategoryArchive(
  publishedPosts: readonly BlogPost[],
  category: BlogArchiveCategory,
): BlogArchiveModel {
  return {
    posts: sortBlogPostsForArchive(
      publishedPosts.filter((post) => post.data.category === category),
    ),
    filters: getBlogCategoryFilters(publishedPosts, category),
  };
}

export function getBlogTechCategoryArchive(
  publishedPosts: readonly BlogPost[],
  techCategory: TechCategory,
): BlogArchiveModel {
  return {
    posts: sortBlogPostsForArchive(
      publishedPosts.filter(
        (post) =>
          post.data.category === "learn" &&
          post.data.techCategory === techCategory,
      ),
    ),
    filters: getBlogCategoryFilters(publishedPosts, "learn"),
  };
}

export function getBlogLifeCategoryArchive(
  publishedPosts: readonly BlogPost[],
  lifeCategory: LifeCategory,
): BlogArchiveModel {
  return {
    posts: sortBlogPostsForArchive(
      publishedPosts.filter(
        (post) =>
          post.data.category === "life" &&
          post.data.lifeCategory === lifeCategory,
      ),
    ),
    filters: getBlogCategoryFilters(publishedPosts, "life"),
  };
}

export function getPaginatedBlogArchive(
  archive: BlogArchiveModel,
  currentPage: number,
  basePath: string,
  pageSize = BLOG_ARCHIVE_PAGE_SIZE,
): PaginatedBlogArchiveModel | undefined {
  const pageNumbers = getBlogArchivePageNumbers(archive.posts.length, pageSize);
  const totalPages = pageNumbers.length;

  if (
    !Number.isInteger(currentPage) ||
    currentPage < 1 ||
    currentPage > totalPages
  ) {
    return undefined;
  }

  const startIndex = (currentPage - 1) * pageSize;

  return {
    posts: archive.posts.slice(startIndex, startIndex + pageSize),
    filters: archive.filters,
    pagination: {
      currentPage,
      totalPages,
      totalItems: archive.posts.length,
      previousHref:
        currentPage > 1
          ? getBlogArchivePageHref(basePath, currentPage - 1)
          : undefined,
      nextHref:
        currentPage < totalPages
          ? getBlogArchivePageHref(basePath, currentPage + 1)
          : undefined,
      pages: pageNumbers.map((page) => ({
        number: page,
        href: getBlogArchivePageHref(basePath, page),
        current: page === currentPage,
      })),
    },
  };
}

export function getBlogSeriesForPost(
  publishedPosts: readonly BlogPost[],
  currentPost: BlogPost,
): BlogSeries | undefined {
  const currentSeries = currentPost.data.series;
  if (!currentSeries) return undefined;

  const items = publishedPosts
    .filter((post) => post.data.series?.key === currentSeries.key)
    .sort(compareSeriesPosts)
    .map<BlogSeriesItem>((post) => ({
      title: post.data.title,
      subtitle: post.data.series?.subtitle,
      href: getBlogPostHref(post),
      order: post.data.series?.order ?? 0,
      sectionTitle: post.data.series?.section?.title,
      sectionOrder: post.data.series?.section?.order,
      current: post.id === currentPost.id,
    }));

  return {
    key: currentSeries.key,
    title: currentSeries.title,
    items,
    sections: groupBlogSeriesItems(items),
  };
}

function getBlogRootFilters(
  posts: readonly BlogPost[],
): ArchiveFilterItem[] {
  return [
    {
      value: "all",
      label: "全部",
      icon: "mingcute:grid-line",
      href: "/blog/",
      count: posts.length,
    },
    {
      value: "learn",
      label: "学习",
      icon: "mingcute:book-2-line",
      href: "/blog/learn/",
      count: posts.filter((post) => post.data.category === "learn").length,
    },
    {
      value: "life",
      label: "生活",
      icon: "mingcute:quill-pen-line",
      href: "/blog/life/",
      count: posts.filter((post) => post.data.category === "life").length,
    },
  ];
}

function getBlogCategoryFilters(
  posts: readonly BlogPost[],
  category: BlogArchiveCategory,
): ArchiveFilterItem[] {
  const categoryPosts = posts.filter(
    (post) => post.data.category === category,
  );
  const metaList =
    category === "learn"
      ? TECH_CATEGORY_META_LIST
      : LIFE_CATEGORY_META_LIST;

  return [
    {
      value: "all",
      label: "全部",
      icon: "mingcute:grid-line",
      href: `/blog/${category}/`,
      count: categoryPosts.length,
    },
    ...metaList.map((meta) => ({
      value: meta.key,
      label: meta.label,
      icon: meta.icon,
      href: `/blog/${category}/${meta.slug}/`,
      count: categoryPosts.filter((post) =>
        category === "learn"
          ? post.data.techCategory === meta.key
          : post.data.lifeCategory === meta.key,
      ).length,
    })),
  ];
}

function compareSeriesPosts(a: BlogPost, b: BlogPost): number {
  const sectionOrderDiff =
    (a.data.series?.section?.order ?? Number.MAX_SAFE_INTEGER) -
    (b.data.series?.section?.order ?? Number.MAX_SAFE_INTEGER);
  if (sectionOrderDiff !== 0) return sectionOrderDiff;

  const itemOrderDiff =
    (a.data.series?.order ?? Number.MAX_SAFE_INTEGER) -
    (b.data.series?.order ?? Number.MAX_SAFE_INTEGER);
  if (itemOrderDiff !== 0) return itemOrderDiff;

  return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
}

function groupBlogSeriesItems(
  items: readonly BlogSeriesItem[],
): BlogSeriesSection[] {
  return items.reduce<BlogSeriesSection[]>((sections, item) => {
    const title = item.sectionTitle?.trim() || "未分组";
    const existingSection = sections.find((section) => section.title === title);

    if (existingSection) {
      existingSection.items.push(item);
      return sections;
    }

    sections.push({
      title,
      order: item.sectionOrder ?? Number.MAX_SAFE_INTEGER,
      items: [item],
    });
    return sections;
  }, []);
}
