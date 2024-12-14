import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { Article, ArticleMetadata } from "./news";

export interface ArticleContent {
	content: string;
	textContent: string;
}

export const readUrl = async (url: string): Promise<ArticleContent> => {
	let fetchedPage: Response;
	try {
		fetchedPage = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "text/html",
				Accept: "text/html"
			}
		})
	} catch (error) {
		throw new Error(`Failed to fetch page: ${error}`);
	}

	const parsedPage = parseHTML(await fetchedPage.text());


	const article = new Readability(parsedPage.document, {
		keepClasses: false,
		disableJSONLD: true
	}).parse();

	if (!article) throw new Error("No content found");

	return {
		content: article.content,
		textContent: article.textContent
	};
}
