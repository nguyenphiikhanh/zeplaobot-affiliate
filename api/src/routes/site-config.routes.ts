import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getSiteSettings, saveSiteSettings } from '../services/site-config.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const siteConfigRoutes = new Hono()

// Helper to parse base64 data uri into buffer and content-type
const parseBase64Image = (dataUri?: string) => {
  if (!dataUri || !dataUri.startsWith('data:image/')) return null
  const parts = dataUri.split(';base64,')
  if (parts.length !== 2) return null
  const contentType = parts[0].replace('data:', '').trim()
  const base64Data = parts[1].trim()
  return {
    contentType,
    buffer: Buffer.from(base64Data, 'base64')
  }
}

// 1. Dynamic Web Manifest for PWA
siteConfigRoutes.get('/manifest.webmanifest', async (c) => {
  try {
    const settings = await getSiteSettings()
    const name = settings.site_name || 'Hoàn Tiền'
    const description = settings.site_description || 'Hoàn tiền khi mua sắm trực tuyến'

    const manifest = {
      name: name,
      short_name: name,
      description: description,
      lang: 'vi',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait-primary',
      background_color: '#ffffff',
      theme_color: '#ee4d2d',
      icons: [
        {
          src: '/api/site-logo.png',
          sizes: '500x500',
          type: 'image/png',
          purpose: 'any'
        }
      ]
    }

    return c.json(manifest, 200, {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    })
  } catch (error) {
    console.error('[Manifest] Failed to generate:', error)
    return c.json({ error: 'Failed to generate manifest' }, 500)
  }
})

// 2. Dynamic PWA & Site Logo Image Endpoint
siteConfigRoutes.get('/site-logo.png', async (c) => {
  try {
    const settings = await getSiteSettings()
    const parsed = parseBase64Image(settings.logo_url || settings.favicon_url)
    
    if (parsed) {
      return c.body(parsed.buffer, 200, {
        'Content-Type': parsed.contentType,
        'Cache-Control': 'public, max-age=3600'
      })
    }

    return c.redirect('/logo/logo.png', 302)
  } catch (error) {
    console.error('[Site Logo] Failed to serve:', error)
    return c.redirect('/logo/logo.png', 302)
  }
})

// 3. Dynamic Site Favicon Image Endpoint
siteConfigRoutes.get('/site-favicon.ico', async (c) => {
  try {
    const settings = await getSiteSettings()
    const parsed = parseBase64Image(settings.favicon_url || settings.logo_url)
    
    if (parsed) {
      return c.body(parsed.buffer, 200, {
        'Content-Type': parsed.contentType,
        'Cache-Control': 'public, max-age=3600'
      })
    }

    return c.redirect('/logo/logo.png', 302)
  } catch (error) {
    console.error('[Favicon] Failed to serve:', error)
    return c.redirect('/logo/logo.png', 302)
  }
})

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
    c.header('Cache-Control', 'no-cache, no-store, must-revalidate')
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
