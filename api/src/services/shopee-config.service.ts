import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const SETTINGS_KEY = 'shopee_settings'
const COOKIE_KEY = 'shopee_cookie'

export interface ShopeeSettings {
  platform_enabled: boolean
  service_fee_rate: number
  tax_rate: number
  user_share_percentage: number
  zalo_notify_on_expired: boolean
  zalo_phone_number: string
  zalo_notify_content: string
}

const defaultSettings: ShopeeSettings = {
  platform_enabled: true,
  service_fee_rate: 1,
  tax_rate: 10,
  user_share_percentage: 80,
  zalo_notify_on_expired: true,
  zalo_phone_number: '',
  zalo_notify_content: '⚠️ Cảnh báo: Shopee Cookie đã hết hạn. Vui lòng truy cập trang Admin để cập nhật Cookie mới!',
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

const percent = (value: unknown, name: string) => {
  const number = Number(value)
  if (!Number.isFinite(number) || number < 0 || number > 100) throw new Error(`${name} phải nằm trong khoảng 0–100`)
  return number
}

export const getShopeeSettings = async (): Promise<ShopeeSettings> => {
  const stored = await readJson<Partial<ShopeeSettings>>(SETTINGS_KEY)
  return { ...defaultSettings, ...(stored || {}) }
}

export const saveShopeeSettings = async (input: Partial<ShopeeSettings>) => {
  const current = await getShopeeSettings()
  const settings: ShopeeSettings = {
    platform_enabled: typeof input.platform_enabled === 'boolean' ? input.platform_enabled : current.platform_enabled,
    service_fee_rate: percent(input.service_fee_rate, 'Phí dịch vụ'),
    tax_rate: percent(input.tax_rate, 'Thuế'),
    user_share_percentage: percent(input.user_share_percentage, 'Tỷ lệ chia sẻ'),
    zalo_notify_on_expired: typeof input.zalo_notify_on_expired === 'boolean' ? input.zalo_notify_on_expired : current.zalo_notify_on_expired,
    zalo_phone_number: String(input.zalo_phone_number ?? '').trim(),
    zalo_notify_content: String(input.zalo_notify_content ?? '').trim(),
  }
  await writeJson(SETTINGS_KEY, settings, 'Cấu hình vận hành Shopee')
  return settings
}

interface StoredCookie { cookie: string; updated_at: string }

export const getStoredShopeeCookie = async () => {
  const stored = await readJson<StoredCookie>(COOKIE_KEY)
  return stored?.cookie || null
}

export const getShopeeCookieStatus = async () => {
  const stored = await readJson<StoredCookie>(COOKIE_KEY)
  if (!stored?.cookie || !stored.updated_at) return 'Cookie chưa được cấu hình.'
  const updatedAt = new Date(stored.updated_at)
  if (Number.isNaN(updatedAt.getTime())) return 'Cookie đã được cấu hình.'
  const expiresAt = updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000
  const remainingDays = Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000))
  return remainingDays > 0
    ? `Cookie đã được cấu hình. Còn khoảng ${remainingDays} ngày.`
    : 'Cookie đã hết hạn. Vui lòng cập nhật cookie mới.'
}

export const saveShopeeCookie = async (cookie: string) => {
  const normalized = cookie.trim()
  if (!normalized) throw new Error('Cookie Shopee không được để trống')
  await writeJson(COOKIE_KEY, { cookie: normalized, updated_at: new Date().toISOString() }, 'Cookie Shopee dùng cho tác vụ tự động')
  return getShopeeCookieStatus()
}
