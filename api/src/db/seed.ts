import { db, poolConnection } from './index.js'
import { systemConfigs } from './schema.js'
import { defaultShopeeSettings } from '../services/shopee-config.service.js'
import { defaultZaloBotSettings } from '../services/zalo-config.service.js'
import { defaultSiteSettings } from '../services/site-config.service.js'

const defaultConfigs = [
  {
    key: 'shopee_settings',
    value: JSON.stringify({
      ...defaultShopeeSettings,
      // Notifications must always start disabled on a fresh installation.
      zalo_notify_on_expired: false,
    }),
    description: 'Cấu hình vận hành Shopee',
  },
  {
    key: 'zalo_bot_settings',
    value: JSON.stringify(defaultZaloBotSettings),
    description: 'Cấu hình Bot Zalo',
  },
  {
    key: 'site_settings',
    value: JSON.stringify(defaultSiteSettings),
    description: 'Cấu hình chung website & SEO',
  },
]

async function seedDefaultConfigs() {
  for (const config of defaultConfigs) {
    await db.insert(systemConfigs).values(config)
      .onDuplicateKeyUpdate({
        set: {
          value: config.value,
          description: config.description,
          updatedAt: new Date(),
        },
      })
  }
  console.log(`Seeded ${defaultConfigs.length} default system configurations.`)
}

try {
  await seedDefaultConfigs()
} finally {
  await poolConnection.end()
}
