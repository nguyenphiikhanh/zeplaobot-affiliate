import { randomInt } from 'node:crypto'
import { desc, eq, like, or, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, users, wallets } from '../db/schema.js'

export interface EnsureZaloUserInput {
  id: string
  name?: string | null
  image?: string | null
}

const TRACKING_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

async function generateTrackingCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    let code = ''
    for (let index = 0; index < 8; index++) {
      code += TRACKING_CODE_CHARS[randomInt(TRACKING_CODE_CHARS.length)]
    }
    const [existing] = await db.select({ id: users.id })
      .from(users).where(eq(users.trackingCode, code)).limit(1)
    if (!existing) return code
  }
  throw new Error('Không thể tạo mã tracking duy nhất')
}

export async function getZaloUser(id: string) {
  const [user] = await db.select({ id: users.id, name: users.name, image: users.image })
    .from(users).where(eq(users.id, id)).limit(1)
  return user || null
}

export async function getAdminUserList(input: { page: number; limit: number; search?: string }) {
  const page = Math.max(1, input.page || 1)
  const limit = Math.max(1, Math.min(100, input.limit || 20))
  const keyword = input.search?.trim()
  const where = keyword ? or(
    like(users.name, `%${keyword}%`),
    like(users.id, `%${keyword}%`),
  ) : undefined

  const completedOrders = sql<number>`(
    select count(*) from ${orders}
    where ${orders.userId} = ${users.id} and lower(${orders.orderStatus}) = 'completed'
  )`
  const records = await db.select({
    id: users.id,
    name: users.name,
    image: users.image,
    available_balance: wallets.availableBalance,
    pending_balance: wallets.pendingBalance,
    total_paid: wallets.totalPaid,
    completed_orders: completedOrders,
    created_at: users.createdAt,
  }).from(users)
    .leftJoin(wallets, eq(wallets.userId, users.id))
    .where(where)
    .orderBy(desc(wallets.availableBalance), desc(users.createdAt))
    .limit(limit).offset((page - 1) * limit)

  const [count] = await db.select({ count: sql<number>`count(*)` }).from(users).where(where)
  const total = Number(count?.count || 0)
  return {
    users: records.map(user => ({
      ...user,
      available_balance: user.available_balance || 0,
      pending_balance: user.pending_balance || 0,
      total_paid: user.total_paid || 0,
      completed_orders: Number(user.completed_orders || 0),
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Creates the Zalo sender and their empty wallet as one atomic operation.
 * A new user receives a stable, uppercase 8-character tracking code for login.
 */
export async function ensureZaloUser(input: EnsureZaloUserInput): Promise<void> {
  const id = input.id.trim()
  if (!id) throw new Error('Zalo user ID is required')
  const name = input.name?.trim() || 'Người dùng Zalo'
  const image = input.image?.trim() || null
  const trackingCode = await generateTrackingCode()

  await db.transaction(async (tx) => {
    await tx.insert(users).values({ id, name, image, trackingCode })
      .onDuplicateKeyUpdate({
        set: image ? { name, image, updatedAt: new Date() } : { name, updatedAt: new Date() },
      })
    await tx.insert(wallets).values({ userId: id })
      .onDuplicateKeyUpdate({ set: { userId: id } })
  })
}
