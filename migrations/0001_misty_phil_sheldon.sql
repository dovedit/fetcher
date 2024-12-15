PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer,
	`ai_generated` integer,
	`sources` text DEFAULT []
);
--> statement-breakpoint
INSERT INTO `__new_articles`("id", "title", "slug", "description", "content", "created_at", "updated_at", "ai_generated", "sources") SELECT "id", "title", "slug", "description", "content", "created_at", "updated_at", "ai_generated", "sources" FROM `articles`;--> statement-breakpoint
DROP TABLE `articles`;--> statement-breakpoint
ALTER TABLE `__new_articles` RENAME TO `articles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;