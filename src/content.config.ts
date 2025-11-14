import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 博客内容分类枚举
const CATEGORIES = z.enum([
	'Tech', // 技术
	'Life', // 生活
	'Movie', // 电影
	'Music', // 音乐
]);

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
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
			category: CATEGORIES,
			// 标签
			// 可能会用上，再分类
			tags: z.array(z.string()).optional(),
		}),
});

export const collections = { blog };
