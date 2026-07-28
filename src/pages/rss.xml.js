import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context) {
	const blog = await getCollection('blog', ({ data }) => data.draft !== true);
	const watches = await getCollection('watch');
	const music = await getCollection('music');

	const items = [
		...blog.map((post) => ({
			...post.data,
			link: `/blog/${post.id.replace(/\.mdx?$/, '')}/`,
			// 可以在这里添加自定义字段区分类型
			customData: `<category>Blog</category>`
		})),
		...watches.map((post) => ({
			title: `[观影] ${post.data.title}`,
			description: post.data.shortReview,
			pubDate: post.data.finishedDate ?? post.data.releaseDate,
			link: post.data.mediaType === 'series'
				? `/watch/series/${post.id.replace(/\.(yaml|yml|json)$/i, '')}/`
				: `/watch/movie/`,
			customData: `<category>Watch</category>`
		})).filter((post) => post.pubDate),
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
