CREATE TABLE `access_grants` (
	`id` text PRIMARY KEY NOT NULL,
	`order_package_id` text NOT NULL,
	`starts_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`revoked_at` integer,
	`revoke_reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`order_package_id`) REFERENCES `order_packages`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "grant_period_valid" CHECK("access_grants"."expires_at" > "access_grants"."starts_at")
);
--> statement-breakpoint
CREATE UNIQUE INDEX `access_grants_order_package_id_unique` ON `access_grants` (`order_package_id`);--> statement-breakpoint
CREATE TABLE `order_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`package_id` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_package_unique` ON `order_packages` (`order_id`,`package_id`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`product_title` text NOT NULL,
	`amount_idr` integer NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`access_days` integer NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`idempotency_key` text NOT NULL,
	`request_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_amount_valid" CHECK(typeof("orders"."amount_idr") = 'integer' AND "orders"."amount_idr" BETWEEN 0 AND 1000000000 AND "orders"."currency" = 'IDR'),
	CONSTRAINT "order_access_valid" CHECK("orders"."access_days" BETWEEN 1 AND 3650),
	CONSTRAINT "order_status_valid" CHECK("orders"."status" IN ('pending','paid','expired','cancelled','partially_refunded','refunded','review_required'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_user_idempotency` ON `orders` (`user_id`,`idempotency_key`);--> statement-breakpoint
CREATE INDEX `order_user_created` ON `orders` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`environment` text NOT NULL,
	`merchant_account` text NOT NULL,
	`event_key` text NOT NULL,
	`payment_id` text,
	`payload_hash` text NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'received' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`error_code` text,
	`received_at` integer NOT NULL,
	`processed_at` integer,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "payment_event_status" CHECK("payment_events"."status" IN ('received','processed','ignored','failed')),
	CONSTRAINT "payment_event_verified" CHECK("payment_events"."status" != 'processed' OR "payment_events"."verified" = 1)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_event_unique` ON `payment_events` (`provider`,`environment`,`merchant_account`,`event_key`);--> statement-breakpoint
CREATE INDEX `payment_event_retry` ON `payment_events` (`status`,`received_at`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`environment` text DEFAULT 'sandbox' NOT NULL,
	`merchant_account` text NOT NULL,
	`external_id` text,
	`idempotency_key` text NOT NULL,
	`amount_idr` integer NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`settled_at` integer,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "payment_amount_valid" CHECK(typeof("payments"."amount_idr") = 'integer' AND "payments"."amount_idr" BETWEEN 1 AND 1000000000 AND "payments"."currency" = 'IDR'),
	CONSTRAINT "payment_environment_valid" CHECK("payments"."environment" IN ('sandbox','production')),
	CONSTRAINT "payment_status_valid" CHECK("payments"."status" IN ('created','pending','succeeded','failed','expired','cancelled','review_required'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_idempotency_key_unique` ON `payments` (`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `payment_external_unique` ON `payments` (`provider`,`environment`,`merchant_account`,`external_id`);--> statement-breakpoint
CREATE INDEX `payment_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE TABLE `product_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`package_id` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`package_id`) REFERENCES `exam_packages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_package_unique` ON `product_packages` (`product_id`,`package_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`price_idr` integer NOT NULL,
	`access_days` integer NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "product_price_valid" CHECK(typeof("products"."price_idr") = 'integer' AND "products"."price_idr" BETWEEN 0 AND 1000000000),
	CONSTRAINT "product_access_valid" CHECK("products"."access_days" BETWEEN 1 AND 3650)
);
--> statement-breakpoint
CREATE TABLE `refunds` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`external_id` text,
	`idempotency_key` text NOT NULL,
	`amount_idr` integer NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`actor_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "refund_amount_valid" CHECK(typeof("refunds"."amount_idr") = 'integer' AND "refunds"."amount_idr" BETWEEN 1 AND 1000000000),
	CONSTRAINT "refund_status_valid" CHECK("refunds"."status" IN ('requested','pending','succeeded','failed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `refunds_idempotency_key_unique` ON `refunds` (`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `refund_external_unique` ON `refunds` (`payment_id`,`external_id`);