import { eq, sql, desc, and, like, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, users, linkGenerations } from '../db/schema.js'
import { getShopeeSettings } from './shopee-config.service.js'

export interface GetOrdersParams {
  status?: string
  search?: string
  userId?: string
  type?: string
  orderId?: string
  page?: number
  limit?: number
}

export const getOrdersListService = async (params: GetOrdersParams) => {
  const page = Math.max(1, params.page || 1)
  const limit = Math.max(1, Math.min(100, params.limit || 20))
  const conditions = []

  if (params.status && params.status !== 'all') conditions.push(eq(orders.orderStatus, params.status))
  if (params.userId) conditions.push(eq(linkGenerations.userId, params.userId))
  if (params.type && params.type !== 'all') conditions.push(eq(linkGenerations.type, Number(params.type)))
  if (params.orderId?.trim()) conditions.push(eq(orders.orderId, params.orderId.trim()))
  if (params.search?.trim()) {
    const value = `%${params.search.trim()}%`
    conditions.push(or(like(orders.orderId, value), like(orders.subId, value), like(orders.productName, value)))
  }

  const where = conditions.length ? and(...conditions) : undefined
  const records = await db.select({
    id: orders.id,
    order_id: orders.orderId,
    order_status: orders.orderStatus,
    order_time: orders.orderTime,
    complete_time: orders.completeTime,
    click_time: orders.clickTime,
    shop_name: orders.shopName,
    product_id: orders.productId,
    product_name: orders.productName,
    quantity: orders.quantity,
    currency: orders.currency,
    purchase_value: orders.purchaseValue,
    actual_commission: orders.actualCommission,
    user_commission: orders.userCommission,
    sub_id: orders.subId,
    sub1: orders.sub1,
    sub2: orders.sub2,
    sub3: orders.sub3,
    sub4: orders.sub4,
    sub5: orders.sub5,
    user_id: linkGenerations.userId,
    user_name: users.name,
    user_tracking_code: users.trackingCode,
    type: linkGenerations.type,
    is_paid: orders.isPaid,
    created_at: orders.createdAt,
  }).from(orders)
    .leftJoin(linkGenerations, eq(orders.subId, linkGenerations.subId))
    .leftJoin(users, eq(linkGenerations.userId, users.id))
    .where(where)
    .orderBy(desc(orders.orderTime), desc(orders.id))
    .limit(limit)
    .offset((page - 1) * limit)

  const [count] = await db.select({ count: sql<number>`count(*)` })
    .from(orders)
    .leftJoin(linkGenerations, eq(orders.subId, linkGenerations.subId))
    .where(where)
  const total = Number(count?.count || 0)
  return { orders: records, total, page, limit, totalPages: Math.ceil(total / limit) }
}

interface ShopeeOrderImport {
  orderId?: unknown
  orderStatus?: unknown
  orderTime?: unknown
  completeTime?: unknown
  clickTime?: unknown
  shopName?: unknown
  itemId?: unknown
  itemName?: unknown
  qty?: unknown
  purchaseValue?: unknown
  totalOrderCommission?: unknown
  subId1?: unknown
}

const asText = (value: unknown) => value == null ? null : String(value).trim() || null
const asNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const asDate = (value: unknown) => {
  const text = asText(value)
  if (!text) return null
  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date
}

// Same payload contract and matching rules as the PHP /order/import endpoint.
export const uploadShopeeCsvService = async (input: unknown[]) => {
  const settings = await getShopeeSettings()
  const userCommissionMultiplier = (settings.user_share_percentage / 100)
    * (1 - settings.service_fee_rate / 100)
    * (1 - settings.tax_rate / 100)
  const uniqueRows = new Map<string, ShopeeOrderImport>()
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as ShopeeOrderImport
    const orderId = asText(row.orderId)
    if (!orderId) continue
    const previous = uniqueRows.get(orderId)
    if (!previous || asNumber(row.totalOrderCommission) > 0) uniqueRows.set(orderId, row)
  }

  let successCount = 0
  let skippedCount = 0
  for (const row of uniqueRows.values()) {
    const orderId = asText(row.orderId)!
    const subId = asText(row.subId1)
    if (!subId) { skippedCount++; continue }

    const [link] = await db.select({ userId: linkGenerations.userId })
      .from(linkGenerations).where(eq(linkGenerations.subId, subId)).limit(1)
    if (!link?.userId) { skippedCount++; continue }

    const status = asText(row.orderStatus)
    const totalCommission = Math.round(asNumber(row.totalOrderCommission))
    const values = {
      orderStatus: status,
      orderTime: asDate(row.orderTime),
      completeTime: asDate(row.completeTime),
      clickTime: asDate(row.clickTime),
      shopName: asText(row.shopName),
      productId: asText(row.itemId),
      productName: asText(row.itemName),
      quantity: Math.round(asNumber(row.qty) || 1),
      purchaseValue: Math.round(asNumber(row.purchaseValue)),
      actualCommission: totalCommission,
      userCommission: status?.toLowerCase() === 'cancelled' ? 0 : Math.round(totalCommission * userCommissionMultiplier),
      userId: link.userId,
      isPaid: status?.toLowerCase() === 'completed' ? 1 : 0,
      updatedAt: new Date(),
    }
    const [existing] = await db.select({ id: orders.id, isPaid: orders.isPaid })
      .from(orders).where(and(eq(orders.orderId, orderId), eq(orders.subId, subId))).limit(1)

    if (existing) {
      if (existing.isPaid === 0) await db.update(orders).set(values).where(eq(orders.id, existing.id))
    } else {
      await db.insert(orders).values({ ...values, orderId, subId })
    }
    successCount++
  }

  return {
    successCount,
    skippedCount,
    message: `Cập nhật thành công ${successCount} đơn hàng${skippedCount ? `, bỏ qua ${skippedCount} đơn không khớp Sub ID` : ''}`,
  }
}
