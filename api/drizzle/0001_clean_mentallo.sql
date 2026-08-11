CREATE TABLE `users` (
	`id` varchar(64) NOT NULL,
	`role` varchar(32) NOT NULL DEFAULT 'user',
	`tracking_code` varchar(64) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_tracking_code_unique` UNIQUE(`tracking_code`)
);
