ALTER TABLE `system_configs` MODIFY COLUMN `value` mediumtext NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `tracking_code` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `email` varchar(255);