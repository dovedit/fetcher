import path from "node:path";
import { defineWorkersProject, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersProject(async () => {
	const migrationsPath = path.join(__dirname, "migrations");
	const migrations = await readD1Migrations(migrationsPath);

	const envs = process.env.OPENROUTER_API_KEY && process.env.GNEWS_API_KEY ? {
		OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY as string,
		GNEWS_API_KEY: process.env.GNEWS_API_KEY as string,
	} as Record<string, string> : {};

	return {
		test: {
			setupFiles: ["./test/setup.ts"],
			poolOptions: {
				workers: {
					miniflare: {
						bindings: {
							MIGRATIONS: migrations,
							TEST: true,
							...envs
						}
					},
					wrangler: {
						configPath: './wrangler.toml',
					},
				},
			},
		},
	}
});
