import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { poolConnection } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const SETTINGS_KEY = 'shopee_settings'
const COOKIE_KEY = 'shopee_cookie'
const COOKIE_NOTIFICATION_STATE_KEY = 'shopee_cookie_notification_state'
const NOTIFY_REPEAT_HOUR_OPTIONS = [1, 3, 6, 24] as const

export interface ShopeeSettings {
  platform_enabled: boolean
  service_fee_rate: number
  tax_rate: number
  user_share_percentage: number
  zalo_notify_on_expired: boolean
  zalo_phone_number: string
  zalo_notify_content: string
  zalo_notify_repeat_hours: number
}

const defaultSettings: ShopeeSettings = {
  platform_enabled: true,
  service_fee_rate: 1,
  tax_rate: 10,
  user_share_percentage: 80,
  zalo_notify_on_expired: false,
  zalo_phone_number: '',
  zalo_notify_content: '⚠️ Cảnh báo: Shopee Cookie đã hết hạn. Vui lòng truy cập trang Admin để cập nhật Cookie mới!',
  zalo_notify_repeat_hours: 3,
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
  const settings = { ...defaultSettings, ...(stored || {}) }
  if (!settings.zalo_phone_number?.trim()) settings.zalo_notify_on_expired = false
  return settings
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
    zalo_notify_repeat_hours: NOTIFY_REPEAT_HOUR_OPTIONS.includes(Number(input.zalo_notify_repeat_hours ?? current.zalo_notify_repeat_hours) as 1 | 3 | 6 | 24)
      ? Number(input.zalo_notify_repeat_hours ?? current.zalo_notify_repeat_hours)
      : 3,
  }
  if (settings.zalo_notify_on_expired && !settings.zalo_phone_number) {
    throw new Error('Vui lòng nhập số điện thoại Zalo khi bật gửi thông báo')
  }
  await writeJson(SETTINGS_KEY, settings, 'Cấu hình vận hành Shopee')
  return settings
}

interface StoredCookie { cookie: string; updated_at: string }

export const getStoredShopeeCookie = async () => {
  const stored = await readJson<StoredCookie>(COOKIE_KEY)
  return stored?.cookie || null
}

export const getStoredShopeeCookieData = async () => readJson<StoredCookie>(COOKIE_KEY)

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
  await writeJson(COOKIE_NOTIFICATION_STATE_KEY, { notified: false, notified_at: null }, 'Trạng thái gửi cảnh báo Cookie Shopee')
  return getShopeeCookieStatus()
}

// Database equivalent of Laravel Cache::add: only one caller can claim the notification lock.
export const claimShopeeCookieErrorNotification = async (repeatHours: number) => {
  const safeRepeatHours = NOTIFY_REPEAT_HOUR_OPTIONS.includes(Number(repeatHours) as 1 | 3 | 6 | 24)
    ? Number(repeatHours)
    : 3
  const retryAfter = new Date(Date.now() - safeRepeatHours * 60 * 60 * 1000)
  const connection = await poolConnection.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute(
      `INSERT IGNORE INTO system_configs (\`key\`, value, description, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [COOKIE_NOTIFICATION_STATE_KEY, JSON.stringify({ notified: false, notified_at: null }), 'Trạng thái gửi cảnh báo Cookie Shopee'],
    )
    const [result] = await connection.execute(
      `UPDATE system_configs
       SET value = ?, updated_at = NOW()
       WHERE \`key\` = ?
         AND (
           JSON_EXTRACT(value, '$.notified') IS NULL
           OR JSON_UNQUOTE(JSON_EXTRACT(value, '$.notified')) = 'false'
           OR updated_at < ?
         )`,
      [JSON.stringify({ notified: true, notified_at: new Date().toISOString() }), COOKIE_NOTIFICATION_STATE_KEY, retryAfter],
    )
    await connection.commit()
    return Number((result as { affectedRows?: number }).affectedRows || 0) === 1
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}
