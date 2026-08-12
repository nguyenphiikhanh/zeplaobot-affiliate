import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { systemConfigs } from '../db/schema.js'

const CONFIG_KEY = 'zalo_bot_settings'

export interface ZaloBotSettings {
  group_ids: string[]
  link_convert_template: string
  welcome_enabled: boolean
  welcome_template: string
}

export const defaultZaloBotSettings: ZaloBotSettings = {
  group_ids: [],
  link_convert_template: '🛒 Link hoàn tiền của bạn:\n{affiliate_link}\n\n📦 Sản phẩm: {product_name}\n💰 Hoa hồng: {commission}đ ({commission_rate}%)\n\nTiết kiệm ngay khi mua sắm qua Zalo Bot!',
  welcome_enabled: true,
  welcome_template: '👋 Chào mừng {user_name} đã tham gia nhóm {group_name}!\n\n🤖 Mình là Bot Hoàn Tiền. Hãy dán link Shopee vào nhóm để nhận ngay hoàn tiền tự động nhé! 💸',
}

export const getZaloBotSettings = async (): Promise<ZaloBotSettings> => {
  const [record] = await db.select({ value: systemConfigs.value })
    .from(systemConfigs).where(eq(systemConfigs.key, CONFIG_KEY)).limit(1)
  if (!record?.value) return defaultZaloBotSettings
  try {
    const stored = JSON.parse(record.value) as Partial<ZaloBotSettings>
    return { ...defaultZaloBotSettings, ...stored }
  } catch { return defaultZaloBotSettings }
}

export const saveZaloBotSettings = async (input: Partial<ZaloBotSettings>) => {
  const current = await getZaloBotSettings()
  const groupIds = Array.isArray(input.group_ids)
    ? [...new Set(input.group_ids.map(String).map((id) => id.trim()).filter(Boolean))]
    : current.group_ids
  const settings: ZaloBotSettings = {
    group_ids: groupIds,
    link_convert_template: String(input.link_convert_template ?? current.link_convert_template).trim(),
    welcome_enabled: typeof input.welcome_enabled === 'boolean' ? input.welcome_enabled : current.welcome_enabled,
    welcome_template: String(input.welcome_template ?? current.welcome_template).trim(),
  }
  if (!settings.link_convert_template) throw new Error('Mẫu chuyển đổi link không được để trống')
  if (settings.welcome_enabled && !settings.welcome_template) throw new Error('Mẫu chào mừng không được để trống')

  const value = JSON.stringify(settings)
  await db.insert(systemConfigs).values({ key: CONFIG_KEY, value, description: 'Cấu hình Bot Zalo' })
    .onDuplicateKeyUpdate({ set: { value, description: 'Cấu hình Bot Zalo', updatedAt: new Date() } })
  return settings
}

export const renderZaloTemplate = (template: string, variables: Record<string, string | number | null | undefined>) =>
  template.replace(/\{([a-z_]+)\}/gi, (placeholder, name: string) => {
    const value = variables[name]
    return value === undefined || value === null ? placeholder : String(value)
  })
