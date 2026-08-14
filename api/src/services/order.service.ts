import { eq, sql, desc, and, like, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, users, linkGenerations, wallets, walletTransactions } from '../db/schema.js'
import { getShopeeSettings, getStoredShopeeCookieData, normalizeShopeeCookie } from './shopee-config.service.js'
import { config } from '../config.js'
import { notifyShopeeCookieError } from './zalo-notification.service.js'

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
    service_fee_rate: orders.serviceFeeRate,
    tax_rate: orders.taxRate,
    user_share_percentage: orders.userSharePercentage,
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
    img_code: orders.imgCode,
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
  subId1?: unknown,
  imgCode?: unknown
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

    const serviceFeeRate = Number(settings.service_fee_rate) || 0
    const taxRate = Number(settings.tax_rate) || 0
    const userSharePercentage = Number(settings.user_share_percentage) || 0

    const netCommission = totalCommission - (totalCommission * (serviceFeeRate + taxRate)) / 100
    const calculatedUserCommission = status?.toLowerCase() === 'cancelled'
      ? 0
      : Math.round((netCommission * userSharePercentage) / 100)

    const values = {
      orderStatus: status,
      orderTime: asDate(row.orderTime),
      completeTime: asDate(row.completeTime),
      clickTime: asDate(row.clickTime),
      shopName: asText(row.shopName),
      productId: asText(row.itemId),
      productName: asText(row.itemName),
      quantity: Math.round(asNumber(row.qty) || 1),
      imgCode: asText(row.imgCode),
      purchaseValue: Math.round(asNumber(row.purchaseValue)),
      actualCommission: totalCommission,
      serviceFeeRate,
      taxRate,
      userSharePercentage,
      userCommission: calculatedUserCommission,
      userId: link.userId,
      isPaid: status?.toLowerCase() === 'completed' ? 1 : 0,
      updatedAt: new Date(),
    }
    try {
      await db.transaction(async (tx) => {
        const [existing] = await tx.select({
          id: orders.id,
          isPaid: orders.isPaid,
          userCommission: orders.userCommission,
          serviceFeeRate: orders.serviceFeeRate,
          taxRate: orders.taxRate,
          userSharePercentage: orders.userSharePercentage,
        })
          .from(orders)
          .where(and(eq(orders.orderId, orderId), eq(orders.subId, subId)))
          .limit(1)

        let payoutAmount = values.userCommission
        if (existing?.isPaid === 1) {
          // Repair orders imported by the previous Node logic, which marked
          // is_paid without crediting the wallet. A matching transaction proves
          // that the commission was actually paid and keeps re-import idempotent.
          const [existingWallet] = await tx.select({ id: wallets.id })
            .from(wallets).where(eq(wallets.userId, link.userId)).limit(1)
          if (existingWallet) {
            const [paidTransaction] = await tx.select({ id: walletTransactions.id })
              .from(walletTransactions)
              .where(and(
                eq(walletTransactions.walletId, existingWallet.id),
                eq(walletTransactions.type, 'commission'),
                eq(walletTransactions.referenceId, orderId),
              )).limit(1)
            if (paidTransaction) return
          }
          payoutAmount = existing.userCommission || 0
        }

        if (existing?.isPaid !== 1 && existing) {
          await tx.update(orders).set(values).where(eq(orders.id, existing.id))
        } else if (!existing) {
          await tx.insert(orders).values({ ...values, orderId, subId })
        }

        if (existing?.isPaid !== 1 && values.isPaid !== 1) return

        // Keep the order update, wallet credit and transaction history atomic.
        // If any operation fails, is_paid is rolled back together with the money.
        await tx.insert(wallets).values({ userId: link.userId })
          .onDuplicateKeyUpdate({ set: { userId: link.userId } })
        const [wallet] = await tx.select({ id: wallets.id })
          .from(wallets).where(eq(wallets.userId, link.userId)).limit(1)
        if (!wallet) throw new Error(`Wallet not found for user ${link.userId}`)

        await tx.update(wallets)
          .set({
            availableBalance: sql`${wallets.availableBalance} + ${payoutAmount}`,
            updatedAt: new Date(),
          })
          .where(eq(wallets.id, wallet.id))
        await tx.insert(walletTransactions).values({
          walletId: wallet.id,
          type: 'commission',
          amount: payoutAmount,
          status: 'success',
          referenceId: orderId,
          description: `Hoa hồng đơn hàng #${orderId}`,
        })
      })
      successCount++
    } catch (error) {
      console.error(`[Orders] Failed to import order ${orderId}:`, error)
      skippedCount++
    }
  }

  return {
    successCount,
    skippedCount,
    message: `Cập nhật thành công ${successCount} đơn hàng${skippedCount ? `, bỏ qua ${skippedCount} đơn không khớp Sub ID` : ''}`,
  }
}

const SHOPEE_ORDER_STATUS: Record<number, string> = {
  1: 'Pending',
  2: 'Completed',
  3: 'Cancelled',
  4: 'Unpaid',
}

export interface ShopeeSyncStatus {
  isRunning: boolean
  startedAt: string | null
  totalDays: number
  completedDays: number
  currentDate: string | null
  successCount: number
  skippedCount: number
  message: string
  error: string | null
}

const shopeeSyncState: ShopeeSyncStatus = {
  isRunning: false,
  startedAt: null,
  totalDays: 0,
  completedDays: 0,
  currentDate: null,
  successCount: 0,
  skippedCount: 0,
  message: 'Chưa có tiến trình đồng bộ nào đang chạy.',
  error: null,
}

export const getShopeeSyncStatusService = (): ShopeeSyncStatus => {
  if (shopeeSyncState.isRunning && shopeeSyncState.startedAt) {
    const startTime = new Date(shopeeSyncState.startedAt).getTime()
    if (Date.now() - startTime > 15 * 60 * 1000) {
      shopeeSyncState.isRunning = false
      shopeeSyncState.error = 'Tiến trình đồng bộ trước đó đã tự động reset do quá thời gian cho phép (15 phút).'
    }
  }
  return { ...shopeeSyncState }
}

const getVietnamDateStr = (d: Date): string => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d)
}

const getDayTimestamps = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 7 * 3600 * 1000)
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59) - 7 * 3600 * 1000)
  return {
    startSec: Math.floor(startOfDay.getTime() / 1000),
    endSec: Math.floor(endOfDay.getTime() / 1000),
  }
}

export const getTargetSyncDatesService = async (): Promise<string[]> => {
  const yesterdayDate = getVietnamDateStr(new Date(Date.now() - 24 * 3600 * 1000))

  const pendingRecords = await db.select({
    orderTime: orders.orderTime,
  })
    .from(orders)
    .where(and(
      sql`LOWER(${orders.orderStatus}) = 'pending'`,
      sql`${orders.orderTime} IS NOT NULL`
    ))

  const dateSet = new Set<string>()
  for (const record of pendingRecords) {
    if (record.orderTime) {
      const dStr = getVietnamDateStr(new Date(record.orderTime))
      if (dStr <= yesterdayDate) {
        dateSet.add(dStr)
      }
    }
  }

  dateSet.add(yesterdayDate)
  return Array.from(dateSet).sort()
}

const runBackgroundSyncProcess = async (dates: string[], cookie: string) => {
  const shopeeBaseApi = config.shopee.baseApi.replace(/\/$/, '')

  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i]
    shopeeSyncState.currentDate = dateStr
    shopeeSyncState.message = `Đang đồng bộ đơn hàng ...`

    const { startSec, endSec } = getDayTimestamps(dateStr)
    const dayShopeeList: any[] = []

    let pageNum = 1
    let hasMore = true

    try {
      while (hasMore && pageNum <= 10) {
        const endpoint = `${shopeeBaseApi}/report/list?page_num=${pageNum}&page_size=100&purchase_time_s=${startSec}&purchase_time_e=${endSec}&version=1`

        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'accept': '*/*',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36',
            'sec-fetch-dest': 'empty',
            'sec-fetch-site': 'same-origin',
            'sec-ch-ua': '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
            'content-type': 'application/json',
            'cookie': cookie,
          },
        })

        if (!response.ok) {
          console.error(`[ShopeeSync] Failed API call for date ${dateStr}: HTTP ${response.status}`)
          break
        }

        const resJson = (await response.json()) as any
        if (resJson?.code && resJson.code !== 0) {
          console.error(`[ShopeeSync] API code error for date ${dateStr}: ${resJson?.msg}`)
          break
        }

        const list = resJson?.data?.list || []
        if (Array.isArray(list) && list.length > 0) {
          dayShopeeList.push(...list)
          if (list.length < 100) hasMore = false
          else pageNum += 1
        } else {
          hasMore = false
        }
      }

      if (dayShopeeList.length > 0) {
        const orderData: ShopeeOrderImport[] = []
        for (const item of dayShopeeList) {
          if (!item) continue
          const orderInfo = item.orders?.[0] || {}
          const items = orderInfo.items || []
          const productInfo = items[0] || {}

          const totalPrice = items.reduce((sum: number, it: any) => sum + (Number(it.actual_amount) || 0), 0)
          const rawStatus = orderInfo.display_order_status
          const orderStatus = SHOPEE_ORDER_STATUS[rawStatus] || 'Pending'

          const utmContent = item.utm_content || ''
          const subId1 = utmContent.replace(/-/g, '')
          const orderId = orderInfo.order_sn

          if (!orderId) continue

          const formatDateStr = (ts: number | null | undefined) => {
            if (!ts) return null
            const date = new Date(ts * 1000)
            return Number.isNaN(date.getTime()) ? null : date.toISOString()
          }

          orderData.push({
            subId1,
            orderId,
            orderTime: formatDateStr(item.purchase_time),
            totalOrderCommission: Math.round((Number(item.estimated_total_commission) || 0) / 100000),
            orderStatus,
            completeTime: formatDateStr(orderInfo.complete_time),
            clickTime: formatDateStr(item.click_time),
            shopName: productInfo.shop_name || null,
            itemId: productInfo.item_id || null,
            itemName: productInfo.item_name || null,
            qty: 1,
            purchaseValue: (Number(totalPrice) || 0) / 100000,
            imgCode: productInfo.img_code
          })
        }

        const importRes = await uploadShopeeCsvService(orderData)
        shopeeSyncState.successCount += importRes.successCount
        shopeeSyncState.skippedCount += importRes.skippedCount
      }
    } catch (err) {
      console.error(`[ShopeeSync] Error processing date ${dateStr}:`, err)
    } finally {
      shopeeSyncState.completedDays += 1
    }

    // Small delay between dates to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  shopeeSyncState.isRunning = false
  shopeeSyncState.currentDate = null
  shopeeSyncState.message = `Đã hoàn tất đồng bộ đơn hàng!`
}

export const syncShopeeOrdersDirectService = async () => {
  // Check if process is already running
  if (shopeeSyncState.isRunning) {
    return {
      alreadyRunning: true,
      status: getShopeeSyncStatusService(),
      message: `Tiến trình đồng bộ đang được chạy ...`,
    }
  }

  const storedData = await getStoredShopeeCookieData()
  const cookie = normalizeShopeeCookie(storedData?.cookie)
  if (!cookie) {
    await notifyShopeeCookieError('Đồng bộ đơn hàng Shopee')
    throw new Error('Cookie Shopee chưa được cấu hình. Vui lòng cập nhật Cookie trong mục Cấu hình Shopee.')
  }

  if (storedData?.updated_at) {
    const updatedAt = new Date(storedData.updated_at)
    if (!Number.isNaN(updatedAt.getTime())) {
      const expiresAt = updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000
      if (Date.now() >= expiresAt) {
        await notifyShopeeCookieError('Đồng bộ đơn hàng Shopee')
        throw new Error('Cookie Shopee đã hết hạn. Vui lòng cập nhật Cookie mới trong mục Cấu hình Shopee!')
      }
    }
  }

  const dates = await getTargetSyncDatesService()
  if (!dates.length) {
    return {
      alreadyRunning: false,
      status: getShopeeSyncStatusService(),
      message: 'Không tìm thấy ngày nào cần đồng bộ.',
    }
  }

  // Initialize state
  shopeeSyncState.isRunning = true
  shopeeSyncState.startedAt = new Date().toISOString()
  shopeeSyncState.totalDays = dates.length
  shopeeSyncState.completedDays = 0
  shopeeSyncState.currentDate = dates[0]
  shopeeSyncState.successCount = 0
  shopeeSyncState.skippedCount = 0
  shopeeSyncState.error = null
  shopeeSyncState.message = `Đã kích hoạt đồng bộ ${dates.length} ngày (từ ${dates[0]} đến ${dates[dates.length - 1]}).`

  // Fire-and-forget background process
  runBackgroundSyncProcess(dates, cookie).catch((err) => {
    console.error('[ShopeeSync] Fatal background process error:', err)
    shopeeSyncState.isRunning = false
    shopeeSyncState.error = err instanceof Error ? err.message : 'Lỗi hệ thống khi chạy tiến trình ngầm.'
  })

  return {
    alreadyRunning: false,
    status: getShopeeSyncStatusService(),
    message: `Đã bắt đầu tiến trình đồng bộ`,
  }
}

