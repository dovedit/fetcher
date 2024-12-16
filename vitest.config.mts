import path from "node:path";
import { defineWorkersProject, readD1Migrations } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersProject(async () => {
	const migrationsPath = path.join(__dirname, "migrations");
	const migrations = await readD1Migrations(migrationsPath);

	return {
		test: {
			setupFiles: ["./test/setup.ts"],
			poolOptions: {
				workers: {
					miniflare: {
						bindings: {
							MIGRATIONS: migrations,
							TEST: true,
							OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
							GNEWS_API_KEY: process.env.GNEWS_API_KEY,
						}
					},
					wrangler: {
						configPath: './wrangler.toml',
						environment: 'production',
					},
				},
			},
		},
	}
});
