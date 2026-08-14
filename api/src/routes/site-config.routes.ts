import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getSiteSettings, saveSiteSettings } from '../services/site-config.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const siteConfigRoutes = new Hono()

const requireAdmin = async (c: any, next: () => Promise<void>) => {
  try {
    const user = await getSessionUserService(c.req.header('Authorization') || '')
    if (user.role !== 'admin') return c.json(sendError('Unauthorized - Admin access required'), 403)
    await next()
  } catch { return c.json(sendError('Unauthorized'), 401) }
}

// Public GET for site title & SEO meta
siteConfigRoutes.get('/site-config', async (c) => {
  try {
    return c.json(sendResponse(await getSiteSettings(), 'Đã tải cấu hình trang web'))
  } catch (error) {
    console.error('[Site Config] Load failed:', error)
    return c.json(sendError('Không thể tải cấu hình trang web'), 500)
  }
})

// Admin routes for managing site configuration
siteConfigRoutes.use('/admin/site-config', requireAdmin)
siteConfigRoutes.use('/admin/site-config/*', requireAdmin)

siteConfigRoutes.get('/admin/site-config', async (c) => {
  try {
    return c.json(sendResponse(await getSiteSettings(), 'Đã tải cấu hình hệ thống'))
  } catch (error) {
    console.error('[Site Config] Load failed:', error)
    return c.json(sendError('Không thể tải cấu hình hệ thống'), 500)
  }
})

siteConfigRoutes.put('/admin/site-config', async (c) => {
  try {
    const body = await c.req.json()
    const updated = await saveSiteSettings(body)
    return c.json(sendResponse(updated, 'Lưu cấu hình hệ thống thành công'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lưu cấu hình hệ thống'
    return c.json(sendError(message), 400)
  }
})
