import { ArticleContent, readUrl } from "./read";

interface GetHeadlinesOptions {
	category?: "general";
	country?: "ro";
	lang?: "ro";
	maxResults?: number;
	searchQuery?: string;
}

export interface ArticleMetadata {
	title: string;
	description: string;
	url: string;
	image: string;
	source: {
		name: string;
		url: string;
	}
}

export interface Article extends ArticleMetadata {
	content: ArticleContent;
}

export const getHeadlines = async (env: Env, options?: GetHeadlinesOptions): Promise<ArticleMetadata[]> => {
	const url = new URL("https://gnews.io/api/v4/top-headlines");
	const key = env.GNEWS_API_KEY;

	const category = options?.category || "general";
	const country = options?.country || "ro";
	const lang = options?.lang || "ro";
	const maxResults = options?.maxResults || 10;
	const searchQuery = options?.searchQuery;


	url.searchParams.append("apikey", key);
	url.searchParams.append("category", category);
	url.searchParams.append("country", country);
	url.searchParams.append("lang", lang);
	url.searchParams.append("max", maxResults.toString());
	if (searchQuery) url.searchParams.append("q", searchQuery);

	try {
		const res = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json"
			}
		})

		const data: { articles: Article[] } = await res.json();

		if (!data.articles) throw new Error("No articles found");

		return data.articles.map((article: Article) => ({
			title: article.title,
			description: article.description,
			url: article.url,
			image: article.image,
			source: {
				name: article.source.name,
				url: article.source.url
			}
		}));
	} catch (error) {
		throw new Error(`Failed to fetch headlines: ${error}`);
	}
}

export const getArticle = async (articleMetadata: ArticleMetadata): Promise<Article> => {
	const content = await readUrl(articleMetadata.url);

	return {
		...articleMetadata,
		content
	}
}
