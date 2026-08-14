import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const SETTINGS_KEY = 'site_settings'

export interface SiteSettings {
  site_name: string
  site_description: string
  meta_title: string
  meta_description: string
  keywords?: string
}

export const defaultSiteSettings: SiteSettings = {
  site_name: 'Affiliate - Hoàn tiền Mua sắm',
  site_description: 'Nền tảng hoàn tiền mua sắm tự động hàng đầu Việt Nam. Tối ưu hoa hồng Shopee nhanh chóng và minh bạch.',
  meta_title: 'Affiliate - Hoàn tiền Mua sắm',
  meta_description: 'Nền tảng hoàn tiền mua sắm tự động hàng đầu Việt Nam. Tối ưu hoa hồng Shopee nhanh chóng và minh bạch.',
  keywords: 'hoàn tiền shopee, affiliate shopee, nhận hoa hồng shopee, hoàn tiền mua sắm',
}

const readJson = async <T>(key: string): Promise<T | null> => {
  const [record] = await db.select({ value: systemConfigs.value })
    .from(systemConfigs).where(eq(systemConfigs.key, key)).limit(1)
  if (!record?.value) return null
  try { return JSON.parse(record.value) as T } catch { return null }
}

const writeJson = async (key: string, value: unknown, description: string) => {
  const encoded = JSON.stringify(value)
  await db.insert(systemConfigs).values({ key, value: encoded, description })
    .onDuplicateKeyUpdate({ set: { value: encoded, description, updatedAt: new Date() } })
}

export const getSiteSettings = async (): Promise<SiteSettings> => {
  const stored = await readJson<Partial<SiteSettings>>(SETTINGS_KEY)
  return { ...defaultSiteSettings, ...(stored || {}) }
}

export const saveSiteSettings = async (input: Partial<SiteSettings>): Promise<SiteSettings> => {
  const current = await getSiteSettings()
  const updated: SiteSettings = {
    site_name: String(input.site_name ?? current.site_name).trim(),
    site_description: String(input.site_description ?? current.site_description).trim(),
    meta_title: String(input.meta_title ?? current.meta_title).trim(),
    meta_description: String(input.meta_description ?? current.meta_description).trim(),
    keywords: String(input.keywords ?? current.keywords ?? '').trim(),
  }

  await writeJson(SETTINGS_KEY, updated, 'Cấu hình hệ thống website & SEO')
  return updated
}
