import { desc, eq, sql } from 'drizzle-orm'
import { config } from '../config.js'
import { db } from '../db/index.js'
import { orders, users, wallets } from '../db/schema.js'
import { createUserWithdrawal } from './user-portal.service.js'

export async function getZaloCommandUser(userId: string) {
  const [record] = await db.select({
    uid: users.id,
    trackingCode: users.trackingCode,
    availableBalance: wallets.availableBalance,
    pendingBalance: wallets.pendingBalance,
    totalPaid: wallets.totalPaid,
  }).from(users).innerJoin(wallets, eq(wallets.userId, users.id)).where(eq(users.id, userId)).limit(1)
  if (!record) throw new Error('Không tìm thấy người dùng hoặc ví')
  return record
}

export const formatWalletBalance = (amount: number) => `${Number(amount || 0).toLocaleString('vi-VN')}đ`
export const getOrdersUrl = () => `${config.appUrl}/orders`
export const getWalletsUrl = () => `${config.appUrl}/wallets`

export async function getZaloUserOrders(userId: string, requestedPage: number, limit = 10) {
  await getZaloCommandUser(userId)
  const [{ total }] = await db.select({ total: sql<number>`count(*)` })
    .from(orders).where(eq(orders.userId, userId))
  const totalOrders = Number(total || 0)
  const totalPages = Math.max(1, Math.ceil(totalOrders / limit))
  const page = Math.min(Math.max(1, requestedPage), totalPages)
  const records = totalOrders
    ? await db.select({
      productName: orders.productName,
      orderId: orders.orderId,
      userCommission: orders.userCommission,
      orderStatus: orders.orderStatus,
    }).from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.orderTime), desc(orders.id))
      .limit(limit)
      .offset((page - 1) * limit)
    : []
  return { records, page, totalPages, totalOrders, hasNextPage: page < totalPages }
}

export async function withdrawAllZaloBalance(userId: string) {
  const user = await getZaloCommandUser(userId)
  if (user.availableBalance < 10000) return { withdrawn: false as const, user }
  await createUserWithdrawal(userId, user.availableBalance)
  return { withdrawn: true as const, user }
}
