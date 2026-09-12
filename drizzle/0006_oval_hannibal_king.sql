CREATE TABLE `manual_payment_proofs` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`submitted_by` text NOT NULL,
	`reference` text NOT NULL,
	`sender_name` text NOT NULL,
	`amount_idr` integer NOT NULL,
	`paid_at` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`review_note` text,
	`reviewed_by` text,
	`reviewed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`submitted_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`reviewed_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "manual_proof_amount_valid" CHECK(typeof("manual_payment_proofs"."amount_idr") = 'integer' AND "manual_payment_proofs"."amount_idr" BETWEEN 1 AND 1000000000),
	CONSTRAINT "manual_proof_status_valid" CHECK("manual_payment_proofs"."status" IN ('pending','approved','rejected'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `manual_proof_reference` ON `manual_payment_proofs` (`payment_id`,`reference`);--> statement-breakpoint
CREATE INDEX `manual_proof_status` ON `manual_payment_proofs` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `ranking_snapshot_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`user_id` text NOT NULL,
	`alias` text NOT NULL,
	`province` text,
	`total` integer NOT NULL,
	`maximum` integer NOT NULL,
	`visible` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`snapshot_id`) REFERENCES `ranking_snapshots`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_snapshot_user` ON `ranking_snapshot_entries` (`snapshot_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `ranking_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`cohort_id` text NOT NULL,
	`generated_at` integer NOT NULL,
	FOREIGN KEY (`cohort_id`) REFERENCES `ranking_cohorts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ranking_snapshots_cohort_id_unique` ON `ranking_snapshots` (`cohort_id`);