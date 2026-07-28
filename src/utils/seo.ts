import type { ImageMetadata } from "astro";
import { SITE_AUTHOR, SITE_TITLE } from "../consts";

export const DEFAULT_SOCIAL_IMAGE_PATH = "/og.png";

export type SeoImage = ImageMetadata | string;

export type BreadcrumbAncestor = {
  name: string;
  href: string;
};

export type ArticleSeo = {
  publishedTime: Date;
  modifiedTime?: Date;
  section?: string;
  tags?: string[];
  breadcrumbs?: BreadcrumbAncestor[];
};

export type ResolvedSeoImage = {
  url: string;
  width?: number;
  height?: number;
  contentType?: string;
};

export function formatArticleDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}T00:00:00+08:00`;
}

type ArticleStructuredDataInput = {
  site: URL;
  canonicalURL: URL;
  title: string;
  description: string;
  imageURL: string;
  article: ArticleSeo;
};

const IMAGE_CONTENT_TYPES: Partial<
  Record<ImageMetadata["format"], string>
> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  tiff: "image/tiff",
  webp: "image/webp",
};

export function resolveSeoImage(
  image: SeoImage | undefined,
  site: URL,
): ResolvedSeoImage {
  const resolvedImage = image ?? DEFAULT_SOCIAL_IMAGE_PATH;

  if (typeof resolvedImage === "string") {
    const isDefaultImage = resolvedImage === DEFAULT_SOCIAL_IMAGE_PATH;

    return {
      url: new URL(resolvedImage, site).href,
      width: isDefaultImage ? 1200 : undefined,
      height: isDefaultImage ? 630 : undefined,
      contentType: isDefaultImage ? "image/png" : undefined,
    };
  }

  return {
    url: new URL(resolvedImage.src, site).href,
    width: resolvedImage.width,
    height: resolvedImage.height,
    contentType: IMAGE_CONTENT_TYPES[resolvedImage.format],
  };
}

export function buildArticleStructuredData({
  site,
  canonicalURL,
  title,
  description,
  imageURL,
  article,
}: ArticleStructuredDataInput) {
  const siteRoot = new URL("/", site).href;
  const blogRoot = new URL("/blog/", site).href;
  const modifiedTime = article.modifiedTime ?? article.publishedTime;
  const breadcrumbItems = [
    { name: "首页", url: siteRoot },
    ...(article.breadcrumbs ?? []).map((item) => ({
      name: item.name,
      url: new URL(item.href, site).href,
    })),
    { name: title, url: canonicalURL.href },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonicalURL.href}#blog-posting`,
        headline: title,
        description,
        url: canonicalURL.href,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalURL.href,
        },
        image: [imageURL],
        datePublished: formatArticleDate(article.publishedTime),
        dateModified: formatArticleDate(modifiedTime),
        articleSection: article.section,
        keywords: article.tags?.length ? article.tags : undefined,
        inLanguage: "zh-CN",
        author: {
          "@type": "Person",
          name: SITE_AUTHOR,
          url: siteRoot,
        },
        publisher: {
          "@type": "Person",
          name: SITE_AUTHOR,
          url: siteRoot,
        },
        isPartOf: {
          "@type": "Blog",
          name: SITE_TITLE,
          url: blogRoot,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalURL.href}#breadcrumb`,
        itemListElement: breadcrumbItems.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
    ],
  };
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
