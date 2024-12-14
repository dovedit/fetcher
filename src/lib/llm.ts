import { type OpenRouterProvider, createOpenRouter } from "@openrouter/ai-sdk-provider"
import { Article } from "./news";
import { generateObject } from "ai";
import { z } from "zod";

export const getOpenRouter = (env: Env) => {
	const or = createOpenRouter({
		apiKey: env.OPENROUTER_API_KEY
	})

	return or;
}

interface Summary {
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
		model: openrouter("meta-llama/llama-3.1-70b-instruct:free"),
		schema: z.object({
			keyPoints: z.array(z.object({
				point: z.string(),
				summary: z.string()
			})),
		}),
		mode: "json",
		prompt: `${articles.map(article => `Source: ${article.source.name}\n\n${article.content.textContent}\n\n===\n`).join("\n\n")}\n\n${prompt}`
	})

	const summary = {
		keyPoints: object.keyPoints,
		sources: articles.map(article => article.url)
	}

	return summary;
}
