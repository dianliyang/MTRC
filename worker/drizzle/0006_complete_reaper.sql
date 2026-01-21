PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_books` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`google_id` text,
	`title` text,
	`authors` text,
	`description` text,
	`cover_url` text,
	`language` text,
	`page_count` integer,
	`published_date` text,
	`status` text DEFAULT 'candidate',
	`selected_date` integer,
	`suggester_id` text,
	`likes_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.088Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-21T00:05:29.088Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_books`("id", "google_id", "title", "authors", "description", "cover_url", "language", "page_count", "published_date", "status", "selected_date", "suggester_id", "likes_count", "created_at", "updated_at") SELECT "id", "google_id", "title", "authors", "description", "cover_url", "language", "page_count", "published_date", "status", "selected_date", "suggester_id", "likes_count", "created_at", "updated_at" FROM `books`;--> statement-breakpoint
DROP TABLE `books`;--> statement-breakpoint
ALTER TABLE `__new_books` RENAME TO `books`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `books_google_id_unique` ON `books` (`google_id`);--> statement-breakpoint
CREATE TABLE `__new_comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text,
	`text` text,
	`book_id` integer,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_comments`("id", "username", "text", "book_id", "created_at", "updated_at") SELECT "id", "username", "text", "book_id", "created_at", "updated_at" FROM `comments`;--> statement-breakpoint
DROP TABLE `comments`;--> statement-breakpoint
ALTER TABLE `__new_comments` RENAME TO `comments`;--> statement-breakpoint
CREATE TABLE `__new_likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`book_id` integer,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_likes`("id", "user_id", "book_id", "created_at") SELECT "id", "user_id", "book_id", "created_at" FROM `likes`;--> statement-breakpoint
DROP TABLE `likes`;--> statement-breakpoint
ALTER TABLE `__new_likes` RENAME TO `likes`;--> statement-breakpoint
CREATE TABLE `__new_meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`topic` text NOT NULL,
	`location` text DEFAULT 'Online',
	`host` text DEFAULT 'Group Curator',
	`description` text,
	`published_at` integer,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_meetings`("id", "date", "topic", "location", "host", "description", "published_at", "created_at", "updated_at") SELECT "id", "date", "topic", "location", "host", "description", "published_at", "created_at", "updated_at" FROM `meetings`;--> statement-breakpoint
DROP TABLE `meetings`;--> statement-breakpoint
ALTER TABLE `__new_meetings` RENAME TO `meetings`;--> statement-breakpoint
CREATE TABLE `__new_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`confirmation_token` text,
	`meeting_id` integer,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_participants`("id", "name", "email", "status", "confirmation_token", "meeting_id", "created_at", "updated_at") SELECT "id", "name", "email", "status", "confirmation_token", "meeting_id", "created_at", "updated_at" FROM `participants`;--> statement-breakpoint
DROP TABLE `participants`;--> statement-breakpoint
ALTER TABLE `__new_participants` RENAME TO `participants`;--> statement-breakpoint
CREATE UNIQUE INDEX `participants_confirmation_token_unique` ON `participants` (`confirmation_token`);--> statement-breakpoint
CREATE TABLE `__new_subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`phone_number` text,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-21T00:05:29.089Z"' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_subscribers`("id", "email", "phone_number", "created_at", "updated_at") SELECT "id", "email", "phone_number", "created_at", "updated_at" FROM `subscribers`;--> statement-breakpoint
DROP TABLE `subscribers`;--> statement-breakpoint
ALTER TABLE `__new_subscribers` RENAME TO `subscribers`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT '"2026-01-21T00:05:29.088Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-21T00:05:29.088Z"' NOT NULL,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "email", "password", "name", "role", "created_at", "updated_at", "deleted_at") SELECT "id", "email", "password", "name", "role", "created_at", "updated_at", "deleted_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);