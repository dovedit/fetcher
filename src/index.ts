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
	await Promise.all(articlesMetadata.map(async (articleMetadata) => {
		const article = await getArticle(articleMetadata);
		articles.push(article);
	}));

	const summary = await generateSummary(env, articles);

	console.log(articles);
	console.log(summary);

	const content = `
		${summary.keyPoints.map((keyPoint, idx) =>
			`* ${keyPoint.point} &middot; ${keyPoint.summary}`
		)}
	`

	// Put it into the database
	const sqlQuery = `
		INSERT INTO articles (title, description, slug, content, ai_generated, sources)
		values (?, ?, ?, ?, ?, ?)
	`
	await env.DB.prepare(sqlQuery)
		.bind(
			summary.title,
			summary.description,
			summary.title.toLowerCase().replaceAll(" ", "-"),
			content,
			1,
			`json([${articles.map(article => `'${article.url}'`).join(",")}])`
		)
		.run();
}

export default {
	async fetch(req, env): Promise<Response> {
		if (new URL(req.url).pathname === '/ping') {
			return new Response('Pong!');
		} else if (new URL(req.url).pathname === '/__fetch') {
			await executeFetch(env);
			return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
		} else {
			return new Response(JSON.stringify({ status: "not found" }), { status: 404 });
		}
	},
	async scheduled(_, env, ctx): Promise<void> {
		ctx.waitUntil(executeFetch(env))
	}
} satisfies ExportedHandler<Env>;
