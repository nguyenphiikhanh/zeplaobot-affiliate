import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { config } from './config.js'
import { db } from './db/index.js'
import { linkGenerations } from './db/schema.js'
import { getZaloStatus, initZalo } from './zalo.js'

const app = new Hono()

// Fast in-memory cache for subId -> targetUrl (sub-millisecond redirect response)
const linkCache = new Map<string, string>()

app.get('/', (c) => c.json({ ok: true, service: 'zalo-mvp' }))

app.get('/health', (c) => c.json({ ok: true, zalo: getZaloStatus() }))

app.get('/api/zalo/status', (c) => c.json({ ok: true, data: getZaloStatus() }))

// High-speed short link redirect route
app.get('/s/:subId', async (c) => {
  const subId = c.req.param('subId')
  if (!subId) {
    return c.json({ ok: false, message: 'Invalid subId' }, 400)
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

  return c.json({ ok: false, message: 'Link not found' }, 404)
})

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

