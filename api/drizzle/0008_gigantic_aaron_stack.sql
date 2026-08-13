ALTER TABLE `orders` ADD `service_fee_rate` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `tax_rate` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `user_share_percentage` int DEFAULT 0;