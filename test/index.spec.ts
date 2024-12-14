// test/index.spec.ts
import { env, createExecutionContext, waitOnExecutionContext, SELF } from "cloudflare:test";
import { describe, it, expect } from "vitest";

import { Article, getHeadlines } from "../src/lib/news";
import { readUrl } from "../src/lib/read";
import { generateSummary } from "../src/lib/llm";

describe("Worker", () => {
	it ('responds with "Pong!"', async () => {
		const response = await SELF.fetch("http://localhost/ping");
		expect(await response.text()).toMatchInlineSnapshot(`"Pong!"`)
	})
});

describe("News fetching", () => {
	it("returns headlines", async () => {
		const headlines = await getHeadlines(env as Env);
		expect(headlines).toHaveLength(10);
		headlines.map(headline => expect(headline).toHaveProperty("title"));
	})
})

describe("Article reading", () => {
	it("returns article content", async () => {
		const content = await readUrl("https://example.com");
		expect(content).toHaveProperty("content");
		expect(content.content).toContain("<p>");
		expect(content).toHaveProperty("textContent");
		expect(content.textContent).toContain("This domain is for use in illustrative examples in documents")
	})
})

describe("LLM", () => {
	it("generates a summary", async () => {
		const mockArticle: Article = {
			title: "This is a test article",
			description: "This is a test description",
			url: "https://example.com",
			image: "https://example.com/image.png",
			source: {
				name: "Example",
				url: "https://example.com"
			},
			content: {
				content: "This is the content",
				textContent: "AI Progress Accelerates, Raising Both Hope and Concerns for Society's Future\n\nBy Claude Anderson\nTechnology Correspondent\nDecember 14, 2024\n\nIn a remarkable year of artificial intelligence developments, researchers and tech companies continue to push the boundaries of what AI systems can achieve, while simultaneously grappling with growing concerns about their impact on society and the workforce.\n\nRecent breakthroughs in multimodal AI systems—which can process text, images, and audio simultaneously—have demonstrated capabilities that seemed like science fiction just a few years ago. These systems can now generate photorealistic images from text descriptions, write complex computer code, and engage in sophisticated reasoning tasks that approach human-level performance in some domains.\n\n\"We're witnessing an unprecedented acceleration in AI capabilities,\" says Dr. Sarah Chen, director of the Institute for AI Safety at Stanford University. \"The systems we're developing today can handle increasingly complex tasks with a level of nuance and understanding that surprises even those of us in the field.\"\n\nHowever, this rapid progress has also intensified debates about AI's impact on employment, privacy, and social inequality. A recent study by the McKinsey Global Institute estimates that up to 30% of work hours across the global economy could be automated by existing AI technologies by 2030, potentially affecting hundreds of millions of jobs worldwide.\n\nThe healthcare sector has emerged as a particularly promising area for AI applications. At Massachusetts General Hospital, AI systems are now assisting radiologists in detecting early signs of cancer, with initial results showing accuracy rates that match or exceed human experts in some cases.\n\n\"AI isn't replacing doctors, but it's becoming an invaluable tool in our diagnostic arsenal,\" explains Dr. Michael Rodriguez, chief of radiology at Mass General. \"We're seeing fewer missed diagnoses and faster turnaround times for patient results, which ultimately means better care for our patients.\"\n\nEducation is another sector experiencing significant AI-driven transformation. School districts across the country are piloting AI-powered tutoring systems that provide personalized learning experiences for students. Early results from a pilot program in Chicago public schools show promising improvements in math and reading scores, particularly among struggling students.\n\nHowever, critics warn about the potential downsides of increasing AI integration in education. \"We need to be careful about maintaining the human element in education,\" argues Maria Thompson, president of the National Education Association. \"While AI can be a powerful tool for learning, it shouldn't replace the critical role that teachers play in students' social and emotional development.\"\n\nPrivacy advocates have raised additional concerns about the vast amounts of personal data being collected and processed by AI systems. The Electronic Frontier Foundation recently published a report highlighting potential risks in the way AI companies handle personal information, calling for stronger regulatory oversight and transparency requirements.\n\nIn response to these concerns, several major tech companies have announced new initiatives focused on responsible AI development. Google, Microsoft, and OpenAI have established ethics boards and implemented new guidelines for AI development, though some critics argue these self-regulatory measures don't go far enough.\n\nThe regulatory landscape is also evolving rapidly. The European Union's AI Act, set to take effect next year, will establish comprehensive rules for AI development and deployment, potentially setting a global standard for AI regulation. In the United States, several states have passed their own AI-related legislation, while federal lawmakers continue to debate national standards.\n\nLooking ahead, experts predict AI will continue to advance rapidly while society grapples with its implications. \"We're in the midst of a technological revolution that will reshape virtually every aspect of our lives,\" says Dr. Chen. \"The challenge isn't just developing these powerful systems, but ensuring they benefit society as a whole while minimizing potential harm.\"\n\nAs AI technology continues to evolve, one thing remains clear: the conversation about its role in society is just beginning. With each new breakthrough comes fresh questions about how to harness this powerful technology while preserving human agency and ensuring equitable access to its benefits.\n\nThe coming years will likely prove crucial in determining how society navigates this technological transformation. As Dr. Rodriguez puts it, \"We're writing the rules of the AI age as we live through it. The decisions we make today will shape how this technology impacts generations to come.\""
			}
		}

		const summary = await generateSummary(env as Env, [mockArticle]);

		expect(summary).toHaveProperty("keyPoints");
		expect(summary.keyPoints[0]).toHaveProperty("point");
		expect(summary.keyPoints[0]).toHaveProperty("summary");
	})
})
