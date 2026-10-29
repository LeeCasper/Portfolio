import { siteConfig } from "@/config/site.js";
import { apiClient } from "@/lib/apiClient";
import rss from "@astrojs/rss";

/**
 * RSS 与页面使用同一个数据源（后端 BlogPost），
 * 不再读取 src/content/post 下的 Markdown 集合——两套内容此前已经各自漂移。
 */
export async function GET(context) {
	let posts = [];
	try {
		posts = await apiClient.fetchBlogPosts();
	} catch {
		// 后端不可用时输出空订阅源，而不是让 /rss.xml 直接 500
		posts = [];
	}

	return rss({
		title: siteConfig.meta.title,
		description: siteConfig.meta.description,
		site: context.site,
		items: posts.map((post) => ({
			title: post.title,
			pubDate: new Date(post.publishDate),
			description: post.summary || "",
			link: `/blog/${post.slug}/`,
		})),
	});
}
