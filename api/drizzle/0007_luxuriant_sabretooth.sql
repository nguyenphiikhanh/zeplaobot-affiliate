CREATE TABLE `bank_accounts` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`bank_id` varchar(32) NOT NULL,
	`bank_name` varchar(255) NOT NULL,
	`account_no` varchar(20) NOT NULL,
	`account_name` varchar(255) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `bank_accounts_user_id_unique` UNIQUE(`user_id`)
);
