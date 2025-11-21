// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  site: 'https://pot-oie.github.io',

  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      defaultColor: false,
    },
  },

  integrations: [
    mdx(),
    sitemap(),
    icon()
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  // icon 配置
  // mingcute, fa-solid, fa-regular
});