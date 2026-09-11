CREATE TABLE `participant_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`province` text,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `ranking_members` ADD `province` text;