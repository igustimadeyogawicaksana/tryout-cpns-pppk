CREATE TABLE `ranking_cohorts` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`ends_at` integer NOT NULL,
	`policy` text DEFAULT 'total-v1' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_cohorts_package_id_unique` ON `ranking_cohorts` (`package_id`);--> statement-breakpoint
CREATE TABLE `ranking_members` (
	`id` text PRIMARY KEY NOT NULL,
	`cohort_id` text NOT NULL,
	`user_id` text NOT NULL,
	`alias` text NOT NULL,
	`visible` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`cohort_id`) REFERENCES `ranking_cohorts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_member_once` ON `ranking_members` (`cohort_id`,`user_id`);