import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { linkGenerations, users } from '../db/schema.js'

export interface LinkHistoryParams {
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
  userId?: string
  subId?: string
}

const parseDate = (value: string | undefined, endOfDay = false) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}+07:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

export const getLinkHistory = async (params: LinkHistoryParams) => {
  const page = Math.max(1, params.page || 1)
  const limit = Math.max(1, Math.min(100, params.limit || 20))
  const conditions = []
  const startDate = parseDate(params.startDate)
  const endDate = parseDate(params.endDate, true)
  if (startDate) conditions.push(gte(linkGenerations.createdAt, startDate))
  if (endDate) conditions.push(lte(linkGenerations.createdAt, endDate))
  if (params.userId?.trim()) conditions.push(eq(linkGenerations.userId, params.userId.trim()))
  if (params.subId?.trim()) conditions.push(eq(linkGenerations.subId, params.subId.trim()))
  const where = conditions.length ? and(...conditions) : undefined

  const records = await db.select({
    id: linkGenerations.id,
    user_id: linkGenerations.userId,
    origin_link: linkGenerations.originLink,
    affiliate_link: linkGenerations.affiliateLink,
    sub_id: linkGenerations.subId,
    type: linkGenerations.type,
    product_info: linkGenerations.productInfo,
    created_at: linkGenerations.createdAt,
    user: {
      id: users.id,
      name: users.name,
      tracking_code: users.trackingCode,
    },
  }).from(linkGenerations)
    .leftJoin(users, eq(linkGenerations.userId, users.id))
    .where(where)
    .orderBy(desc(linkGenerations.createdAt), desc(linkGenerations.id))
    .limit(limit)
    .offset((page - 1) * limit)

  const [count] = await db.select({ count: sql<number>`count(*)` })
    .from(linkGenerations).where(where)
  const total = Number(count?.count || 0)
  return { links: records, total, page, limit, totalPages: Math.ceil(total / limit) }
}
