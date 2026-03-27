# ARCHITECTURE

## 1. 项目概述

本项目是一个基于 **Astro v5** 构建的静态内容站点，定位为个人博客与内容展示平台，包含技术文章、观影记录、音乐记录等内容模块。

核心技术栈如下：

- 框架：Astro 5（文件路由 + 静态站点生成）
- 内容系统：Astro Content Collections（MDX + YAML）
- 样式方案：Tailwind CSS v4（通过 Vite 插件 `@tailwindcss/vite` 集成）
- Markdown/MDX：`@astrojs/mdx`
- SEO 与站点能力：`@astrojs/sitemap`、`@astrojs/rss`
- 搜索：Pagefind（构建后生成搜索索引）
- 图标：`astro-icon` + Iconify 图标集
- 交互增强：Lenis（平滑滚动）等

常用开发命令（见 `package.json`）：

- `npm run dev`：本地开发
- `npm run build`：生产构建（含 Pagefind 索引）
- `npm run preview`：本地预览构建产物
- `npm run new`：运行内容创建脚本
- `npm run update`：运行音乐数据更新脚本

---

## 2. 核心目录结构

以下为项目中最关键目录的职责说明（按“职责 / 输入 / 输出 / 依赖关系”拆解）：

### 根目录

- `src/`
  - 职责：站点核心源码目录，承载路由、布局、组件、内容 schema、样式与工具逻辑。
  - 输入：内容文件、配置常量、静态资源引用。
  - 输出：Astro 构建期页面与静态资产。

- `public/`
  - 职责：直接透传目录，不经过打包处理。
  - 输入：`robots.txt`、字体文件、公开文档等。
  - 输出：构建后保持原路径可访问（例如 `/robots.txt`）。

- `scripts/`
  - 职责：内容生产自动化脚本。
  - 输入：命令行参数、模板、外部数据源（如音乐更新源）。
  - 输出：内容文件或数据文件的创建/更新。

- `docs/`
  - 职责：项目内部说明文档与约定文档。
  - 输出：面向维护者的规则说明，不直接参与站点构建。

- `image/`
  - 职责：README 等项目文档配图。
  - 输出：仓库文档展示资产，不属于线上页面主要资源路径。

### src 目录

- `src/pages/`：**路由入口层（Route Layer）**
  - 职责：按 Astro 文件路由生成页面入口，并组装布局 + 组件 + 数据。
  - 当前结构：`index.astro`、`about.astro`、`dashboard.astro`、`404.astro`、`rss.xml.js`，以及 `blog/`、`movie/`、`music/` 子路由。
  - 输入：`src/content/*` 内容数据、`src/layouts/*` 布局、`src/components/*` 组件。
  - 输出：对应 URL 页面与 feed（如 RSS）。

- `src/components/`：**组件层（Component Layer）**
  - 职责：沉淀可复用 UI 与交互单元，避免页面重复实现。
  - 典型组件分组：
    - 导航与框架：`Header.astro`、`Footer.astro`、`BaseHead.astro`
    - 卡片与列表：`PostCard*.astro`、`MovieCard.astro`、`MusicCard.astro`
    - 交互能力：`Search.astro`、`TableOfContents.astro`、`QRCodeTooltip.astro`
    - 垂直业务组件：`src/components/blog/amazon/` 等
  - 输入：父页面/布局传入的 props、内容集合数据。
  - 输出：可组合的 Astro 组件片段。

- `src/layouts/`：**布局层（Layout Layer）**
  - 职责：定义页面级结构骨架（`head`、主内容容器、底部区域、元信息注入）。
  - 当前布局：`BaseLayout.astro`、`TechPost.astro`、`LifePost.astro`、`MoviePost.astro`。
  - 依赖关系：被 `src/pages/*` 调用，内部再组合 `src/components/*`。
  - 设计意义：把“页面骨架”与“页面内容”分离，便于统一改版。

- `src/content/`：**内容数据层（Content Layer）**
  - 职责：存放由 Content Collections 管理的源内容。
  - 当前集合：
    - `src/content/blog/`：技术/生活文章（MDX）
    - `src/content/movie/`：观影内容（MDX）
    - `src/content/music/`：音乐记录（YAML）
  - 输入：作者维护的 MDX/YAML 文件。
  - 输出：构建期可类型化读取的数据对象（供页面与组件消费）。
  - 配置协同：由 `src/content.config.ts` 统一定义 schema 和字段约束。

- `src/styles/`：**样式层（Style Layer）**
  - 职责：集中定义全局视觉规范与内容渲染样式。
  - 当前文件：`global.css`（全局样式变量/基础样式）、`markdown.css`（文章内容排版样式）。
  - 依赖关系：通常由布局或页面入口统一引入。

- `src/utils/`：**领域工具层（Utility Layer）**
  - 职责：封装与 UI 无关的数据处理逻辑。
  - 当前文件：`calendar.ts`（日历相关计算）、`blogTaxonomy.ts`（博客分类/标签逻辑）。
  - 输出：被页面、组件或脚本复用的纯函数能力。

- `src/assets/`：**构建资源层（Asset Layer）**
  - 职责：存放会被源码直接 import 的图片资源。
  - 当前可见结构：`blog/`、`movie/`、`music/` 等素材目录。
  - 输出：由构建工具处理后的优化资源（哈希命名、压缩、按需加载）。

其他辅助文件：

- `src/consts.ts`：项目常量集中定义。
- `src/env.d.ts`：环境与类型声明补充。

---

## 3. 关键配置文件说明

### `astro.config.mjs`

项目核心运行配置，主要负责：

- 配置站点地址 `site`（用于 sitemap/rss 等绝对 URL 场景）。
- 配置 Markdown/Shiki 代码高亮主题（亮/暗主题与颜色策略）。
- 挂载 Astro 集成：
  ## 4. TODO 待办清单（留空模板）
  - `@astrojs/sitemap`：生成站点地图（并过滤 `/dashboard`）
  > 说明：以下模板按「优先级 + 截止日期 + 验收标准」组织，便于直接进入迭代管理。
- 在 `vite.plugins` 中启用 `@tailwindcss/vite`，接入 Tailwind CSS v4。
  ### P0（高优先级）
### `package.json`

    - 类型（功能/性能/体验/工程）：
    - 负责人：
    - 截止日期：
- 声明运行与构建命令（`dev/build/preview`）。
    - 关联文件：
    - 风险备注：
- 维护运行时依赖与开发依赖（Astro、Tailwind、Pagefind、脚本工具链等）。

    - 类型（功能/性能/体验/工程）：
    - 负责人：
    - 截止日期：
TypeScript 配置文件，用于：
    - 关联文件：
    - 风险备注：
- 约束 TS/JS 的类型检查行为。
  ### P1（中优先级）
- 与 Astro 类型系统配合，提升开发期错误发现能力。

    - 类型（功能/性能/体验/工程）：
    - 负责人：
    - 截止日期：
Content Collections 的配置入口，负责：
    - 关联文件：
    - 风险备注：
- 定义各内容集合（blog/movie/music 等）的 schema。
- 统一前置字段（如标题、日期、标签、评分等）的类型校验。
    - 类型（功能/性能/体验/工程）：
    - 负责人：
    - 截止日期：
### Tailwind 配置说明
    - 关联文件：
    - 风险备注：
该项目采用 **Tailwind CSS v4 + Vite 插件模式**，核心接入点在 `astro.config.mjs` 中的 `vite.plugins`。当前项目中未看到独立的 `tailwind.config.*` 文件，这属于 v4 常见用法之一。
  ### P2（低优先级 / 优化项）
---

    - 类型（功能/性能/体验/工程）：
    - 负责人：
    - 截止日期：
> 说明：以下清单保留为空白结构，便于后续持续维护。建议按“模块 + 优先级 + 验收标准”记录。
    - 关联文件：
    - 风险备注：

- [ ] 事项：
  - 模块：
  - 优先级：
  - 验收标准：
  - 备注：

### 工程与质量

- [ ] 事项：
  - 模块：
  - 优先级：
  - 验收标准：
  - 备注：

- [ ] 事项：
  - 模块：
  - 优先级：
  - 验收标准：
  - 备注：

### 部署与运维

- [ ] 事项：
  - 模块：
  - 优先级：
  - 验收标准：
  - 备注：

---

## 附：新成员上手建议（可选）

1. 先执行 `npm install && npm run dev`，确认本地可运行。
2. 阅读 `src/pages` 了解路由，再看 `src/layouts` 理解页面骨架。
3. 阅读 `src/content.config.ts` 与 `src/content/*`，掌握内容组织方式。
4. 修改样式优先从 `src/styles/global.css` 与组件局部样式入手。
5. 新增能力时，先在本文档 TODO 登记需求与验收标准。