import { type GroupEvent, GroupEventType, LoginQRCallbackEventType, type Message, ThreadType, Zalo } from 'zca-js'
import { config, type TargetThreadType } from './config.js'
import { shopeeService } from './services/shopee.service.js'
import { getShopeeSettings } from './services/shopee-config.service.js'
import { getZaloBotSettings, renderZaloTemplate } from './services/zalo-config.service.js'

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

    const result = await shopeeService.generateShopeeLink(match[0], message.data.uidFrom)
    const shopeeSettings = await getShopeeSettings()
    const rawCommission = result.productInfo?.commission
    const commission = typeof rawCommission === 'number' ? rawCommission.toLocaleString('vi-VN') : 'Đang cập nhật'
    const response = renderZaloTemplate(botConfig.link_convert_template, {
        affiliate_link: result.affiliateLink,
        product_name: result.productInfo?.productName || 'Sản phẩm Shopee',
        commission,
        commission_rate: shopeeSettings.user_share_percentage,
    })
    await loggedInApi.sendMessage(response, message.threadId, ThreadType.Group)
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
