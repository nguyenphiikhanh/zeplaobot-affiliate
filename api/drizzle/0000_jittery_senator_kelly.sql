CREATE TABLE `link_generations` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` varchar(64) NOT NULL,
	`origin_link` text NOT NULL,
	`affiliate_link` text NOT NULL,
	`sub_id` varchar(64) NOT NULL,
	`type` int NOT NULL DEFAULT 1,
	`product_info` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `link_generations_id` PRIMARY KEY(`id`)
);
