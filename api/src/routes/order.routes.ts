import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import {
  getOrdersListService,
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
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = parseInt(c.req.query('limit') || '20', 10)

  try {
    const data = await getOrdersListService({ status, search, userId, page, limit })
    return c.json(sendResponse(data, 'Retrieved orders list successfully'))
  } catch (error) {
    console.error('[Orders] Error fetching orders list:', error)
    return c.json(sendError('Failed to fetch orders list'), 500)
  }
})

// Upload Shopee CSV file
orderRoutes.post('/admin/orders/upload-csv', async (c) => {
  let body: { csv?: string }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid JSON request body'), 400)
  }

  if (typeof body.csv !== 'string' || !body.csv.trim()) {
    return c.json(sendError('Dữ liệu CSV không được để rỗng'), 400)
  }

  try {
    const result = await uploadShopeeCsvService(body.csv)
    return c.json(sendResponse(result, result.message))
  } catch (error) {
    console.error('[Orders] Error uploading CSV:', error)
    return c.json(sendError('Lỗi xử lý file CSV Shopee'), 500)
  }
})

