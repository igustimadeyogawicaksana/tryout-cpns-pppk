CREATE TABLE `result_corrections` (
	`id` text PRIMARY KEY NOT NULL,
	`attempt_id` text NOT NULL,
	`cohort_id` text NOT NULL,
	`from_revision` integer NOT NULL,
	`to_revision` integer NOT NULL,
	`policy` text NOT NULL,
	`previous_result` text NOT NULL,
	`corrected_result` text NOT NULL,
	`reason` text NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`attempt_id`) REFERENCES `exam_attempts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cohort_id`) REFERENCES `ranking_cohorts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "result_correction_revision_valid" CHECK("result_corrections"."to_revision" = "result_corrections"."from_revision" + 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `result_correction_revision` ON `result_corrections` (`attempt_id`,`to_revision`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ranking_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`cohort_id` text NOT NULL,
	`generation` integer DEFAULT 1 NOT NULL,
	`policy` text DEFAULT 'total-v1' NOT NULL,
	`reason` text DEFAULT 'Penutupan cohort' NOT NULL,
	`generated_at` integer NOT NULL,
	FOREIGN KEY (`cohort_id`) REFERENCES `ranking_cohorts`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "ranking_snapshot_generation_positive" CHECK("__new_ranking_snapshots"."generation" > 0)
);
--> statement-breakpoint
INSERT INTO `__new_ranking_snapshots`("id", "cohort_id", "generation", "policy", "reason", "generated_at") SELECT "id", "cohort_id", 1, 'total-v1', 'Penutupan cohort', "generated_at" FROM `ranking_snapshots`;--> statement-breakpoint
DROP TABLE `ranking_snapshots`;--> statement-breakpoint
ALTER TABLE `__new_ranking_snapshots` RENAME TO `ranking_snapshots`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_snapshot_generation` ON `ranking_snapshots` (`cohort_id`,`generation`);--> statement-breakpoint
CREATE TABLE `__new_exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`package_id` text NOT NULL,
	`user_id` text NOT NULL,
	`started_at` integer NOT NULL,
	`deadline_at` integer NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`result_revision` integer DEFAULT 1 NOT NULL,
	`scoring_policy` text DEFAULT 'total-v1' NOT NULL,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`answers` text NOT NULL,
	`result` text,
	`ended_reason` text,
	`finished_at` integer,
	FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "exam_result_revision_positive" CHECK("__new_exam_attempts"."result_revision" > 0),
	CONSTRAINT "exam_attempt_status" CHECK("__new_exam_attempts"."status" IN ('in_progress','scored'))
);
--> statement-breakpoint
INSERT INTO `__new_exam_attempts`("id", "package_id", "user_id", "started_at", "deadline_at", "revision", "result_revision", "scoring_policy", "status", "answers", "result", "ended_reason", "finished_at") SELECT "id", "package_id", "user_id", "started_at", "deadline_at", "revision", 1, 'total-v1', "status", "answers", "result", "ended_reason", "finished_at" FROM `exam_attempts`;--> statement-breakpoint
DROP TABLE `exam_attempts`;--> statement-breakpoint
ALTER TABLE `__new_exam_attempts` RENAME TO `exam_attempts`;--> statement-breakpoint
CREATE INDEX `exam_attempt_deadline` ON `exam_attempts` (`status`,`deadline_at`);
