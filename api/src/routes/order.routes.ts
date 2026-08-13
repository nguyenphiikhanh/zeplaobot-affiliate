import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import {
  getOrdersListService,
  getShopeeSyncStatusService,
  syncShopeeOrdersDirectService,
  uploadShopeeCsvService,
} from '../services/order.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const orderRoutes = new Hono()

// Middleware to verify admin authentication
orderRoutes.use('/admin/orders/*', async (c, next) => {
  const authorization = c.req.header('Authorization') || ''
  try {
    const user = await getSessionUserService(authorization)
    if (user.role !== 'admin') {
      return c.json(sendError('Unauthorized - Admin access required'), 403)
    }
    await next()
  } catch {
    return c.json(sendError('Unauthorized'), 401)
  }
})

// Get orders list with pagination & filters
orderRoutes.get('/admin/orders', async (c) => {
  const status = c.req.query('status')
  const search = c.req.query('search')
  const userId = c.req.query('userId')
  const type = c.req.query('type')
  const orderId = c.req.query('order_id')
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = parseInt(c.req.query('limit') || '20', 10)

  try {
    const data = await getOrdersListService({ status, search, userId, type, orderId, page, limit })
    return c.json(sendResponse(data, 'Retrieved orders list successfully'))
  } catch (error) {
    console.error('[Orders] Error fetching orders list:', error)
    return c.json(sendError('Failed to fetch orders list'), 500)
  }
})

// Get current Shopee sync status
orderRoutes.get('/admin/orders/sync-status', async (c) => {
  try {
    const status = getShopeeSyncStatusService()
    return c.json(sendResponse(status, 'Retrieved sync status successfully'))
  } catch (error) {
    console.error('[Orders] Error fetching sync status:', error)
    return c.json(sendError('Failed to fetch sync status'), 500)
  }
})

// Upload Shopee CSV file
orderRoutes.post('/admin/orders/upload-csv', async (c) => {
  let body: { data?: unknown[] }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid JSON request body'), 400)
  }

  if (!Array.isArray(body.data) || body.data.length === 0) {
    return c.json(sendError('Dữ liệu CSV không được để rỗng'), 400)
  }

  try {
    const result = await uploadShopeeCsvService(body.data)
    return c.json(sendResponse(result, result.message))
  } catch (error) {
    console.error('[Orders] Error uploading CSV:', error)
    return c.json(sendError('Lỗi xử lý file CSV Shopee'), 500)
  }
})

// Sync Shopee orders directly from API (without queue)
orderRoutes.post('/admin/orders/sync-shopee', async (c) => {
  try {
    const result = await syncShopeeOrdersDirectService()
    return c.json(sendResponse(result, result.message))
  } catch (error) {
    console.error('[Orders] Error syncing Shopee orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Lỗi khi đồng bộ đơn hàng Shopee'
    return c.json(sendError(errorMessage), 500)
  }
})



