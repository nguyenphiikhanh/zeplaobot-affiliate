import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const SETTINGS_KEY = 'tiktok_settings'

export interface TikTokSettings {
  platform_enabled: boolean
  service_fee_rate: number
  tax_rate: number
  user_share_percentage: number
  TIKTOK_BASE_API: string
  TIKTOK_BASE_API_KEY: string
  TIKTOK_BASE_API_CREATOR: string
  TIKTOK_POSTBACK_SECRET: string
}

export const defaultTikTokSettings: TikTokSettings = {
  platform_enabled: false,
  service_fee_rate: 0,
  tax_rate: 0,
  user_share_percentage: 80,
  TIKTOK_BASE_API: '',
  TIKTOK_BASE_API_KEY: '',
  TIKTOK_BASE_API_CREATOR: '',
  TIKTOK_POSTBACK_SECRET: '',
}

export const getTikTokSettings = async (): Promise<TikTokSettings> => {
  const [record] = await db.select({ value: systemConfigs.value })
    .from(systemConfigs)
    .where(eq(systemConfigs.key, SETTINGS_KEY))
    .limit(1)

  if (!record?.value) return { ...defaultTikTokSettings }

  try {
    const stored = JSON.parse(record.value) as Partial<TikTokSettings>
    return { ...defaultTikTokSettings, ...stored }
  } catch {
    return { ...defaultTikTokSettings }
  }
}

const requiredText = (value: unknown, field: string) => {
  const normalized = String(value ?? '').trim()
  if (!normalized) throw new Error(`${field} không được để trống`)
  return normalized
}

const normalizeBaseApi = (value: unknown) => {
  const normalized = requiredText(value, 'TIKTOK_BASE_API').replace(/\/+$/, '')
  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    throw new Error('TIKTOK_BASE_API phải là URL hợp lệ')
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('TIKTOK_BASE_API phải sử dụng giao thức HTTP hoặc HTTPS')
  }
  return normalized
}

const percent = (value: unknown, name: string) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 100) {
    throw new Error(`${name} phải nằm trong khoảng 0–100`)
  }
  return number
}

export const saveTikTokSettings = async (input: Partial<TikTokSettings>) => {
  const current = await getTikTokSettings()
  const platformEnabled = typeof input.platform_enabled === 'boolean'
    ? input.platform_enabled
    : current.platform_enabled

  const settings: TikTokSettings = {
    platform_enabled: platformEnabled,
    service_fee_rate: percent(input.service_fee_rate ?? current.service_fee_rate, 'Phí dịch vụ'),
    tax_rate: percent(input.tax_rate ?? current.tax_rate, 'Thuế'),
    user_share_percentage: percent(input.user_share_percentage ?? current.user_share_percentage, 'Tỷ lệ chia sẻ người dùng'),
    TIKTOK_BASE_API: String(input.TIKTOK_BASE_API ?? current.TIKTOK_BASE_API).trim().replace(/\/+$/, ''),
    TIKTOK_BASE_API_KEY: String(input.TIKTOK_BASE_API_KEY ?? current.TIKTOK_BASE_API_KEY).trim(),
    TIKTOK_BASE_API_CREATOR: String(input.TIKTOK_BASE_API_CREATOR ?? current.TIKTOK_BASE_API_CREATOR).trim(),
    TIKTOK_POSTBACK_SECRET: String(input.TIKTOK_POSTBACK_SECRET ?? current.TIKTOK_POSTBACK_SECRET).trim(),
  }

  if (settings.TIKTOK_BASE_API) settings.TIKTOK_BASE_API = normalizeBaseApi(settings.TIKTOK_BASE_API)

  if (settings.platform_enabled) {
    settings.TIKTOK_BASE_API = normalizeBaseApi(settings.TIKTOK_BASE_API)
    settings.TIKTOK_BASE_API_KEY = requiredText(settings.TIKTOK_BASE_API_KEY, 'TIKTOK_BASE_API_KEY')
    settings.TIKTOK_BASE_API_CREATOR = requiredText(settings.TIKTOK_BASE_API_CREATOR, 'TIKTOK_BASE_API_CREATOR')
    settings.TIKTOK_POSTBACK_SECRET = requiredText(settings.TIKTOK_POSTBACK_SECRET, 'TIKTOK_POSTBACK_SECRET')
  }

  const encoded = JSON.stringify(settings)
  await db.insert(systemConfigs)
    .values({ key: SETTINGS_KEY, value: encoded, description: 'Cấu hình vận hành TikTok Shop' })
    .onDuplicateKeyUpdate({
      set: { value: encoded, description: 'Cấu hình vận hành TikTok Shop', updatedAt: new Date() },
    })

  return settings
}
