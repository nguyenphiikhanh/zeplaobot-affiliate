import { and, eq, sql } from 'drizzle-orm'
import { db } from '../db/index.js'
import { linkGenerations, orders, wallets, walletTransactions } from '../db/schema.js'
import { getTikTokSettings } from './tiktok-config.service.js'

interface TikTokOrder {
  order_id?: unknown
  sub_id?: unknown
  status?: unknown
  create_time?: unknown
  time_created?: unknown
  time_delivered?: unknown
  shop_name?: unknown
  product_id?: unknown
  product_name?: unknown
  quantity?: unknown
  price?: unknown
  actual_commission?: unknown
  est_commission?: unknown
}

const text = (value: unknown) => {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

const number = (value: unknown) => {
  const normalized = Number(value)
  return Number.isFinite(normalized) ? normalized : 0
}

const vietnamDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, hourCycle: 'h23',
})

const formatDateTime = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  const raw = String(value).trim()
  let date: Date
  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    const timestamp = Number(raw)
    if (!Number.isFinite(timestamp) || timestamp <= 0) return null
    date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp)
  } else {
    date = new Date(raw)
  }
  if (Number.isNaN(date.getTime())) return null
  const parts = Object.fromEntries(
    vietnamDateTimeFormatter.formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, part.value]),
  )
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`
}

const statusName = (value: unknown) => {
  const status = Number(value)
  if (status === 1) return 'Pending'
  if (status === 2) return 'Completed'
  if (status === 3) return 'Cancelled'
  const normalized = String(value ?? '').trim().toLowerCase()
  if (normalized === 'pending') return 'Pending'
  if (['completed', 'complete', 'success'].includes(normalized)) return 'Completed'
  if (['cancelled', 'canceled'].includes(normalized)) return 'Cancelled'
  throw new Error(`Trạng thái đơn TikTok không hợp lệ: ${String(value ?? '')}`)
}

const fetchTikTokOrder = async (orderId: string) => {
  const settings = await getTikTokSettings()
  if (!settings.TIKTOK_BASE_API || !settings.TIKTOK_BASE_API_KEY || !settings.TIKTOK_BASE_API_CREATOR) {
    throw new Error('Cấu hình API TikTok chưa đầy đủ')
  }
  const endpoint = new URL(`${settings.TIKTOK_BASE_API.replace(/\/+$/, '')}/orders`)
  endpoint.searchParams.set('creator_username', settings.TIKTOK_BASE_API_CREATOR)
  endpoint.searchParams.set('order_id', orderId)
  const response = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
      'X-Riohub-Api-Key': settings.TIKTOK_BASE_API_KEY,
    },
  })
  const rawBody = await response.text()
  let payload: { orders?: TikTokOrder[]; message?: string } = {}
  try { payload = rawBody ? JSON.parse(rawBody) : {} } catch { /* handled below */ }
  if (!response.ok) {
    console.error(`[TikTok Postback] Fetch order failed (${response.status}):`, rawBody)
    throw new Error(payload.message || `API TikTok trả về lỗi ${response.status}`)
  }
  const order = payload.orders?.[0]
  if (!order) throw new Error(`Không tìm thấy đơn TikTok ${orderId}`)
  return { order, settings }
}

export const syncTikTokOrderFromPostback = async (postbackOrderId: string) => {
  const { order, settings } = await fetchTikTokOrder(postbackOrderId)
  const orderId = text(order.order_id) || postbackOrderId
  const subId = text(order.sub_id)
  if (!subId) throw new Error(`Đơn TikTok ${orderId} không có Sub ID`)

  const [link] = await db.select({ userId: linkGenerations.userId })
    .from(linkGenerations)
    .where(and(eq(linkGenerations.subId, subId), eq(linkGenerations.type, 2)))
    .limit(1)
  if (!link?.userId) throw new Error(`Không tìm thấy lịch sử link TikTok cho Sub ID ${subId}`)

  const status = statusName(order.status)
  const totalCommission = Math.round(number(order.actual_commission) || number(order.est_commission))

  return db.transaction(async tx => {
    const [existing] = await tx.select({
      id: orders.id,
      isPaid: orders.isPaid,
      serviceFeeRate: orders.serviceFeeRate,
      taxRate: orders.taxRate,
      userSharePercentage: orders.userSharePercentage,
    }).from(orders)
      .where(and(eq(orders.orderId, orderId), eq(orders.subId, subId)))
      .limit(1)

    if (existing?.isPaid === 1) {
      return { orderId, subId, status, skipped: true }
    }

    const serviceFeeRate = existing?.serviceFeeRate != null
      ? Number(existing.serviceFeeRate) : Number(settings.service_fee_rate) || 0
    const taxRate = existing?.taxRate != null
      ? Number(existing.taxRate) : Number(settings.tax_rate) || 0
    const userSharePercentage = existing?.userSharePercentage != null
      ? Number(existing.userSharePercentage) : Number(settings.user_share_percentage) || 0
    const netCommission = totalCommission - totalCommission * (serviceFeeRate + taxRate) / 100
    const userCommission = status === 'Cancelled'
      ? 0 : Math.round(netCommission * userSharePercentage / 100)
    const isPaid = status === 'Completed' ? 1 : 0

    const values = {
      orderStatus: status,
      orderTime: formatDateTime(order.create_time ?? order.time_created),
      completeTime: formatDateTime(order.time_delivered),
      clickTime: null,
      shopName: text(order.shop_name),
      productId: text(order.product_id),
      productName: text(order.product_name),
      quantity: Math.round(number(order.quantity) || 1),
      purchaseValue: Math.round(number(order.price)),
      actualCommission: totalCommission,
      serviceFeeRate,
      taxRate,
      userSharePercentage,
      userCommission,
      userId: link.userId,
      isPaid,
      updatedAt: new Date(),
    }

    if (existing) {
      await tx.update(orders).set(values).where(eq(orders.id, existing.id))
    } else {
      await tx.insert(orders).values({ ...values, orderId, subId })
    }

    if (!isPaid) return { orderId, subId, status, skipped: false }

    await tx.insert(wallets).values({ userId: link.userId })
      .onDuplicateKeyUpdate({ set: { userId: link.userId } })
    const [wallet] = await tx.select({ id: wallets.id }).from(wallets)
      .where(eq(wallets.userId, link.userId)).limit(1)
    if (!wallet) throw new Error(`Không tìm thấy ví của người dùng ${link.userId}`)

    const [paidTransaction] = await tx.select({ id: walletTransactions.id })
      .from(walletTransactions)
      .where(and(
        eq(walletTransactions.walletId, wallet.id),
        eq(walletTransactions.type, 'commission'),
        eq(walletTransactions.referenceId, orderId),
      )).limit(1)

    if (!paidTransaction) {
      await tx.update(wallets).set({
        availableBalance: sql`${wallets.availableBalance} + ${userCommission}`,
        updatedAt: new Date(),
      }).where(eq(wallets.id, wallet.id))
      await tx.insert(walletTransactions).values({
        walletId: wallet.id,
        type: 'commission',
        amount: userCommission,
        status: 'success',
        referenceId: orderId,
        description: `Hoa hồng đơn TikTok #${orderId}`,
      })
    }

    return { orderId, subId, status, skipped: Boolean(paidTransaction) }
  })
}
