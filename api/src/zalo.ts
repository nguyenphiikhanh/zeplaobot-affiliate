import { type Message, ThreadType, Zalo } from 'zca-js'
import { config, type TargetThreadType } from './config.js'

type ZaloApi = Awaited<ReturnType<Zalo['loginQR']>>

let api: ZaloApi | null = null
let connecting = false
let startedAt: Date | null = null

function toThreadType(type: TargetThreadType): ThreadType {
    return type === 'group' ? ThreadType.Group : ThreadType.User
}

export function getZaloStatus() {
    return {
        connected: api !== null,
        connecting,
        listenerStartedAt: startedAt?.toISOString() ?? null,
    }
}

export async function initZalo(): Promise<void> {
    if (api || connecting) return
    connecting = true

    try {
        console.log('[ZALO] Waiting for QR login...')
        const zalo = new Zalo();
        const loggedInApi = await zalo.loginQR()
        api = loggedInApi

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

        api.listener.start()
        startedAt = new Date()
        console.log('[ZALO] Listener started')
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
}