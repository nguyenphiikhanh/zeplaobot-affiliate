CREATE TABLE `wallet_transactions` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`wallet_id` bigint NOT NULL,
	`amount` bigint NOT NULL,
	`type` varchar(32) NOT NULL,
	`status` varchar(32) NOT NULL DEFAULT 'pending',
	`reference_id` varchar(255),
	`description` text,
	`qr_code_url` text,
	`reject_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`available_balance` bigint NOT NULL DEFAULT 0,
	`pending_balance` bigint NOT NULL DEFAULT 0,
	`total_paid` bigint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_user_id_unique` UNIQUE(`user_id`)
);
