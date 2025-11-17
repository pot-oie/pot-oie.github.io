import { defineCollection, z } from 'astro:content';

// 博客内容分类枚举
const BLOG_CATEGORIES = z.enum([
	'learn', // 学习笔记
	'life', // 生活随笔
]);

const blog = defineCollection({
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			// 为了优化主页展示，生活随笔要加短标题
			shortTitle: z.string().optional(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			// 文章头图
			heroImage: image().optional(),
			// 展示图
			coverImage: image().optional(),
			// 草稿过滤
			draft: z.boolean().optional(),
			// 分类
			category: BLOG_CATEGORIES,
			// 标签
			// 可能会用上，再分类
			tags: z.array(z.string()).optional(),
		}),
});

// 电影集合
const movie = defineCollection({
    schema: ({ image }) =>
        z.object({
            title: z.string(),
			// 上映时间
            releaseDate: z.coerce.date().optional(), 
			// 观影时间 (用于排序)
            viewingDate: z.coerce.date(), 
			// 评分 0-5
            rating: z.number().min(0).max(5),
			// 海报
            coverImage: image(), 
			// 首页短评
            shortReview: z.string(), 
			// 是否有长评
			haveReview: z.boolean(),
        }),
});

// 音乐集合
const music = defineCollection({
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            artist: z.string(),
			// 封面图
            coverImage: image(), 
			// 日历上的日期
            pubDate: z.coerce.date(), 
            audioUrl: z.string().url().optional(), // 歌曲播放链接 (可选)
        }),
});

export const collections = { 
	blog, 
	movie,
	music 
};