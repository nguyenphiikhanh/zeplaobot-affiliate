import type { Context, Next } from 'hono'
import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getLinkHistory } from '../services/link-history.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const linkHistoryRoutes = new Hono()

linkHistoryRoutes.use('/admin/link-history', async (c: Context, next: Next) => {
  try {
    const user = await getSessionUserService(c.req.header('Authorization') || '')
    if (user.role !== 'admin') return c.json(sendError('Unauthorized - Admin access required'), 403)
    await next()
  } catch { return c.json(sendError('Unauthorized'), 401) }
})

linkHistoryRoutes.get('/admin/link-history', async (c) => {
  try {
    const data = await getLinkHistory({
      page: Number(c.req.query('page') || 1),
      limit: Number(c.req.query('limit') || 20),
      startDate: c.req.query('startDate'),
      endDate: c.req.query('endDate'),
      userId: c.req.query('userId'),
      subId: c.req.query('subId'),
    })
    return c.json(sendResponse(data, 'Đã tải lịch sử tạo link'))
  } catch (error) {
    console.error('[Link History] Load failed:', error)
    return c.json(sendError('Không thể tải lịch sử tạo link'), 500)
  }
})
