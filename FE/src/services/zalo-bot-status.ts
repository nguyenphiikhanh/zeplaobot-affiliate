export const ZALO_BOT_STATUS_KEY = 'zalo_bot_status'
export const ZALO_BOT_STATUS_EVENT = 'zalo-bot-status-updated'

export interface ZaloBotStatus {
  connected: boolean
  connecting: boolean
  listenerStartedAt: string | null
  botId: string | null
  qrImage: string | null
  qrState: 'idle' | 'generating' | 'waiting_scan' | 'scanned' | 'expired' | 'declined' | 'connected' | 'error'
  scannedAccount: { displayName: string; avatar: string } | null
  error: string | null
}

export const defaultZaloBotStatus = (): ZaloBotStatus => ({
  connected: false,
  connecting: false,
  listenerStartedAt: null,
  botId: null,
  qrImage: null,
  qrState: 'idle',
  scannedAccount: null,
  error: null,
})

export const readZaloBotStatus = (): ZaloBotStatus => {
  try {
    const value = localStorage.getItem(ZALO_BOT_STATUS_KEY)
    return value ? { ...defaultZaloBotStatus(), ...JSON.parse(value) } : defaultZaloBotStatus()
  } catch {
    return defaultZaloBotStatus()
  }
}

export const saveZaloBotStatus = (status: ZaloBotStatus) => {
  localStorage.setItem(ZALO_BOT_STATUS_KEY, JSON.stringify(status))
  window.dispatchEvent(new CustomEvent<ZaloBotStatus>(ZALO_BOT_STATUS_EVENT, { detail: status }))
}
