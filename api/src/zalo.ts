import { type GroupEvent, GroupEventType, LoginQRCallbackEventType, type Message, Reactions, ThreadType, Zalo } from 'zca-js'
import { config, type TargetThreadType } from './config.js'
import { shopeeService } from './services/shopee.service.js'
import { getZaloBotSettings, renderZaloTemplate } from './services/zalo-config.service.js'
import { registerZaloNotificationApi, unregisterZaloNotificationApi } from './services/zalo-notification.service.js'

type ZaloApi = Awaited<ReturnType<Zalo['loginQR']>>

let api: ZaloApi | null = null
let connecting = false
let startedAt: Date | null = null
let qrImage: string | null = null
let qrState: 'idle' | 'generating' | 'waiting_scan' | 'scanned' | 'expired' | 'declined' | 'connected' | 'error' = 'idle'
let scannedAccount: { displayName: string; avatar: string } | null = null
let lastError: string | null = null

function toThreadType(type: TargetThreadType): ThreadType {
    return type === 'group' ? ThreadType.Group : ThreadType.User
}

export function getZaloStatus() {
    return {
        connected: api !== null,
        connecting,
        listenerStartedAt: startedAt?.toISOString() ?? null,
        botId: api?.getOwnId() ?? null,
        qrImage,
        qrState,
        scannedAccount,
        error: lastError,
    }
}

export async function initZalo(): Promise<void> {
    if (api || connecting) return
    connecting = true
    qrState = 'generating'
    qrImage = null
    scannedAccount = null
    lastError = null

    try {
        console.log('[ZALO] Generating QR login...')
        const zalo = new Zalo();
        const loggedInApi = await zalo.loginQR({}, (event) => {
            if (event.type === LoginQRCallbackEventType.QRCodeGenerated) {
                qrImage = `data:image/png;base64,${event.data.image}`
                qrState = 'waiting_scan'
            } else if (event.type === LoginQRCallbackEventType.QRCodeScanned) {
                qrState = 'scanned'
                scannedAccount = { displayName: event.data.display_name, avatar: event.data.avatar }
            } else if (event.type === LoginQRCallbackEventType.QRCodeExpired) {
                qrState = 'expired'
                qrImage = null
            } else if (event.type === LoginQRCallbackEventType.QRCodeDeclined) {
                qrState = 'declined'
                qrImage = null
            }
        })
        api = loggedInApi
        registerZaloNotificationApi(loggedInApi)
        qrState = 'connected'
        qrImage = null

        console.log(`[ZALO] Login successful! Own ID: ${api.getOwnId()}`)

        api.listener.on('message', async (message: Message) => {
            try {
                await handleIncomingMessage(
                    loggedInApi,
                    message,
                )
            } catch (error) {
                console.error('[ZALO] Listener error:', error)
            }
        })

        api.listener.on('group_event', async (event: GroupEvent) => {
            try {
                await handleGroupEvent(loggedInApi, event)
            } catch (error) {
                console.error('[ZALO] Group event error:', error)
            }
        })

        api.listener.start()
        startedAt = new Date()
        console.log('[ZALO] Listener started')
    } catch (error) {
        unregisterZaloNotificationApi()
        const callbackState: string = qrState
        if (callbackState !== 'expired' && callbackState !== 'declined') qrState = 'error'
        lastError = error instanceof Error ? error.message : 'Đăng nhập Zalo thất bại'
        console.error('[ZALO] Login failed:', error)
    } finally {
        connecting = false
    }
}

async function handleIncomingMessage(
    loggedInApi: ZaloApi,
    message: Message,
): Promise<void> {
    if (message.isSelf) {
        return
    }

    console.log(
        `[ZALO] Incoming: ${message.threadId}`
    )
    const content = message.data.content
    let text = ''
    if (typeof content === 'string') {
        text = content.trim()
    }

    if (!text) {
        return
    }

    if (message.type !== ThreadType.Group) return
    const botConfig = await getZaloBotSettings()
    if (!botConfig.group_ids.includes(message.threadId)) return

    const match = text.match(/https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:shopee\.vn|s\.shopee\.vn)\/[^\s]+/i)
    if (!match) return

    try {
        await loggedInApi.addReaction(Reactions.HEART, {
            data: {
                msgId: message.data.msgId,
                cliMsgId: message.data.cliMsgId,
            },
            threadId: message.threadId,
            type: ThreadType.Group,
        })
    } catch (error) {
        // Reaction failure must not prevent the affiliate-link response.
        console.error('[ZALO] Failed to react to Shopee link message:', error)
    }

    const result = await shopeeService.generateShopeeLink(match[0], message.data.uidFrom)
    if (!result.productInfo) {
        const errorResponse = renderZaloTemplate(botConfig.link_convert_error_template, {
            original_link: match[0],
        })
        await sendTaggedGroupMessage(loggedInApi, message, errorResponse)
        return
    }
    const rawCommission = result.productInfo?.commission
    const commission = typeof rawCommission === 'number' && Number.isFinite(rawCommission)
        ? `${rawCommission.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}đ`
        : 'Chưa xác định'
    const rawCommissionRate = result.productInfo?.rating
    const normalizedRate = rawCommissionRate === undefined || rawCommissionRate === null
        ? ''
        : String(rawCommissionRate).trim().replace(/%$/, '')
    const commissionRate = normalizedRate ? `${normalizedRate}%` : '3-10%'
    // Keep templates saved with the old explicit suffixes compatible with unit-aware variables.
    const template = botConfig.link_convert_template
        .replace(/\{commission\}đ/g, '{commission}')
        .replace(/\{commission_rate\}%/g, '{commission_rate}')
    const response = renderZaloTemplate(template, {
        affiliate_link: result.affiliateLink,
        product_name: result.productInfo?.productName || 'Sản phẩm Shopee',
        commission,
        commission_rate: commissionRate,
    })
    await sendTaggedGroupMessage(loggedInApi, message, response)
}

async function sendTaggedGroupMessage(
    loggedInApi: ZaloApi,
    originalMessage: Message,
    content: string,
): Promise<void> {
    const displayName = originalMessage.data.dName?.trim() || 'Bạn'
    const mentionText = `@${displayName}`
    await loggedInApi.sendMessage({
        msg: `${mentionText}\n${content}`,
        mentions: [{
            pos: 0,
            uid: originalMessage.data.uidFrom,
            len: mentionText.length,
        }],
    }, originalMessage.threadId, ThreadType.Group)
}

async function handleGroupEvent(loggedInApi: ZaloApi, event: GroupEvent): Promise<void> {
    if (event.isSelf || event.type !== GroupEventType.JOIN) return
    const botConfig = await getZaloBotSettings()
    if (!botConfig.welcome_enabled || !botConfig.group_ids.includes(event.threadId)) return
    if (!('updateMembers' in event.data)) return

    for (const member of event.data.updateMembers || []) {
        const response = renderZaloTemplate(botConfig.welcome_template, {
            user_name: member.dName || 'thành viên mới',
            group_name: event.data.groupName || 'nhóm',
        })
        await loggedInApi.sendMessage(response, event.threadId, ThreadType.Group)
    }
}
