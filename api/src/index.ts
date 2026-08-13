import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from './config.js'
import { authRoutes } from './routes/auth.routes.js'
import { orderRoutes } from './routes/order.routes.js'
import { redirectRoutes } from './routes/redirect.routes.js'
import { shopeeConfigRoutes } from './routes/shopee-config.routes.js'
import { zaloConfigRoutes } from './routes/zalo-config.routes.js'
import { linkHistoryRoutes } from './routes/link-history.routes.js'
import { transactionRoutes } from './routes/transaction.routes.js'
import { userPortalRoutes } from './routes/user-portal.routes.js'
import { siteConfigRoutes } from './routes/site-config.routes.js'
import { sendError, sendResponse } from './utils/response.js'
import { getZaloStatus } from './zalo.js'

const app = new Hono()

// Global CORS Middleware
app.use(
  '/api/*',
  cors({
    origin: config.appUrl,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
  }),
)

// System Health Routes
app.get('/', (c) =>
  c.json(sendResponse({ service: 'zalo-mvp' }, 'Request successful')),
)

app.get('/health', (c) =>
  c.json(sendResponse({ zalo: getZaloStatus() }, 'Service is healthy')),
)

app.get('/api/zalo/status', (c) => {
  const status = getZaloStatus()
  return c.json(sendResponse({
    connected: status.connected,
    connecting: status.connecting,
    listenerStartedAt: status.listenerStartedAt,
  }, 'Zalo status retrieved successfully'))
})

// Mount Route Modules
app.route('/api', authRoutes)
app.route('/api', orderRoutes)
app.route('/api', shopeeConfigRoutes)
app.route('/api', zaloConfigRoutes)
app.route('/api', linkHistoryRoutes)
app.route('/api', transactionRoutes)
app.route('/api', userPortalRoutes)
app.route('/api', siteConfigRoutes)
app.route('/', redirectRoutes)

// Global Error Handler
app.onError((error, c) => {
  console.error('[HTTP] Unhandled error:', error)
  return c.json(sendError('Internal server error'), 500)
})

// Start HTTP Server
serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[HTTP] Listening on http://localhost:${info.port}`)
})

