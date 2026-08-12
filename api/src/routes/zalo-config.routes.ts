import type { Context, Next } from 'hono'
import { Hono } from 'hono'
import { getSessionUserService } from '../services/auth.service.js'
import { getZaloBotSettings, saveZaloBotSettings } from '../services/zalo-config.service.js'
import { sendError, sendResponse } from '../utils/response.js'
import { getZaloStatus, initZalo } from '../zalo.js'

export const zaloConfigRoutes = new Hono()

zaloConfigRoutes.get('/zalo/login-command', async (c) => {
  const settings = await getZaloBotSettings()
  return c.json(sendResponse({ command: `#${settings.private_commands.tracking.command}` }, 'Đã tải lệnh lấy mã theo dõi'))
})

const requireAdmin = async (c: Context, next: Next) => {
  try {
    const user = await getSessionUserService(c.req.header('Authorization') || '')
    if (user.role !== 'admin') return c.json(sendError('Unauthorized - Admin access required'), 403)
    await next()
  } catch { return c.json(sendError('Unauthorized'), 401) }
}

zaloConfigRoutes.use('/admin/zalo-config', requireAdmin)
zaloConfigRoutes.use('/admin/zalo-config/*', requireAdmin)

zaloConfigRoutes.get('/admin/zalo-config', async (c) => {
  try { return c.json(sendResponse(await getZaloBotSettings(), 'Đã tải cấu hình Bot Zalo')) }
  catch (error) {
    console.error('[Zalo Config] Load failed:', error)
    return c.json(sendError('Không thể tải cấu hình Bot Zalo'), 500)
  }
})

zaloConfigRoutes.get('/admin/zalo-config/status', (c) =>
  c.json(sendResponse(getZaloStatus(), 'Đã kiểm tra trạng thái Bot Zalo'))
)

zaloConfigRoutes.post('/admin/zalo-config/login-qr', (c) => {
  const status = getZaloStatus()
  if (!status.connected && !status.connecting) void initZalo()
  return c.json(sendResponse(getZaloStatus(), 'Đang khởi tạo mã QR đăng nhập Zalo'))
})

zaloConfigRoutes.put('/admin/zalo-config', async (c) => {
  try {
    const body = await c.req.json()
    return c.json(sendResponse(await saveZaloBotSettings(body), 'Lưu cấu hình Bot Zalo thành công'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể lưu cấu hình Bot Zalo'
    return c.json(sendError(message), 400)
  }
})
