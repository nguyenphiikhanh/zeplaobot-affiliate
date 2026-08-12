import { ThreadType } from 'zca-js'
import { claimShopeeCookieErrorNotification, getShopeeSettings } from './shopee-config.service.js'

interface ZaloDirectMessageApi {
  findUser(phoneNumber: string): Promise<{ uid: string }>
  sendMessage(message: string, threadId: string, type?: ThreadType): Promise<unknown>
}

let zaloApi: ZaloDirectMessageApi | null = null
let notificationInProgress = false

export const registerZaloNotificationApi = (api: ZaloDirectMessageApi) => {
  zaloApi = api
}

export const unregisterZaloNotificationApi = () => {
  zaloApi = null
}

export const notifyShopeeCookieError = async (source: string) => {
  if (notificationInProgress) return false
  notificationInProgress = true
  try {
    const settings = await getShopeeSettings()
    if (!settings.zalo_notify_on_expired) return false
    // Claim before attempting delivery, matching PHP's Cache::add behavior.
    if (!await claimShopeeCookieErrorNotification(settings.zalo_notify_repeat_hours)) return false
    if (!zaloApi) {
      console.warn('[SHOPEE] Cookie notification skipped because Zalo Bot is not logged in.')
      return false
    }
    if (!settings.zalo_phone_number || !settings.zalo_notify_content) {
      console.warn('[SHOPEE] Cookie notification is enabled but phone/content is missing.')
      return false
    }

    const user = await zaloApi.findUser(settings.zalo_phone_number)
    if (!user?.uid) {
      console.warn('[SHOPEE] Cannot resolve Zalo user from configured phone number.')
      return false
    }
    const now = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date())
    const content = settings.zalo_notify_content
      .replace(/\{source\}/g, source)
      .replace(/\{time\}/g, now)
    await zaloApi.sendMessage(content, user.uid, ThreadType.User)
    console.info(`[SHOPEE] Cookie expiration notification sent. Source: ${source}`)
    return true
  } catch (error) {
    console.error('[SHOPEE] Failed sending Cookie error notification:', error)
    return false
  } finally {
    notificationInProgress = false
  }
}
