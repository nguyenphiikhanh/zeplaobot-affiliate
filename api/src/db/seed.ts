import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db, poolConnection } from './index.js'
import { systemConfigs } from './schema.js'
import { defaultShopeeSettings } from '../services/shopee-config.service.js'
import { defaultZaloBotSettings } from '../services/zalo-config.service.js'
import { defaultSiteSettings } from '../services/site-config.service.js'
import { defaultWithdrawalSettings } from '../services/withdrawal-config.service.js'

async function seedDefaultConfigs() {
  const defaultAdminPassHash = await bcrypt.hash('KhanhNT', 10)
  const defaultAuthSecret = randomBytes(32).toString('hex')

  const defaultConfigs = [
    {
      key: 'shopee_settings',
      defaultValue: {
        ...defaultShopeeSettings,
        zalo_notify_on_expired: false,
      },
      isJson: true,
      description: 'Cấu hình vận hành Shopee',
    },
    {
      key: 'zalo_bot_settings',
      defaultValue: defaultZaloBotSettings,
      isJson: true,
      description: 'Cấu hình Bot Zalo',
    },
    {
      key: 'site_settings',
      defaultValue: defaultSiteSettings,
      isJson: true,
      description: 'Cấu hình hệ thống website & SEO',
    },
    {
      key: 'withdrawal_settings',
      defaultValue: defaultWithdrawalSettings,
      isJson: true,
      description: 'Cấu hình rút tiền',
    },
    {
      key: 'admin_passcode',
      defaultValue: defaultAdminPassHash,
      isJson: false,
      description: 'Mật khẩu đăng nhập quản trị (bcrypt hash)',
    },
    {
      key: 'auth_token_secret',
      defaultValue: defaultAuthSecret,
      isJson: false,
      description: 'Secret key dùng để ký Auth Token',
    },
  ]

  // Query existing configs to safely preserve any user-configured values (e.g. affiliate_id, custom password)
  const existingRows = await db.select().from(systemConfigs)
  const existingMap = new Map(existingRows.map((r) => [r.key, r.value]))

  for (const config of defaultConfigs) {
    const existingValue = existingMap.get(config.key)

    if (existingValue === undefined || existingValue === null) {
      // Key does not exist yet -> Insert default value
      const stringValue = config.isJson
        ? JSON.stringify(config.defaultValue)
        : String(config.defaultValue)

      await db.insert(systemConfigs).values({
        key: config.key,
        value: stringValue,
        description: config.description,
      })
      console.log(`[Seed] Created new config: ${config.key}`)
    } else if (config.isJson) {
      // Key exists and is JSON -> Safely merge defaults with existing values (existing values take precedence)
      try {
        const existingObj = JSON.parse(existingValue)
        const mergedObj = {
          ...(typeof config.defaultValue === 'object' ? config.defaultValue : {}),
          ...existingObj,
        }
        const mergedString = JSON.stringify(mergedObj)

        await db
          .update(systemConfigs)
          .set({
            value: mergedString,
            description: config.description,
            updatedAt: new Date(),
          })
          .where(eq(systemConfigs.key, config.key))

        console.log(`[Seed] Preserved & merged existing config: ${config.key}`)
      } catch {
        console.log(`[Seed] Kept raw existing config: ${config.key}`)
      }
    } else {
      // Non-JSON existing keys (like existing admin_passcode or auth_token_secret) -> Do not overwrite
      console.log(`[Seed] Kept existing value for: ${config.key}`)
    }
  }

  console.log(`\n✅ Seeded/verified system configurations successfully without overwriting existing data.`)
}

try {
  await seedDefaultConfigs()
} finally {
  await poolConnection.end()
}

