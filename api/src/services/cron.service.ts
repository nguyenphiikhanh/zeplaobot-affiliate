import cron from 'node-cron'
import { syncShopeeOrdersDirectService } from './order.service.js'

let isSyncing = false

/**
 * Initializes cron job for Shopee Order Sync.
 * Schedule: 08:00, 12:00, 16:00, 20:00 (every 4 hours during daytime/operational hours).
 * Timezone: Asia/Ho_Chi_Minh (GMT+7)
 */
export const initOrderSyncCron = () => {
  // Cron expression: minute 0 of hours 8, 12, 16, 20
  const cronExpression = '0 8,12,16,20 * * *'

  const task = cron.schedule(
    cronExpression,
    async () => {
      if (isSyncing) {
        console.log('[CRON] Skip Shopee order sync: Previous sync task is still running.')
        return
      }

      isSyncing = true
      const startTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
      console.log(`[CRON] [${startTime}] Triggering scheduled Shopee order sync...`)

      try {
        const result = await syncShopeeOrdersDirectService()
        console.log(`[CRON] [${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}] Sync complete:`, result.message)
      } catch (error) {
        console.error('[CRON] Error executing Shopee order sync job:', error)
      } finally {
        isSyncing = false
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh',
    }
  )

  console.log('[CRON] Initialized Shopee Order Sync cron job (08:00, 12:00, 16:00, 20:00 - Asia/Ho_Chi_Minh)')
  return task
}
