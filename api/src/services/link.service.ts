import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { linkGenerations } from '../db/schema.js'

// Fast in-memory cache for subId -> targetUrl (sub-millisecond redirect response)
export const linkCache = new Map<string, string>()

export const getRedirectUrl = async (subId: string): Promise<string | null> => {
  if (!subId) return null

  // 1. Instant lookup from in-memory cache
  const cachedUrl = linkCache.get(subId)
  if (cachedUrl) {
    return cachedUrl
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
      return record.affiliateLink
    }
  } catch (error) {
    console.error(`[Redirect] Error looking up subId ${subId}:`, error)
  }

  return null
}
