import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { linkGenerations } from '../db/schema.js'

export const getRedirectUrl = async (subId: string): Promise<string | null> => {
  if (!subId) return null

  // Always read from the database: this project intentionally does not cache.
  try {
    const [record] = await db
      .select({ affiliateLink: linkGenerations.affiliateLink })
      .from(linkGenerations)
      .where(eq(linkGenerations.subId, subId))
      .limit(1)

    if (record?.affiliateLink) {
      return record.affiliateLink
    }
  } catch (error) {
    console.error(`[Redirect] Error looking up subId ${subId}:`, error)
  }

  return null
}
