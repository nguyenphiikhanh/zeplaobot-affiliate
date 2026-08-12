import { Hono } from 'hono'
import { getRedirectUrl } from '../services/link.service.js'
import { sendError } from '../utils/response.js'

export const redirectRoutes = new Hono()

// High-speed short link redirect route
redirectRoutes.get('/s/:subId', async (c) => {
  const subId = c.req.param('subId')
  if (!subId) {
    return c.json(sendError('Invalid subId'), 400)
  }

  const targetUrl = await getRedirectUrl(subId)
  if (targetUrl) {
    return c.redirect(targetUrl, 302)
  }

  return c.json(sendError('Link not found'), 404)
})
