import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const blog = await getCollection('blog', ({ data }) => data.draft !== true);
	const movies = await getCollection('movie');
	const music = await getCollection('music');

	const items = [
		...blog.map((post) => ({
			...post.data,
			link: `/blog/${post.id.replace(/\.mdx?$/, '')}/`,
			// 可以在这里添加自定义字段区分类型
			customData: `<category>Blog</category>`
		})),
		...movies.map((post) => ({
			title: `[观影] ${post.data.title} (${post.data.rating}★)`,
			description: post.data.shortReview,
			pubDate: post.data.viewingDate, // 使用观影日期作为发布日期
			link: `/movie/${post.id.replace(/\.mdx?$/, '')}/`,
			customData: `<category>Movie</category>`
		})),
		...music.map((post) => ({
			title: `[听歌] ${post.data.title} - ${post.data.artist}`,
			description: `本月听了：${post.data.title}`,
			pubDate: post.data.pubDate,
			link: `/music/`, // 音乐目前是按月展示，可以导向音乐首页或月份页
			customData: `<category>Music</category>`
		}))
	];

	// 按时间倒序排序
	items.sort((a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf());

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: items,
	});
}