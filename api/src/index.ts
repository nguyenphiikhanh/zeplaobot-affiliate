import { serve } from '@hono/node-server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { eq } from 'drizzle-orm'
import { config } from './config.js'
import { db } from './db/index.js'
import { linkGenerations, users } from './db/schema.js'
import { getZaloStatus, initZalo } from './zalo.js'

const app = new Hono()

const sendResponse = <T>(data: T, message: string) => ({
  success: true as const,
  data,
  message,
})

const sendSuccess = (message: string) => ({
  success: true as const,
  message,
})

const sendError = (message: string) => ({
  success: false as const,
  message,
})

const ADMIN_ACCESS_TOKEN_TTL_SECONDS = 15 * 60
const ADMIN_REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60

type AuthRole = 'admin' | 'user'

type AuthToken = {
  sub: string
  role: AuthRole
  type: 'access' | 'refresh'
  exp: number
}

const signAuthToken = (payload: AuthToken) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', config.authTokenSecret)
    .update(encodedPayload)
    .digest('base64url')

  return `${encodedPayload}.${signature}`
}

const verifyAuthToken = (token: string, expectedType: AuthToken['type']) => {
  if (!config.authTokenSecret) return null

  const [encodedPayload, signature, extra] = token.split('.')
  if (!encodedPayload || !signature || extra) return null

  const expectedSignature = createHmac('sha256', config.authTokenSecret)
    .update(encodedPayload)
    .digest()

  let suppliedSignature: Buffer
  try {
    suppliedSignature = Buffer.from(signature, 'base64url')
  } catch {
    return null
  }

  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8'),
    ) as AuthToken

    const validRole = payload.role === 'admin' || payload.role === 'user'
    const isValid =
      Boolean(payload.sub) &&
      validRole &&
      payload.type === expectedType &&
      payload.exp > Math.floor(Date.now() / 1000)

    return isValid ? payload : null
  } catch {
    return null
  }
}

const createAuthTokens = (sub: string, role: AuthRole) => {
  const now = Math.floor(Date.now() / 1000)
  return {
    access_token: signAuthToken({
      sub,
      role,
      type: 'access',
      exp: now + ADMIN_ACCESS_TOKEN_TTL_SECONDS,
    }),
    refresh_token: signAuthToken({
      sub,
      role,
      type: 'refresh',
      exp: now + ADMIN_REFRESH_TOKEN_TTL_SECONDS,
    }),
    expires_in: ADMIN_ACCESS_TOKEN_TTL_SECONDS,
  }
}

app.use(
  '/api/*',
  cors({
    origin: config.appUrl,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

// Fast in-memory cache for subId -> targetUrl (sub-millisecond redirect response)
const linkCache = new Map<string, string>()

app.get('/', (c) =>
  c.json(sendResponse({ service: 'zalo-mvp' }, 'Request successful')),
)

app.get('/health', (c) =>
  c.json(sendResponse({ zalo: getZaloStatus() }, 'Service is healthy')),
)

app.get('/api/zalo/status', (c) =>
  c.json(sendResponse(getZaloStatus(), 'Zalo status retrieved successfully')),
)

app.post('/api/admin/login', async (c) => {
  if (!config.adminPassCode) {
    console.error('[ADMIN] ADMIN_PASS_CODE is not configured')
    return c.json(sendError('Admin login is not configured'), 503)
  }

  let body: { passcode?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid request body'), 400)
  }

  if (typeof body.passcode !== 'string' || !body.passcode) {
    return c.json(sendError('Passcode is required'), 400)
  }

  const isValid = await bcrypt.compare(body.passcode, config.adminPassCode)
  if (!isValid) {
    return c.json(sendError('Passcode is incorrect'), 401)
  }

  return c.json(
    sendResponse(
      createAuthTokens('admin', 'admin'),
      'Admin login successful',
    ),
  )
})

app.post('/api/login', async (c) => {
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

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      trackingCode: users.trackingCode,
    })
    .from(users)
    .where(eq(users.trackingCode, trackingCode))
    .limit(1)

  if (!user) {
    return c.json(sendError('Tracking code is incorrect'), 401)
  }

  const role: AuthRole = 'user'
  return c.json(
    sendResponse(
      {
        ...createAuthTokens(user.id, role),
        user: {
          id: user.id,
          name: user.name,
          role,
          tracking_code: user.trackingCode,
        },
      },
      'Login successful',
    ),
  )
})

app.post('/api/refresh', async (c) => {
  let body: { refresh_token?: unknown }
  try {
    body = await c.req.json()
  } catch {
    return c.json(sendError('Invalid request body'), 400)
  }

  const refreshPayload =
    typeof body.refresh_token === 'string'
      ? verifyAuthToken(body.refresh_token, 'refresh')
      : null
  if (!refreshPayload) {
    return c.json(sendError('Invalid or expired refresh token'), 401)
  }

  return c.json(
    sendResponse(
      {
        access_token: signAuthToken({
          sub: refreshPayload.sub,
          role: refreshPayload.role,
          type: 'access',
          exp: Math.floor(Date.now() / 1000) + ADMIN_ACCESS_TOKEN_TTL_SECONDS,
        }),
        expires_in: ADMIN_ACCESS_TOKEN_TTL_SECONDS,
      },
      'Access token refreshed successfully',
    ),
  )
})

app.get('/api/admin/session', (c) => {
  const authorization = c.req.header('Authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''

  const payload = verifyAuthToken(token, 'access')
  if (!payload || payload.role !== 'admin') {
    return c.json(sendError('Unauthorized'), 401)
  }

  return c.json(sendSuccess('Authenticated'))
})

app.get('/api/session', (c) => {
  const authorization = c.req.header('Authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  const payload = verifyAuthToken(token, 'access')

  if (!payload) {
    return c.json(sendError('Unauthorized'), 401)
  }

  return c.json(
    sendResponse(
      { user: { id: payload.sub, role: payload.role } },
      'Authenticated',
    ),
  )
})

// High-speed short link redirect route
app.get('/s/:subId', async (c) => {
  const subId = c.req.param('subId')
  if (!subId) {
    return c.json(sendError('Invalid subId'), 400)
  }

  // 1. Instant lookup from in-memory cache
  const cachedUrl = linkCache.get(subId)
  if (cachedUrl) {
    return c.redirect(cachedUrl, 302)
  }

  // 2. Optimized database lookup selecting only affiliateLink column
  try {
    const [record] = await db
      .select({ affiliateLink: linkGenerations.affiliateLink })
      .from(linkGenerations)
      .where(eq(linkGenerations.subId, subId))
      .limit(1)

    if (record?.affiliateLink) {
      linkCache.set(subId, record.affiliateLink)
      return c.redirect(record.affiliateLink, 302)
    }
  } catch (error) {
    console.error(`[Redirect] Error looking up subId ${subId}:`, error)
  }

  return c.json(sendError('Link not found'), 404)
})

app.onError((error, c) => {
  console.error('[HTTP] Unhandled error:', error)
  return c.json(sendError('Internal server error'), 500)
})

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[HTTP] Listening on http://localhost:${info.port}`)
})

initZalo().catch((error) => {
  console.error('[ZALO] Startup failed:', error)
})

