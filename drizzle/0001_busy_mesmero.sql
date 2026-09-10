CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`user_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`deadline_at` integer NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`answers` text NOT NULL,
	`result` text,
	`ended_reason` text,
	`finished_at` integer,
	FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "exam_attempt_status" CHECK("exam_attempts"."status" IN ('in_progress','scored'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_attempt_once` ON `exam_attempts` (`package_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `exam_attempt_deadline` ON `exam_attempts` (`status`,`deadline_at`);--> statement-breakpoint
CREATE TABLE `exam_items` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`version_id` text NOT NULL,
	`position` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`version_id`) REFERENCES `question_versions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_item_position` ON `exam_items` (`package_id`,`position`);--> statement-breakpoint
CREATE UNIQUE INDEX `exam_item_version` ON `exam_items` (`package_id`,`version_id`);--> statement-breakpoint
CREATE TABLE `exam_options` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`code` text NOT NULL,
	`text` text NOT NULL,
	`score` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `exam_items`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exam_option_code` ON `exam_options` (`item_id`,`code`);--> statement-breakpoint
CREATE TABLE `exam_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`exam_type` text NOT NULL,
	`formation` text NOT NULL,
	`target_year` integer NOT NULL,
	`reference` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`quotas` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "exam_duration_valid" CHECK("exam_packages"."duration_minutes" BETWEEN 1 AND 240),
	CONSTRAINT "exam_status_valid" CHECK("exam_packages"."status" IN ('draft','published','archived'))
);
