# Pot's Blog (Ink Style Astro Blog)

这是一个基于 **Astro v5** 和 **Tailwind CSS v4** 构建的个人博客项目。

项目采用了独特的“墨色系统”设计语言，旨在提供一种现代东方美学的阅读体验，同时集成了音乐日历、观影记录等个性化功能模块。

## ✨ 特性 (Features)

### 🎨 视觉与设计

- **墨色系统 (Ink System)**: 精心调配的明暗主题。亮色模式下如纸上墨迹（焦墨/浓墨/淡墨），暗色模式下呈现深邃质感，辅以“朱红”印章色作为点睛之笔。
  ![明暗模式对比-light](image/index-head-light.png)
  ![明暗模式对比-dark](image/index-head-dark.png)
- **macOS 风格代码块**: 高度定制的 Shiki 代码块，模拟 macOS 窗口样式，集成行号显示、复制按钮及折叠功能。
- **噪点材质**: 全局叠加柔和的噪点纹理，增加页面的质感与厚度。

![music](image/index-music.png)
![index-movie](image/index-movie.png)
![movie](image/movie-list.png)

### 🧩 功能模块

- **音乐日历 (Music Calendar)**: 以月历形式展示每日听歌记录，支持专辑封面网格展示。
  ![音乐日历](image/music-calendar.png)
- **观影记录 (Cinema Records)**: 提供 **Grid（网格）** 和 **Scroll（横向卷轴）** 两种视图切换，带交互式评分印章与海报动效。
  ![grid](image/index-movie.png)
- **全局搜索**: 集成 **Pagefind**，提供快速、精准的静态全站搜索体验。
  ![search](image/search.png)
- **平滑体验**: 集成 **Lenis** 实现平滑滚动，并结合 Astro 的 **View Transitions** 实现无缝页面切换。

## 🛠️ 技术栈 (Tech Stack)

- **核心框架**: [Astro v5](https://astro.build/)
- **样式库**: [Tailwind CSS v4](https://tailwindcss.com/) (Vite 插件版)
- **内容驱动**: Astro Content Collections (MDX, YAML)
- **图标库**: Astro Icon + MingCute / Tabler
- **搜索**: Pagefind
- **动画与交互**: Lenis (平滑滚动), View Transitions

## 🚀 快速开始 (Getting Started)

1.  **安装依赖**:

    ```bash
    npm install
    ```

2.  **启动开发服务器**:

    ```bash
    npm run dev
    ```

3.  **构建生产版本** (包含搜索索引生成):
    ```bash
    npm run build
    ```

## ✅ 待办清单 (ToDo List)

### 📱 移动端适配与交互

- [ ] **移动端导航**: 添加 Header 汉堡菜单 (Hamburger Menu)，解决移动端无法访问导航链接的问题。
- [ ] **响应式优化**: 优化 iPhone SE 等小屏设备下的电影海报 Grid 显示 (如 `xs:grid-cols-1`)。

### 🔧 功能增强

- [ ] **文章目录 (TOC)**: 为长文章（特别是技术笔记）添加侧边或顶部的悬浮目录，提升阅读体验。
- [ ] **评论系统**: 接入 Giscus 或 Waline，增加博客互动性。
- [ ] **RSS 扩展**: 将电影 (Movie) 和音乐 (Music) 更新加入 RSS Feed，或生成独立的 Feed 源。

### ⚡️ 工程与 SEO

- [ ] **SEO 增强**: 为影评和文章页面添加 Schema.org (JSON-LD) 结构化数据。
- [ ] **性能优化**: 修复 View Transitions 切换时 Lenis 实例未销毁导致的潜在内存泄漏与滚动加速问题。
- [ ] **资源优化**: 为列表页大图添加 `loading="lazy"` 及质量压缩参数。

## 📂 目录结构

```text
src/
├── assets/        # 静态资源 (图片、字体)
├── components/    # 通用组件 (Header, Footer, Search, Cards...)
├── content/       # 内容集合 (Blog MDX, Movie MDX, Music YAML)
├── layouts/       # 页面布局 (BaseLayout, BlogPost, MoviePost)
├── pages/         # 路由页面
└── styles/        # 全局样式 (Tailwind @theme 配置)
```
