import { generateSearchQuery, generateSummary } from "./lib/llm";
import { Article, getArticle, getHeadlines } from "./lib/news";

const executeFetch = async (env: Env) => {
	const [articleMetadata] = await getHeadlines(env, {
		maxResults: 1,
		category: "general",
		country: "ro",
		lang: "ro",
	});

	const searchQuery = await generateSearchQuery(env, articleMetadata.description);

	const articlesMetadata = await getHeadlines(env, {
		maxResults: 5,
		category: "general",
		country: "ro",
		lang: "ro",
		searchQuery: searchQuery
	});

	let articles: Article[] = [];
	for (const articleMetadata of articlesMetadata) {
		articles.push(await getArticle(articleMetadata));
	}

	const summary = await generateSummary(env, articles);

	console.log(articles);
	console.log(summary);
}

export default {
	async fetch(req, env): Promise<Response> {
		if (new URL(req.url).pathname === '/ping') {
			return new Response('Pong!');
		} else if (new URL(req.url).pathname === '/fetch') {
			await executeFetch(env);
			return new Response(null, { status: 200 });
		} else {
			return new Response(null, { status: 404 });
		}
	},
	async scheduled(_, env, ctx): Promise<void> {
		ctx.waitUntil(executeFetch(env))
	}
} satisfies ExportedHandler<Env>;
