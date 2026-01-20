CREATE TABLE `books` (
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
	`created_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_google_id_unique` ON `books` (`google_id`);--> statement-breakpoint
CREATE TABLE `comments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text,
	`text` text,
	`book_id` integer,
	`created_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meeting_books` (
	`meeting_id` integer,
	`book_id` integer,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `meetings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` integer NOT NULL,
	`topic` text NOT NULL,
	`location` text DEFAULT 'Online',
	`host` text DEFAULT 'Group Curator',
	`description` text,
	`created_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`meeting_id` integer,
	`created_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	FOREIGN KEY (`meeting_id`) REFERENCES `meetings`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text,
	`phone_number` text,
	`created_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-20T21:41:21.532Z"' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT '"2026-01-20T21:41:21.531Z"' NOT NULL,
	`updated_at` integer DEFAULT '"2026-01-20T21:41:21.531Z"' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);