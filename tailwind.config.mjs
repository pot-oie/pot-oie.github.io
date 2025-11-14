// tailwind.config.mjs

/** @type {import('tailwindcss').Config} */
export default {
  // 这是最关键的部分：告诉 Tailwind 去哪里查找类名
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
  ],
  
  darkMode: 'class',

  // theme.extend 仍然是扩展调色板（如添加 'primary'）的推荐方式
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
    },
  },
  plugins: [],
}