import { type GroupEvent, GroupEventType, LoginQRCallbackEventType, type Message, Reactions, TextStyle, ThreadType, Zalo, type Style } from 'zca-js'
import { config, type TargetThreadType } from './config.js'
import { shopeeService } from './services/shopee.service.js'
import { getZaloBotSettings, renderZaloTemplate } from './services/zalo-config.service.js'
import { getShopeeSettings } from './services/shopee-config.service.js'
import { registerZaloNotificationApi, unregisterZaloNotificationApi } from './services/zalo-notification.service.js'
import { ensureZaloUser, getZaloUser, regenerateTrackingCode } from './services/user.service.js'
import { formatWalletBalance, getOrdersUrl, getWalletsUrl, getZaloCommandUser, getZaloUserOrders, withdrawAllZaloBalance } from './services/zalo-command.service.js'

type ZaloApi = Awaited<ReturnType<Zalo['loginQR']>>

function parseBoldTags(content: string): { msg: string; styles: Style[] } {
    const styles: Style[] = []
    const tagPattern = /<b>([\s\S]*?)(?:<\/b>|<b>)/gi
    let msg = ''
    let cursor = 0
    let match: RegExpExecArray | null

    while ((match = tagPattern.exec(content)) !== null) {
        msg += content.slice(cursor, match.index)
        const boldText = match[1]
        const start = msg.length
        msg += boldText
        if (boldText.length) styles.push({ start, len: boldText.length, st: TextStyle.Bold })
        cursor = match.index + match[0].length
    }
    msg += content.slice(cursor)
    return { msg, styles }
}

const styledMessage = (content: string) => {
    const parsed = parseBoldTags(content)
    return parsed.styles.length ? parsed : parsed.msg
}

const truncateProductName = (value: string | null) => {
    const characters = Array.from(value?.trim() || 'Chưa xác định')
    return characters.length <= 30 ? characters.join('') : `${characters.slice(0, 27).join('')}...`
}

const maskOrderId = (value: string) => `${value.slice(0, Math.max(0, value.length - 5))}*****`

const displayOrderStatus = (value: string | null) => {
    const status = value?.trim().toLowerCase() || ''
    if (['completed', 'complete', 'đã hoàn thành', 'hoàn thành'].includes(status)) return 'Đã hoàn tiền'
    if (['cancelled', 'canceled', 'invalid', 'đã hủy', 'đã huỷ'].includes(status)) return 'Đã huỷ'
    return 'Chờ xử lý'
}

let api: ZaloApi | null = null
let listenerConnected = false
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
        connected: api !== null && listenerConnected,
        connecting: connecting || (api !== null && !listenerConnected),
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
        listenerConnected = false
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

        api.listener.on('connected', () => {
            listenerConnected = true
            startedAt = new Date()
            lastError = null
            console.log('[ZALO] Listener connected')
        })
        api.listener.on('disconnected', (code, reason) => {
            listenerConnected = false
            console.warn(`[ZALO] Listener disconnected (${code}): ${reason || 'Unknown reason'}`)
        })
        api.listener.on('closed', (code, reason) => {
            listenerConnected = false
            api = null
            unregisterZaloNotificationApi()
            lastError = `Zalo listener đã đóng (${code})${reason ? `: ${reason}` : ''}`
        })
        api.listener.on('error', (error) => {
            lastError = error instanceof Error ? error.message : 'Zalo listener gặp lỗi'
            console.error('[ZALO] Listener connection error:', error)
        })

        api.listener.start({ retryOnClose: true })
        console.log('[ZALO] Listener starting')
    } catch (error) {
        listenerConnected = false
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
    const text = extractMessageText(message.data.content)

    if (!text) {
        return
    }

    const botConfig = await getZaloBotSettings()
    if (message.type === ThreadType.User) {
        const incomingCommand = extractChatCommand(text)
        const trackingCommand = normalizeChatCommand(botConfig.private_commands.tracking.command)
        const resetCommand = normalizeChatCommand(botConfig.private_commands.reset_tracking.command)
        if (incomingCommand !== trackingCommand && incomingCommand !== resetCommand) return
        await synchronizeZaloSender(loggedInApi, message)
        const user = await getZaloCommandUser(message.data.uidFrom)
        const isReset = incomingCommand === resetCommand
        const trackingCode = isReset ? await regenerateTrackingCode(message.data.uidFrom) : user.trackingCode
        const responseTemplate = isReset ? botConfig.private_commands.reset_tracking.response : botConfig.private_commands.tracking.response
        await loggedInApi.sendMessage(styledMessage(renderZaloTemplate(responseTemplate, {
            tracking_code: trackingCode,
        })), message.threadId, ThreadType.User)
        if (botConfig.private_command_note.enabled) {
            await loggedInApi.sendMessage(styledMessage(renderZaloTemplate(botConfig.private_command_note.response, {
                new_tracking_code: `#${resetCommand}`,
            })), message.threadId, ThreadType.User)
        }
        return
    }
    if (message.type !== ThreadType.Group) return
    if (!botConfig.group_ids.includes(message.threadId)) return

    await synchronizeZaloSender(loggedInApi, message)

    const normalizedMessage = text.trim().toLowerCase()
    const commands = botConfig.group_commands
    if (normalizedMessage === `#${commands.wallet.command}`) {
        const user = await getZaloCommandUser(message.data.uidFrom)
        await sendTaggedGroupMessage(loggedInApi, message, renderZaloTemplate(commands.wallet.response, {
            total_balance: formatWalletBalance(user.availableBalance),
            pending_balance: formatWalletBalance(user.pendingBalance),
            total_paid: formatWalletBalance(user.totalPaid),
            uid: user.uid,
        }))
        return
    }
    if (normalizedMessage === `#${commands.withdraw.command}`) {
        try {
            const result = await withdrawAllZaloBalance(message.data.uidFrom)
            const template = result.withdrawn ? commands.withdraw.response : commands.withdraw.insufficient_response
            await sendTaggedGroupMessage(loggedInApi, message, renderZaloTemplate(template, {
                total_balance: formatWalletBalance(result.user.availableBalance),
                minimum_withdrawal: formatWalletBalance(result.minimumAmount),
                url: getWalletsUrl(),
            }))
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : ''
            if (errorMsg.includes('ngân hàng')) {
                let userBalance = ''
                try {
                    const user = await getZaloCommandUser(message.data.uidFrom)
                    userBalance = formatWalletBalance(user.availableBalance)
                } catch { }
                const template = commands.withdraw.no_bank_response || '⚠️ Bạn chưa cấu hình tài khoản ngân hàng. Vui lòng truy cập {url} để cập nhật thông tin trước khi rút tiền.'
                await sendTaggedGroupMessage(loggedInApi, message, renderZaloTemplate(template, {
                    url: getWalletsUrl(),
                    total_balance: userBalance,
                }))
            } else {
                const content = errorMsg || 'Không thể tạo yêu cầu rút tiền.'
                await sendTaggedGroupMessage(loggedInApi, message, `⚠️ ${content}`)
            }
        }
        return
    }
    if (normalizedMessage === `#${commands.orders.command}`) {
        const user = await getZaloCommandUser(message.data.uidFrom)
        await loggedInApi.sendMessage(styledMessage(renderZaloTemplate(commands.orders.private_response, {
            tracking_code: user.trackingCode,
            new_tracking_code: `#${botConfig.private_commands.reset_tracking.command}`,
        })), message.data.uidFrom, ThreadType.User)
        await sendTaggedGroupMessage(loggedInApi, message, renderZaloTemplate(commands.orders.response, {
            url: getOrdersUrl(),
            get_tracking_code_command: `#${botConfig.private_commands.tracking.command}`,
        }))
        return
    }
    const orderListCommand = normalizeChatCommand(commands.order_list.command)
    const orderListMatch = normalizedMessage.match(new RegExp(`^#${orderListCommand}(\\d+)?$`))
    if (orderListMatch) {
        const requestedPage = Number(orderListMatch[1] || 1)
        const pageSize = Math.max(1, Math.floor(Number(commands.order_list.page_size) || 1))
        const result = await getZaloUserOrders(message.data.uidFrom, requestedPage, pageSize)
        if (!result.totalOrders) {
            await sendTaggedGroupMessage(loggedInApi, message, commands.order_list.empty_response)
            return
        }
        const renderedOrders = result.records.map((order, index) => renderZaloTemplate(commands.order_list.item_response, {
            index: (result.page - 1) * pageSize + index + 1,
            product_name: truncateProductName(order.productName),
            order_id: maskOrderId(order.orderId),
            user_commission: formatWalletBalance(order.userCommission || 0),
            order_status: displayOrderStatus(order.orderStatus),
        })).join('\n')
        const nextPageInstruction = result.hasNextPage
            ? renderZaloTemplate(commands.order_list.next_page_response, {
                next_command: `${orderListCommand}${result.page + 1}`,
            })
            : ''
        const responseTemplate = result.hasNextPage
            ? commands.order_list.response
            : commands.order_list.response.replace(/^.*\{next_page_instruction\}.*(?:\r?\n)?/gm, '')
        const response = renderZaloTemplate(responseTemplate, {
            page: result.page,
            total_pages: result.totalPages,
            orders: renderedOrders,
            next_page_instruction: nextPageInstruction,
        }).replace(/➡️\s*➡️/g, '➡️').trim()
        await sendTaggedGroupMessage(loggedInApi, message, response)
        return
    }

    const shopeeUrl = extractShopeeUrl(text)
    if (!shopeeUrl) return

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

    let result
    try {
        result = await shopeeService.generateShopeeLink(shopeeUrl, message.data.uidFrom)
    } catch (error) {
        console.error(`[ZALO] Failed converting Shopee link from ${message.data.uidFrom}:`, error)
        const errorResponse = renderZaloTemplate(botConfig.link_convert_error_template, {
            original_link: shopeeUrl,
        })
        await sendTaggedGroupMessage(loggedInApi, message, errorResponse)
        return
    }
    if (!result.productInfo) {
        const errorResponse = renderZaloTemplate(botConfig.link_convert_error_template, {
            original_link: shopeeUrl,
        })
        await sendTaggedGroupMessage(loggedInApi, message, errorResponse)
        return
    }
    const shopeeSettings = await getShopeeSettings()
    const rawCommission = result.productInfo?.commission
    let commission = 'Chưa xác định'
    let userCommissionStr = 'Chưa xác định'
    if (typeof rawCommission === 'number' && Number.isFinite(rawCommission)) {
        commission = `${rawCommission.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}đ`
        const serviceFeeRate = Number(shopeeSettings.service_fee_rate) || 0
        const taxRate = Number(shopeeSettings.tax_rate) || 0
        const userSharePercentage = Number(shopeeSettings.user_share_percentage) || 0
        const netCommission = rawCommission - (rawCommission * (serviceFeeRate + taxRate)) / 100
        const userCommission = Math.round((netCommission * userSharePercentage) / 100)
        userCommissionStr = `${userCommission.toLocaleString('vi-VN')}đ`
    }
    const rawCommissionRate = result.productInfo?.totalRatePercent
    const normalizedRate = rawCommissionRate === undefined || rawCommissionRate === null
        ? ''
        : String(rawCommissionRate).trim().replace(/%$/, '')
    const commissionRate = normalizedRate ? `${normalizedRate}%` : '3-10%'
    // Keep templates saved with the old explicit suffixes compatible with unit-aware variables.
    const template = botConfig.link_convert_template
        .replace(/\{commission\}đ/g, '{commission}')
        .replace(/\{commission_rate\}%/g, '{commission_rate}')
        .replace(/\{user_commission\}đ/g, '{user_commission}')
    const response = renderZaloTemplate(template, {
        affiliate_link: result.affiliateLink,
        product_name: result.productInfo?.productName || 'Sản phẩm Shopee',
        commission,
        commission_rate: commissionRate,
        user_commission: userCommissionStr,
    })
    await sendTaggedGroupMessage(loggedInApi, message, response)
}

async function synchronizeZaloSender(loggedInApi: ZaloApi, message: Message): Promise<void> {
    const existingUser = await getZaloUser(message.data.uidFrom)
    const senderProfile = !existingUser || !existingUser.image
        ? await getZaloSenderProfile(loggedInApi, message)
        : { name: message.data.dName?.trim() || existingUser.name || 'Người dùng Zalo', image: existingUser.image }
    await ensureZaloUser({ id: message.data.uidFrom, name: senderProfile.name, image: senderProfile.image })
}

function extractMessageText(content: Message['data']['content']): string {
    if (typeof content === 'string') return content.trim()
    if (!content || typeof content !== 'object') return ''
    const values: string[] = []
    const visit = (value: unknown, depth = 0) => {
        if (depth > 5 || value === null || value === undefined) return
        if (typeof value === 'string') {
            values.push(value)
            try { visit(JSON.parse(value), depth + 1) } catch { /* not JSON */ }
            return
        }
        if (Array.isArray(value)) {
            value.forEach(item => visit(item, depth + 1))
            return
        }
        if (typeof value === 'object') {
            Object.values(value as Record<string, unknown>).forEach(item => visit(item, depth + 1))
        }
    }
    visit(content)
    return values.join(' ').replace(/\\\//g, '/').replace(/&amp;/gi, '&').trim()
}

function normalizeChatCommand(command: string): string {
    return command.normalize('NFKC').trim().replace(/^#+/, '').replace(/[‐‑‒–—−]/g, '-').toLowerCase()
}

function extractChatCommand(text: string): string | null {
    const normalized = text.normalize('NFKC').replace(/[‐‑‒–—−]/g, '-').toLowerCase()
    const match = normalized.match(/(?:^|\s)#([a-z0-9_-]+)/i)
    return match?.[1] ? normalizeChatCommand(match[1]) : null
}

const SHOPEE_URL_PATTERN = /https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:shopee\.vn|shp\.ee)\/[^\s"'<>]+/i

function extractShopeeUrl(text: string): string | null {
    const match = text.match(SHOPEE_URL_PATTERN)
    return match?.[0]?.replace(/[),.;!?]+$/, '') || null
}

async function getZaloSenderProfile(
    loggedInApi: ZaloApi,
    message: Message,
): Promise<{ name: string; image: string | null }> {
    const fallbackName = message.data.dName?.trim() || 'Người dùng Zalo'
    const userId = message.data.uidFrom

    try {
        const response = await loggedInApi.getUserInfo(userId)
        const profile = response.changed_profiles[userId]
            || Object.values(response.changed_profiles).find(item => item.userId === userId)
        if (profile) {
            return {
                name: profile.displayName?.trim() || profile.zaloName?.trim() || fallbackName,
                image: profile.avatar?.trim() || null,
            }
        }
    } catch (error) {
        console.warn(`[ZALO] getUserInfo failed for ${userId}:`, error)
    }

    try {
        const response = await loggedInApi.getGroupMembersInfo(userId)
        const profile = response.profiles[userId]
            || Object.values(response.profiles).find(item => item.id === userId)
        if (profile) {
            return {
                name: profile.displayName?.trim() || profile.zaloName?.trim() || fallbackName,
                image: profile.avatar?.trim() || null,
            }
        }
    } catch (error) {
        console.warn(`[ZALO] getGroupMembersInfo failed for ${userId}:`, error)
    }

    return { name: fallbackName, image: null }
}

async function sendTaggedGroupMessage(
    loggedInApi: ZaloApi,
    originalMessage: Message,
    content: string,
): Promise<void> {
    const displayName = originalMessage.data.dName?.trim() || 'Bạn'
    const mentionText = `@${displayName}`
    const parsed = parseBoldTags(content)
    const prefix = `${mentionText}\n`
    await loggedInApi.sendMessage({
        msg: `${prefix}${parsed.msg}`,
        styles: parsed.styles.map(style => ({ ...style, start: style.start + prefix.length })),
        mentions: [{
            pos: 0,
            uid: originalMessage.data.uidFrom,
            len: mentionText.length,
        }],
    }, originalMessage.threadId, ThreadType.Group)
}

async function handleGroupEvent(loggedInApi: ZaloApi, event: GroupEvent): Promise<void> {
    if (event.type !== GroupEventType.JOIN) return
    const botConfig = await getZaloBotSettings()
    if (!botConfig.welcome_enabled || !botConfig.group_ids.includes(event.threadId)) return
    if (!('updateMembers' in event.data)) return

    for (const member of event.data.updateMembers || []) {
        // Ignore only the bot account joining, not JOIN events performed by it.
        if (member.id === loggedInApi.getOwnId()) continue
        const displayName = member.dName?.trim() || 'thành viên mới'
        const mentionText = `@${displayName}`
        let response = renderZaloTemplate(botConfig.welcome_template, {
            user_name: mentionText,
            group_name: event.data.groupName || 'nhóm',
        })
        const parsed = parseBoldTags(response)
        response = parsed.msg
        let mentionPosition = response.indexOf(mentionText)
        if (mentionPosition < 0) {
            response = `${mentionText}\n${response}`
            mentionPosition = 0
            parsed.styles = parsed.styles.map(style => ({ ...style, start: style.start + mentionText.length + 1 }))
        }
        await loggedInApi.sendMessage({
            msg: response,
            styles: parsed.styles,
            mentions: [{
                pos: mentionPosition,
                uid: member.id,
                len: mentionText.length,
            }],
        }, event.threadId, ThreadType.Group)
    }
}
