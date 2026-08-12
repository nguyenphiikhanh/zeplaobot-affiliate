import { mysqlTable, bigint, varchar, text, int, json, timestamp } from 'drizzle-orm/mysql-core';

export const linkGenerations = mysqlTable('link_generations', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 64 }).notNull(),
  originLink: text('origin_link').notNull(),
  affiliateLink: text('affiliate_link').notNull(),
  subId: varchar('sub_id', { length: 64 }).notNull(),
  type: int('type').default(1).notNull(),
  productInfo: json('product_info'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type LinkGeneration = typeof linkGenerations.$inferSelect;
export type NewLinkGeneration = typeof linkGenerations.$inferInsert;

export const users = mysqlTable('users', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  trackingCode: varchar('tracking_code', { length: 64 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const systemConfigs = mysqlTable('system_configs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: varchar('description', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type SystemConfig = typeof systemConfigs.$inferSelect;
export type NewSystemConfig = typeof systemConfigs.$inferInsert;

export const orders = mysqlTable('orders', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  orderId: varchar('order_id', { length: 255 }).notNull(),
  orderStatus: varchar('order_status', { length: 64 }),
  orderTime: timestamp('order_time'),
  completeTime: timestamp('complete_time'),
  clickTime: timestamp('click_time'),
  shopName: varchar('shop_name', { length: 255 }),
  productId: varchar('product_id', { length: 255 }),
  productName: text('product_name'),
  quantity: int('quantity').default(0),
  currency: varchar('currency', { length: 16 }).default('VND'),
  purchaseValue: bigint('purchase_value', { mode: 'number' }),
  actualCommission: bigint('actual_commission', { mode: 'number' }),
  subId: varchar('sub_id', { length: 255 }),
  sub1: varchar('sub1', { length: 255 }),
  sub2: varchar('sub2', { length: 255 }),
  sub3: varchar('sub3', { length: 255 }),
  sub4: varchar('sub4', { length: 255 }),
  sub5: varchar('sub5', { length: 255 }),
  userId: varchar('user_id', { length: 64 }),
  commissionRate: int('commission_rate').default(0),
  userCommission: bigint('user_commission', { mode: 'number' }).default(0),
  isPaid: int('is_paid').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
