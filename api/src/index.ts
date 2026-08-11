import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { config } from './config.js'
import { getZaloStatus, initZalo } from './zalo.js'

const app = new Hono()

app.get('/', (c) => c.json({ ok: true, service: 'zalo-mvp' }))

app.get('/health', (c) => c.json({ ok: true, zalo: getZaloStatus() }))

app.get('/api/zalo/status', (c) => c.json({ ok: true, data: getZaloStatus() }))

app.onError((error, c) => {
  console.error('[HTTP] Unhandled error:', error)
  return c.json({ ok: false, message: 'Internal server error' }, 500)
})

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`[HTTP] Listening on http://localhost:${info.port}`)
})

initZalo().catch((error) => {
  console.error('[ZALO] Startup failed:', error)
})
