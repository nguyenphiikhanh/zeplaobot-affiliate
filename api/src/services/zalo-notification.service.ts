import { ThreadType } from 'zca-js'
import { claimShopeeCookieErrorNotification, getShopeeSettings } from './shopee-config.service.js'
import { getZaloBotSettings, renderZaloTemplate } from './zalo-config.service.js'
import { formatWalletBalance } from './zalo-command.service.js'

interface ZaloMentionMessage {
  msg: string
  mentions: Array<{ pos: number; uid: string; len: number }>
}

interface ZaloDirectMessageApi {
  findUser(phoneNumber: string): Promise<{ uid: string }>
  sendMessage(message: string | ZaloMentionMessage, threadId: string, type?: ThreadType): Promise<unknown>
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

export const notifyWithdrawalPaid = async (input: { userId: string; userName: string; amount: number }) => {
  try {
    const settings = await getZaloBotSettings()
    const notification = settings.withdrawal_notification
    if (!notification.enabled) return false
    if (input.userId.startsWith('gg_')) {
      console.info(`[WITHDRAWAL] Skip Zalo notification for Google user ${input.userId}.`)
      return false
    }
    if (!zaloApi) {
      console.warn('[WITHDRAWAL] Notification skipped because Zalo Bot is not logged in.')
      return false
    }

    const amount = formatWalletBalance(input.amount)
    if (notification.target === 'private') {
      const content = renderZaloTemplate(notification.template, {
        user_name: input.userName,
        amount,
      })
      await zaloApi.sendMessage(content, input.userId, ThreadType.User)
      return true
    }

    if (!settings.group_ids.length) {
      console.warn('[WITHDRAWAL] Group notification skipped because no Zalo group is configured.')
      return false
    }
    const mentionText = `@${input.userName}`
    let content = renderZaloTemplate(notification.template, {
      user_name: mentionText,
      amount,
    })
    let mentionPosition = content.indexOf(mentionText)
    if (mentionPosition < 0) {
      content = `${mentionText}\n${content}`
      mentionPosition = 0
    }
    const payload: ZaloMentionMessage = {
      msg: content,
      mentions: [{ pos: mentionPosition, uid: input.userId, len: mentionText.length }],
    }
    await Promise.all(settings.group_ids.map(groupId =>
      zaloApi!.sendMessage(payload, groupId, ThreadType.Group),
    ))
    return true
  } catch (error) {
    console.error('[WITHDRAWAL] Failed sending payment notification:', error)
    return false
  }
}
