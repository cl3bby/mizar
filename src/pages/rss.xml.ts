import { getCollection } from "astro:content";
import rss from "@astrojs/rss";

export async function GET(context: any) {
	const blog = await getCollection("posts");
	return rss({
		title: "caleb.rocks — notes",
		description: "Notes on web design, performance and small-business websites.",
		site: context.site,
		items: blog.map((post) => ({
			title: post.data.title,
			pubDate: post.data.pubDate,
			description: post.data.description,
			// Compute RSS link from post `slug`
			link: `/blog/${post.slug}/`,
		})),
	});
}
