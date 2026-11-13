import { createHmac, timingSafeEqual } from 'node:crypto'
import { Hono } from 'hono'
import { getTikTokSettings } from '../services/tiktok-config.service.js'
import { syncTikTokOrderFromPostback } from '../services/tiktok-postback.service.js'
import { sendError, sendResponse } from '../utils/response.js'

export const tiktokPostbackRoutes = new Hono()

const validSignature = (rawBody: string, header: string, secret: string) => {
  const parts = new URLSearchParams(header.replace(/,/g, '&'))
  const timestamp = parts.get('t') || ''
  const signature = parts.get('v1') || ''
  if (!timestamp || !/^[a-f0-9]{64}$/i.test(signature)) return false
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  const signatureBuffer = Buffer.from(signature, 'hex')
  return expectedBuffer.length === signatureBuffer.length
    && timingSafeEqual(expectedBuffer, signatureBuffer)
}

tiktokPostbackRoutes.post('/postback/sync/tiktok', async c => {
  const rawBody = await c.req.raw.text()
  const signature = c.req.header('X-Riohub-Signature') || ''
  const settings = await getTikTokSettings()

  if (!settings.TIKTOK_POSTBACK_SECRET) {
    console.error('[TikTok Postback] TIKTOK_POSTBACK_SECRET is not configured.')
    return c.json(sendError('TikTok postback chưa được cấu hình'), 503)
  }
  if (!signature) return c.json(sendError('Missing signature'), 403)
  if (!validSignature(rawBody, signature, settings.TIKTOK_POSTBACK_SECRET)) {
    console.warn('[TikTok Postback] Signature verification failed.')
    return c.json(sendError('Invalid signature'), 403)
  }

  let body: { data?: { order_id?: unknown } }
  try { body = JSON.parse(rawBody) } catch { return c.json(sendError('Invalid JSON request body'), 400) }
  const orderId = String(body.data?.order_id ?? '').trim()
  if (!orderId) return c.json(sendError('order_id is required'), 422)

  // Riohub uses this synthetic order ID to verify the postback URL and
  // signature. It is not an actual order and therefore must not be fetched
  // from the /orders API.
  if (orderId.toUpperCase() === 'TEST_ORDER') {
    console.info('[TikTok Postback] Verification request accepted.')
    return c.json(sendResponse({ orderId, verified: true }, 'TikTok postback verified'))
  }

  try {
    const result = await syncTikTokOrderFromPostback(orderId)
    console.info(`[TikTok Postback] Synced order ${result.orderId} (${result.status}).`)
    return c.json(sendResponse(result, 'Đồng bộ đơn TikTok thành công'))
  } catch (error) {
    console.error(`[TikTok Postback] Failed syncing order ${orderId}:`, error)
    return c.json(sendError(error instanceof Error ? error.message : 'Không thể đồng bộ đơn TikTok'), 500)
  }
})
