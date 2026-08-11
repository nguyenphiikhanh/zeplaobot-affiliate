import { mysqlTable, bigint, varchar, text, int, json, timestamp } from 'drizzle-orm/mysql-core';
import { ROLE } from '../utils/role.js';

export const linkGenerations = mysqlTable('link_generations', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  originLink: text('origin_link').notNull(),
  affiliateLink: text('affiliate_link').notNull(),
  subId: varchar('sub_id', { length: 64 }).notNull(),
  type: int('type').default(1).notNull(), // 1: Shopee, 2: Tiktok, 3: Lazada, 4: ShopeeFood
  productInfo: json('product_info'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type LinkGeneration = typeof linkGenerations.$inferSelect;
export type NewLinkGeneration = typeof linkGenerations.$inferInsert;

export const users = mysqlTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  role: varchar('role', { length: 32 }).default(ROLE.USER).notNull(),
  trackingCode: varchar('tracking_code', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

