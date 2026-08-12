import { eq, sql, desc, and, like, or } from 'drizzle-orm'
import { db } from '../db/index.js'
import { orders, users, linkGenerations } from '../db/schema.js'

export interface GetOrdersParams {
  status?: string
  search?: string
  userId?: string
  page?: number
  limit?: number
}

export const getOrdersListService = async (params: GetOrdersParams) => {
  const page = Math.max(1, params.page || 1)
  const limit = Math.max(1, Math.min(100, params.limit || 20))
  const offset = (page - 1) * limit

  // Conditions array
  const conditions = []

  if (params.status && params.status !== 'all') {
    conditions.push(eq(orders.orderStatus, params.status))
  }

  if (params.userId) {
    conditions.push(eq(orders.userId, params.userId))
  }

  if (params.search && params.search.trim()) {
    const searchVal = `%${params.search.trim()}%`
    conditions.push(
      or(
        like(orders.orderId, searchVal),
        like(orders.subId, searchVal),
        like(orders.productName, searchVal),
      ),
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Query records joined with users table
  const records = await db
    .select({
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
      user_id: orders.userId,
      user_name: users.name,
      user_tracking_code: users.trackingCode,
      is_paid: orders.isPaid,
      created_at: orders.createdAt,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(whereClause)
    .orderBy(desc(orders.id))
    .limit(limit)
    .offset(offset)

  // Query total count
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(whereClause)

  const total = Number(countResult?.count || 0)

  return {
    orders: records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

// Simple CSV parser for Shopee Affiliate Order CSV exports
export const uploadShopeeCsvService = async (csvContent: string) => {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    return { successCount: 0, message: 'File CSV rỗng hoặc chỉ có dòng tiêu đề' }
  }

  // Parse headers
  const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase())

  // Find column indexes (supporting various Shopee CSV export column names)
  const getColIndex = (names: string[]) =>
    headers.findIndex((h) => names.some((n) => h.includes(n)))

  const idxOrderId = getColIndex(['order id', 'mã đơn hàng', 'purchase id', 'order_id'])
  const idxStatus = getColIndex(['status', 'trạng thái', 'order status', 'order_status'])
  const idxShop = getColIndex(['shop', 'tên shop', 'shop name', 'shop_name'])
  const idxProduct = getColIndex(['product', 'tên sản phẩm', 'item name', 'product_name'])
  const idxQuantity = getColIndex(['quantity', 'số lượng', 'item quantity'])
  const idxValue = getColIndex(['purchase value', 'giá trị đơn', 'item price', 'total payment'])
  const idxCommission = getColIndex(['commission', 'hoa hồng', 'estimated commission'])
  const idxSubId = getColIndex(['sub_id', 'sub id', 'mã giới thiệu', 'subid'])
  const idxSub1 = getColIndex(['sub1', 'sub_1'])
  const idxSub2 = getColIndex(['sub2', 'sub_2'])
  const idxSub3 = getColIndex(['sub3', 'sub_3'])
  const idxSub4 = getColIndex(['sub4', 'sub_4'])
  const idxSub5 = getColIndex(['sub5', 'sub_5'])

  let importedCount = 0

  for (let i = 1; i < lines.length; i++) {
    // Regex to parse CSV line respecting quotes
    const row = lines[i]
      .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
      ?.map((val) => val.replace(/^["']|["']$/g, '').trim()) || lines[i].split(',')

    const orderId = idxOrderId >= 0 ? row[idxOrderId] : row[0]
    if (!orderId) continue

    const rawStatus = idxStatus >= 0 ? row[idxStatus]?.toLowerCase() : 'pending'
    const shopName = idxShop >= 0 ? row[idxShop] : null
    const productName = idxProduct >= 0 ? row[idxProduct] : null
    const quantity = idxQuantity >= 0 ? parseInt(row[idxQuantity] || '1', 10) : 1
    const purchaseValue = idxValue >= 0 ? parseFloat(row[idxValue]?.replace(/[^0-9.]/g, '') || '0') : 0
    const actualCommission = idxCommission >= 0 ? parseFloat(row[idxCommission]?.replace(/[^0-9.]/g, '') || '0') : 0
    const subId = idxSubId >= 0 ? row[idxSubId] : null
    const sub1 = idxSub1 >= 0 ? row[idxSub1] : null
    const sub2 = idxSub2 >= 0 ? row[idxSub2] : null
    const sub3 = idxSub3 >= 0 ? row[idxSub3] : null
    const sub4 = idxSub4 >= 0 ? row[idxSub4] : null
    const sub5 = idxSub5 >= 0 ? row[idxSub5] : null

    // Map Shopee status to standardized status
    let orderStatus = 'pending'
    if (rawStatus.includes('hoàn thành') || rawStatus.includes('completed') || rawStatus.includes('thành công') || rawStatus.includes('success')) {
      orderStatus = 'success'
    } else if (rawStatus.includes('hủy') || rawStatus.includes('cancel')) {
      orderStatus = 'cancelled'
    } else if (rawStatus.includes('chưa thanh toán') || rawStatus.includes('unpaid')) {
      orderStatus = 'unpaid'
    }

    // Attempt to match userId from linkGenerations table using subId
    let matchedUserId: string | null = null
    if (subId) {
      const [linkRecord] = await db
        .select({ userId: linkGenerations.userId })
        .from(linkGenerations)
        .where(eq(linkGenerations.subId, subId))
        .limit(1)

      if (linkRecord?.userId) {
        matchedUserId = linkRecord.userId
      }
    }

    // Check if order already exists
    const [existingOrder] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1)

    if (existingOrder) {
      await db
        .update(orders)
        .set({
          orderStatus,
          purchaseValue: Math.round(purchaseValue),
          actualCommission: Math.round(actualCommission),
          userCommission: Math.round(actualCommission * 0.7), // 70% commission allocation
          sub1,
          sub2,
          sub3,
          sub4,
          sub5,
          userId: matchedUserId || undefined,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, existingOrder.id))
    } else {
      await db.insert(orders).values({
        orderId,
        orderStatus,
        shopName,
        productName,
        quantity,
        purchaseValue: Math.round(purchaseValue),
        actualCommission: Math.round(actualCommission),
        userCommission: Math.round(actualCommission * 0.7),
        subId,
        sub1,
        sub2,
        sub3,
        sub4,
        sub5,
        userId: matchedUserId,
        orderTime: new Date(),
      })
    }

    importedCount++
  }

  return { successCount: importedCount, message: `Đã nhập thành công ${importedCount} đơn hàng Shopee` }
}
