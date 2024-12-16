import { generateSearchQuery, generateSummary } from "./lib/llm";
import { Article, getArticle, getHeadlines } from "./lib/news";

const executeFetch = async (env: Env) => {
	const articlesMetadata = await getHeadlines(env, {
		maxResults: 3,
		category: "general",
		country: "ro",
		lang: "ro",
	});

	let articles = await Promise.all(articlesMetadata.map((articleMetadata) => getArticle(articleMetadata)));
	const summary = await generateSummary(env, articles);

	const content = `
		${summary.subjects.map((subject) =>
			`## ${subject.name}\n` +
			subject.keyPoints.map((keyPoint) => (
				`* ${keyPoint.point} &middot; ${keyPoint.summary}`
			)).join("\n")
		).join("\n\n")}
	`

	console.log(articles);
	console.log(summary);
	console.log(content);

	const date = new Date().toLocaleDateString("ro-RO", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	})
	// Put it into the database
	const sqlQuery = `
		INSERT INTO articles (title, description, slug, content, ai_generated, sources)
		values (?, ?, ?, ?, ?, ?)
	`
	env.DB.prepare(sqlQuery)
		.bind(
			`News of ${date}`,
			summary.description,
			date.toLowerCase()
				.replaceAll(" ", "-")
				.replaceAll("/", "-")
				.replaceAll(":", "-"),
			content,
			1,
			`[${articles.map(article => `'${article.url}'`).join(",")}]`
		)
		.run();
}

export default {
	async fetch(req, env): Promise<Response> {
		if (new URL(req.url).pathname === '/ping') {
			return new Response('Pong!');
		// @ts-ignore: TEST is not defined in the type definitions, but is required for testing
		} else if (new URL(req.url).pathname === '/__fetch' && env.TEST) {
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
