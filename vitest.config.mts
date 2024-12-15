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
						bindings: { MIGRATIONS: migrations }
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
