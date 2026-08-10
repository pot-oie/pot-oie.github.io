// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

/** @param {string} page */
export function shouldIncludeInSitemap(page) {
  const pathname = new URL(page, 'https://passpot.cn').pathname.replace(/\/+$/, '') || '/';
  return !pathname.startsWith('/dashboard') && pathname !== '/space/2026';
}

// https://astro.build/config
export default defineConfig({
  site: 'https://passpot.cn',

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },

  integrations: [
    mdx(),
    sitemap({
      filter: shouldIncludeInSitemap,
    }),
    icon()
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // icon 配置
  // mingcute, fa-solid, fa-regular
});
