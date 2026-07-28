import type { CollectionEntry } from "astro:content";
import {
  LIFE_CATEGORY_META_LIST,
  TECH_CATEGORY_META_LIST,
} from "./blogTaxonomy";
import type { ArchiveFilterItem } from "./archive";

export type BlogEntry = CollectionEntry<"blog">;
export type BlogArchiveCategory = "learn" | "life";

export function sortBlogPosts(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort(
    (a, b) =>
      (b.data.updatedDate ?? b.data.pubDate).valueOf() -
      (a.data.updatedDate ?? a.data.pubDate).valueOf(),
  );
}

export function getBlogRootFilters(
  posts: BlogEntry[],
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

export function getBlogCategoryFilters(
  posts: BlogEntry[],
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
