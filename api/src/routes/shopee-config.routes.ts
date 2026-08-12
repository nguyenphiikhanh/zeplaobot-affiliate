import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getShopeeCookieStatus, getShopeeSettings, saveShopeeCookie, saveShopeeSettings } from '../services/shopee-config.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const shopeeConfigRoutes = new Hono()

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  try {
    const user = await getSessionUserService(c.req.header('Authorization') || '')
    if (user.role !== 'admin') return c.json(sendError('Unauthorized - Admin access required'), 403)
    await next()
  } catch { return c.json(sendError('Unauthorized'), 401) }
}

shopeeConfigRoutes.use('/admin/shopee-config', requireAdmin)
shopeeConfigRoutes.use('/admin/shopee-config/*', requireAdmin)

shopeeConfigRoutes.get('/admin/shopee-config', async (c) => {
  try {
    return c.json(sendResponse({ settings: await getShopeeSettings(), cookie_status: await getShopeeCookieStatus() }, 'Đã tải cấu hình Shopee'))
  } catch (error) {
    console.error('[Shopee Config] Load failed:', error)
    return c.json(sendError('Không thể tải cấu hình Shopee'), 500)
  }
})

shopeeConfigRoutes.put('/admin/shopee-config/settings', async (c) => {
  try {
    const body = await c.req.json()
    return c.json(sendResponse(await saveShopeeSettings(body), 'Lưu cấu hình Shopee thành công'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lưu cấu hình Shopee'
    return c.json(sendError(message), 400)
  }
})

shopeeConfigRoutes.put('/admin/shopee-config/cookie', async (c) => {
  try {
    const body = await c.req.json<{ cookie?: string }>()
    const status = await saveShopeeCookie(body.cookie || '')
    return c.json(sendResponse({ cookie_status: status }, 'Cập nhật Cookie Shopee thành công'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể cập nhật Cookie Shopee'
    return c.json(sendError(message), 400)
  }
})
