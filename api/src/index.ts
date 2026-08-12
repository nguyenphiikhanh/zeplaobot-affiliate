import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from './config.js'
import { authRoutes } from './routes/auth.routes.js'
import { redirectRoutes } from './routes/redirect.routes.js'
import { sendError, sendResponse } from './utils/response.js'
import { getZaloStatus, initZalo } from './zalo.js'

const app = new Hono()

// Global CORS Middleware
app.use(
  '/api/*',
  cors({
    origin: config.appUrl,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
  }),
)

// System Health Routes
app.get('/', (c) =>
  c.json(sendResponse({ service: 'zalo-mvp' }, 'Request successful')),
)

app.get('/health', (c) =>
  c.json(sendResponse({ zalo: getZaloStatus() }, 'Service is healthy')),
)

app.get('/api/zalo/status', (c) =>
  c.json(sendResponse(getZaloStatus(), 'Zalo status retrieved successfully')),
)

// Mount Route Modules
app.route('/api', authRoutes)
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

// Initialize Background Services
initZalo().catch((error) => {
  console.error('[ZALO] Startup failed:', error)
})
