import { and, desc, eq, gte, like, lte, or, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, users, wallets, walletTransactions } from '../db/schema.js'

const allowedTypes = ['commission', 'withdrawal'] as const
const allowedStatuses = ['pending', 'success', 'rejected'] as const
const day = (value?: string, end = false) => value && /^\d{4}-\d{2}-\d{2}$/.test(value)
  ? new Date(`${value}T${end ? '23:59:59.999' : '00:00:00.000'}+07:00`) : undefined

export async function getAdminUsers(search = '') {
  const keyword = search.trim()
  return db.select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(keyword ? or(like(users.name, `%${keyword}%`), like(users.id, `%${keyword}%`)) : undefined)
    .orderBy(users.name).limit(100)
}

export async function getTransactionHistory(input: { page: number; limit: number; userId?: string; type?: string; status?: string; startDate?: string; endDate?: string }) {
  const page = Math.max(1, input.page || 1), limit = Math.max(1, Math.min(100, input.limit || 20))
  const conditions = [or(eq(walletTransactions.type, 'commission'), eq(walletTransactions.type, 'withdrawal'))]
  if (input.userId) conditions.push(eq(wallets.userId, input.userId))
  if (allowedTypes.includes(input.type as typeof allowedTypes[number])) conditions.push(eq(walletTransactions.type, input.type!))
  if (allowedStatuses.includes(input.status as typeof allowedStatuses[number])) conditions.push(eq(walletTransactions.status, input.status!))
  const start = day(input.startDate), end = day(input.endDate, true)
  if (start) conditions.push(gte(walletTransactions.createdAt, start))
  if (end) conditions.push(lte(walletTransactions.createdAt, end))
  const where = and(...conditions)
  const rows = await db.select({
    id: walletTransactions.id, amount: walletTransactions.amount, type: walletTransactions.type,
    status: walletTransactions.status, reference_id: walletTransactions.referenceId,
    description: walletTransactions.description, created_at: walletTransactions.createdAt,
    user: { id: users.id, name: users.name, tracking_code: users.trackingCode },
  }).from(walletTransactions).innerJoin(wallets, eq(walletTransactions.walletId, wallets.id))
    .leftJoin(users, eq(wallets.userId, users.id)).where(where)
    .orderBy(desc(walletTransactions.createdAt), desc(walletTransactions.id)).limit(limit).offset((page - 1) * limit)
  const [count] = await db.select({ count: sql<number>`count(*)` }).from(walletTransactions)
    .innerJoin(wallets, eq(walletTransactions.walletId, wallets.id)).where(where)
  return { transactions: rows, total: Number(count?.count || 0), page, limit, totalPages: Math.ceil(Number(count?.count || 0) / limit) }
}

export async function getUserTransactionOverview(userId: string) {
  const [user] = await db.select({ id: users.id, name: users.name, tracking_code: users.trackingCode,
    available_balance: wallets.availableBalance, pending_balance: wallets.pendingBalance, total_paid: wallets.totalPaid,
  }).from(users).leftJoin(wallets, eq(users.id, wallets.userId)).where(eq(users.id, userId)).limit(1)
  if (!user) return null
  const [completed] = await db.select({ count: sql<number>`count(*)` }).from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.orderStatus, 'Hoàn thành')))
  return { ...user, available_balance: user.available_balance || 0, pending_balance: user.pending_balance || 0, total_paid: user.total_paid || 0, completed_orders: Number(completed?.count || 0) }
}

export async function getWithdrawals(input: { page: number; limit: number; search?: string; status?: string }) {
  const page = Math.max(1, input.page || 1), limit = Math.max(1, Math.min(100, input.limit || 20))
  const conditions = [eq(walletTransactions.type, 'withdrawal')]
  if (input.search?.trim()) conditions.push(like(walletTransactions.referenceId, `%${input.search.trim()}%`))
  if (allowedStatuses.includes(input.status as typeof allowedStatuses[number])) conditions.push(eq(walletTransactions.status, input.status!))
  const where = and(...conditions)
  const base = { id: walletTransactions.id, amount: walletTransactions.amount, status: walletTransactions.status,
    reference_id: walletTransactions.referenceId, description: walletTransactions.description,
    qr_code_url: walletTransactions.qrCodeUrl, reject_reason: walletTransactions.rejectReason,
    created_at: walletTransactions.createdAt, updated_at: walletTransactions.updatedAt,
    user: { id: users.id, name: users.name, tracking_code: users.trackingCode } }
  const rows = await db.select(base).from(walletTransactions).innerJoin(wallets, eq(walletTransactions.walletId, wallets.id))
    .leftJoin(users, eq(wallets.userId, users.id)).where(where).orderBy(desc(walletTransactions.createdAt)).limit(limit).offset((page - 1) * limit)
  const [stats] = await db.select({ total: sql<number>`count(*)`, pending_count: sql<number>`sum(case when ${walletTransactions.status} = 'pending' then 1 else 0 end)`, pending_amount: sql<number>`sum(case when ${walletTransactions.status} = 'pending' then abs(${walletTransactions.amount}) else 0 end)` })
    .from(walletTransactions).where(eq(walletTransactions.type, 'withdrawal'))
  const [count] = await db.select({ count: sql<number>`count(*)` }).from(walletTransactions).where(where)
  const total = Number(count?.count || 0)
  return { withdrawals: rows, stats: { total: Number(stats?.total || 0), pending_count: Number(stats?.pending_count || 0), pending_amount: Number(stats?.pending_amount || 0) }, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function updateWithdrawalStatus(id: number, status: 'success' | 'rejected', rejectReason?: string) {
  return db.transaction(async (tx) => {
    const [item] = await tx.select().from(walletTransactions).where(and(eq(walletTransactions.id, id), eq(walletTransactions.type, 'withdrawal'))).limit(1)
    if (!item) throw new Error('NOT_FOUND')
    if (item.status !== 'pending') throw new Error('ALREADY_PROCESSED')
    const amount = Math.abs(item.amount)
    const [wallet] = await tx.select().from(wallets).where(eq(wallets.id, item.walletId)).limit(1)
    if (!wallet) throw new Error('WALLET_NOT_FOUND')
    if (status === 'rejected' && !rejectReason?.trim()) throw new Error('REJECT_REASON_REQUIRED')
    await tx.update(wallets).set(status === 'success'
      ? { pendingBalance: Math.max(0, wallet.pendingBalance - amount), totalPaid: wallet.totalPaid + amount }
      : { pendingBalance: Math.max(0, wallet.pendingBalance - amount), availableBalance: wallet.availableBalance + amount })
      .where(eq(wallets.id, wallet.id))
    await tx.update(walletTransactions).set({ status, rejectReason: status === 'rejected' ? rejectReason!.trim() : null, updatedAt: new Date() }).where(eq(walletTransactions.id, id))
  })
}
