import { type OpenRouterProvider, createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Article } from "./news";
import { generateObject, generateText } from "ai";
import { z } from "zod";

export const getOpenRouter = (env: Env) => {
	const or = createOpenRouter({
		apiKey: env.OPENROUTER_API_KEY
	})

	return or;
}

interface Summary {
	title: string;
	description: string;
	keyPoints: {
		point: string;
		summary: string;
	}[],
	sources: string[]
}

export const generateSummary = async (env: Env, articles: Article[]): Promise<Summary> => {
	const openrouter = getOpenRouter(env);

	const prompt = `
	You are a news summarizer.

	Create a title for the entire summary and also a short description.
	Compile the following articles into multiple keypoints.
	The above articles are headlines from the same topic, but from different sources.
	Please summarize the articles into a concise and informative summary.
	The key points should be short and to the point.
	The summary should be at least 500 words long.
	Each article has a source, which is the name of the news outlet.
	Please include the sources in the summary.
	If there are no key points, please include a sentence that summarizes the article.
	If there are no sources, please include a sentence that summarizes the article.
	If there are no key points or sources, please include a sentence that summarizes the article.
	Do not include any other information in the summary.
	Articles will be separated by "==="
	Answer in JSON format. DO NOT INCLUDE ANY OTHER TEXT.
	DO NOT ANSWER ANYTHING ELSE.
	DO NOT EXPLAIN ANYTHING.
	DO NOT ADD ANYTHING OTHER THAN THE JSON OBJECT.
	`

	const { object } = await generateObject({
		model: openrouter("google/gemini-2.0-flash-exp:free"),
		schema: z.object({
			title: z.string(),
			description: z.string(),
			keyPoints: z.array(z.object({
				point: z.string(),
				summary: z.string()
			})),
		}),
		mode: "json",
		maxTokens: 1000,
		prompt: `${articles.map(article => `Source: ${article.source.name}\n\n${article.content.textContent}\n\n===\n`).join("\n\n")}\n\n${prompt}`
	})

	const summary = {
		title: object.title,
		description: object.description,
		keyPoints: object.keyPoints,
		sources: articles.map(article => article.url)
	}

	return summary;
}

export const generateSearchQuery = async (env: Env, description: string): Promise<string> => {
	const openrouter = getOpenRouter(env);

	const prompt = `
	Generate a search query, a query that would be used to search on Google, for the following description:
	${description}
	Answer only with the search query, and nothing else.
	`

	const query = await generateText({
		model: openrouter("google/gemini-2.0-flash-exp:free"),
		prompt: prompt,
		maxTokens: 100
	});

	return query.text;
}
