# Pot's Blog

语言：中文 | [English](README.en.md)

Pot's Blog 是一个基于 Astro 的个人内容站点，用来记录技术文章、生活随笔、观影清单和音乐记录。站点采用“现代水墨”视觉系统：以墨色灰阶作为主体，用朱红作为交互和强调色。

## 预览

### 首页

| 亮色模式 | 暗色模式 |
| --- | --- |
| ![首页亮色模式](image/readme-home-light.webp) | ![首页暗色模式](image/readme-home-dark.webp) |

| 最近在看 | 最近在听 |
| --- | --- |
| ![首页电影模块](image/readme-home-movie.webp) | ![首页音乐模块](image/readme-home-music.webp) |

### 内容模块

| 学习列表 | 生活列表 |
| --- | --- |
| ![学习列表](image/readme-blog-learn.webp) | ![生活列表](image/readme-blog-life.webp) |

| 电影列表 | 音乐日历 |
| --- | --- |
| ![电影列表](image/readme-movie-list.webp) | ![音乐日历](image/readme-music-calendar.webp) |

| 关于页 |
| --- |
| ![关于页](image/readme-about.webp) |

## 功能

- 博客归档：技术学习、生活记录、专辑鉴赏、电影长评。
- 观影清单：电影卡片、评分展示、Grid 和 Scroll 视图。
- 音乐记录：最近在听、音乐日历、专辑和单曲记录。
- 全站搜索：基于 Pagefind 的静态搜索。
- 阅读体验：MDX、目录、数学公式、定制代码块、暗色模式。
- 交互增强：Lenis 平滑滚动、Astro View Transitions、全局音频播放器。
- 响应式适配：主要页面和内容模块已针对移动端阅读与浏览做适配。

## 功能细节

| 博客正文 | 代码块 |
| --- | --- |
| ![博客正文](image/readme-post-detail.webp) | ![博客代码块](image/readme-code-block.webp) |

| MDX 内嵌组件 | 搜索界面 |
| --- | --- |
| ![博客内嵌组件](image/readme-mdx-component.webp) | ![搜索界面](image/readme-search.webp) |

| 专辑正文 | 电影正文 |
| --- | --- |
| ![专辑正文](image/readme-album-detail.webp) | ![电影正文](image/readme-movie-detail.webp) |

## 技术栈

- Astro 5
- Tailwind CSS v4
- Astro Content Collections
- MDX 和 YAML 内容源
- Pagefind
- `astro-icon` 和 Iconify 图标集
- Lenis

## 快速开始

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
npm run preview
```

内容脚本：

```bash
npm run new
npm run update
npm run album
```

## 项目文档

- 协作入口：[AGENTS.md](AGENTS.md)
- 项目文档索引：[docs/project/README.md](docs/project/README.md)
- 架构：[docs/project/architecture.md](docs/project/architecture.md)
- 路由：[docs/project/routing.md](docs/project/routing.md)
- 内容模型：[docs/project/content-model.md](docs/project/content-model.md)
- 样式系统：[docs/project/styling.md](docs/project/styling.md)
- 组件：[docs/project/components.md](docs/project/components.md)
- 交互：[docs/project/interaction.md](docs/project/interaction.md)

## 目录结构

```text
src/
  assets/      构建期图片和内容资源
  components/  可复用 UI 与文章演示组件
  content/     博客、电影、音乐内容集合
  layouts/     页面与文章布局
  pages/       Astro 路由
  styles/      全局样式与 Markdown 样式
  utils/       分类、标签、日历等工具函数
docs/project/  项目知识库
scripts/       内容自动化脚本
public/        原样透传的静态资源
```
