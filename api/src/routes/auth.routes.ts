import { Hono } from 'hono'
import {
  changeAdminPasswordService,
  getSessionUserService,
  loginAdminService,
  loginUserService,
  refreshAccessTokenService,
} from '../services/auth.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const authRoutes = new Hono()

authRoutes.post('/admin/login', async (c) => {
  let body: { passcode?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid request body'), 400)
  }

  if (typeof body.passcode !== 'string' || !body.passcode) {
    return c.json(sendError('Passcode is required'), 400)
  }

  try {
    const tokens = await loginAdminService(body.passcode)
    return c.json(sendResponse(tokens, 'Admin login successful'))
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    return c.json(sendError(error.message || 'Login failed'), (error.status || 500) as any)
  }
})

authRoutes.post('/admin/change-password', async (c) => {
  const authorization = c.req.header('Authorization') || ''
  try {
    const userInfo = await getSessionUserService(authorization)
    if (userInfo.role !== 'admin') {
      return c.json(sendError('Unauthorized - Quyền quản trị viên yêu cầu'), 403)
    }
  } catch {
    return c.json(sendError('Unauthorized'), 401)
  }

  let body: { current_password?: unknown; new_password?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid request body'), 400)
  }

  const currentPass = typeof body.current_password === 'string' ? body.current_password : ''
  const newPass = typeof body.new_password === 'string' ? body.new_password : ''

  if (!currentPass || !newPass) {
    return c.json(sendError('Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới'), 400)
  }

  try {
    await changeAdminPasswordService(currentPass, newPass)
    return c.json(sendResponse(null, 'Đổi mật khẩu quản trị thành công'))
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    return c.json(sendError(error.message || 'Đổi mật khẩu thất bại'), (error.status || 400) as any)
  }
})

authRoutes.post('/login', async (c) => {
  let body: { tracking_code?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid request body'), 400)
  }

  const trackingCode =
    typeof body.tracking_code === 'string' ? body.tracking_code.trim() : ''
  if (!trackingCode) {
    return c.json(sendError('Tracking code is required'), 400)
  }

  try {
    const loginData = await loginUserService(trackingCode)
    return c.json(sendResponse(loginData, 'Login successful'))
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    return c.json(sendError(error.message || 'Login failed'), (error.status || 500) as any)
  }
})

authRoutes.post('/refresh', async (c) => {
  let body: { refresh_token?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid request body'), 400)
  }

  if (typeof body.refresh_token !== 'string' || !body.refresh_token) {
    return c.json(sendError('Refresh token is required'), 400)
  }

  try {
    const tokens = await refreshAccessTokenService(body.refresh_token)
    return c.json(sendResponse(tokens, 'Access token refreshed successfully'))
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    return c.json(sendError(error.message || 'Refresh failed'), (error.status || 500) as any)
  }
})

authRoutes.get('/session', async (c) => {
  const authorization = c.req.header('Authorization') || ''
  try {
    const userInfo = await getSessionUserService(authorization)
    return c.json(sendResponse({ user: userInfo }, 'Authenticated'))
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    return c.json(sendError(error.message || 'Unauthorized'), (error.status || 401) as any)
  }
})

authRoutes.get('/admin/session', async (c) => {
  const authorization = c.req.header('Authorization') || ''
  try {
    const userInfo = await getSessionUserService(authorization)
    if (userInfo.role !== 'admin') {
      return c.json(sendError('Unauthorized'), 401)
    }
    return c.json(sendResponse({ user: userInfo }, 'Authenticated'))
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string }
    return c.json(sendError(error.message || 'Unauthorized'), (error.status || 401) as any)
  }
})

