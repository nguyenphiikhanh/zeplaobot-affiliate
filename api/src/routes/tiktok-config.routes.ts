import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getTikTokSettings, saveTikTokSettings } from '../services/tiktok-config.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const tiktokConfigRoutes = new Hono()

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  try {
    const user = await getSessionUserService(c.req.header('Authorization') || '')
    if (user.role !== 'admin') return c.json(sendError('Unauthorized - Admin access required'), 403)
    await next()
  } catch {
    return c.json(sendError('Unauthorized'), 401)
  }
}

tiktokConfigRoutes.use('/admin/tiktok-config', requireAdmin)
tiktokConfigRoutes.use('/admin/tiktok-config/*', requireAdmin)

tiktokConfigRoutes.get('/admin/tiktok-config', async (c) => {
  try {
    return c.json(sendResponse({ settings: await getTikTokSettings() }, 'Đã tải cấu hình TikTok'))
  } catch (error) {
    console.error('[TikTok Config] Load failed:', error)
    return c.json(sendError('Không thể tải cấu hình TikTok'), 500)
  }
})

tiktokConfigRoutes.put('/admin/tiktok-config', async (c) => {
  try {
    const body = await c.req.json()
    return c.json(sendResponse(await saveTikTokSettings(body), 'Lưu cấu hình TikTok thành công'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lưu cấu hình TikTok'
    return c.json(sendError(message), 400)
  }
})
