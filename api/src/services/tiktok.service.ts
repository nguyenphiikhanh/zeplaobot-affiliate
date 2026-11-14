import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { linkGenerations } from '../db/schema.js'
import { getTikTokSettings } from './tiktok-config.service.js'

interface TikTokProduct {
  title?: unknown
  main_image_url?: unknown
  detail_link?: unknown
  commission?: { amount?: unknown; rate?: unknown } | null
  [key: string]: unknown
}

interface TikTokApiResponse {
  affiliate_link?: unknown
  sub_id?: unknown
  product_id?: unknown
  product?: TikTokProduct | null
  product_error?: unknown
  message?: unknown
}

export interface TikTokConvertResult {
  originalLink: string
  affiliateLink: string
  productInfo: {
    productLink: string
    productName: string
    imageUrl: string
    commission: number
    totalRatePercent?: number | string
    serviceFeeRate: number
    taxRate: number
    userSharePercentage: number
    user_commission: number
  } | null
  subId: string
  userId: string
  type: 2
}

const generateSubId = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const uniqueSubId = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = generateSubId()
    const [existing] = await db.select({ id: linkGenerations.id })
      .from(linkGenerations).where(eq(linkGenerations.subId, candidate)).limit(1)
    if (!existing) return candidate
  }
  throw new Error('Không thể tạo mã theo dõi cho link TikTok')
}

const text = (value: unknown) => typeof value === 'string' ? value.trim() : ''

const maxCommission = (value: unknown) => {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round(value) : 0
  const matches = String(value ?? '').match(/\d[\d.,]*/g) || []
  const values = matches.map(part => {
    const normalized = part.includes(',') && part.includes('.')
      ? part.replace(/\./g, '').replace(',', '.')
      : part.replace(/,/g, '')
    return Number(normalized)
  }).filter(Number.isFinite)
  return values.length ? Math.round(Math.max(...values)) : 0
}

const normalizeCommissionRate = (value: unknown) => {
  if (value === undefined || value === null || value === '') return undefined
  const numericValue = typeof value === 'number'
    ? value
    : Number(String(value).trim().replace(/%$/, ''))
  return Number.isFinite(numericValue) ? numericValue / 100 : undefined
}

const normalizeTikTokUrl = (value: string) => {
  const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
  let parsed: URL
  try { parsed = new URL(candidate) } catch { throw new Error('Link TikTok không hợp lệ') }
  const hostname = parsed.hostname.toLowerCase()
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error('Link TikTok không hợp lệ')
  if (hostname !== 'tiktok.com' && !hostname.endsWith('.tiktok.com')) {
    throw new Error('Vui lòng nhập link sản phẩm TikTok hợp lệ')
  }
  return parsed.toString()
}

export class TikTokService {
  public async generateTikTokLink(originalLinkInput: string, userId: string): Promise<TikTokConvertResult> {
    const settings = await getTikTokSettings()
    if (!settings.platform_enabled) throw new Error('Tính năng hoàn tiền TikTok đang tạm tắt.')
    if (!settings.TIKTOK_BASE_API || !settings.TIKTOK_BASE_API_KEY || !settings.TIKTOK_BASE_API_CREATOR) {
      throw new Error('Cấu hình API TikTok chưa đầy đủ.')
    }

    const originalLink = normalizeTikTokUrl(originalLinkInput.trim())
    const baseApi = settings.TIKTOK_BASE_API.replace(/\/+$/, '')
    const endpoint = baseApi.endsWith('/partner/tiktok/affiliate')
      ? `${baseApi}/product-links`
      : `${baseApi}/partner/tiktok/affiliate/product-links`
    const subId = await uniqueSubId()

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Riohub-Api-Key': settings.TIKTOK_BASE_API_KEY,
      },
      body: JSON.stringify({
        product_url: originalLink,
        creator_username: settings.TIKTOK_BASE_API_CREATOR,
        sub_id: subId,
      }),
    })

    const rawBody = await response.text()
    let data: TikTokApiResponse = {}
    try { data = rawBody ? JSON.parse(rawBody) as TikTokApiResponse : {} } catch { /* handled below */ }
    if (!response.ok) {
      console.error(`[TikTokService] product-links failed (${response.status}):`, rawBody)
      throw new Error(text(data.message) || `API TikTok trả về lỗi ${response.status}`)
    }

    const affiliateLink = text(data.affiliate_link)
    if (!affiliateLink) {
      console.error('[TikTokService] Missing affiliate_link:', data)
      throw new Error('API TikTok không trả về affiliate link')
    }

    const resolvedSubId = text(data.sub_id) || subId
    const product = data.product && typeof data.product === 'object' ? data.product : null
    const commission = maxCommission(product?.commission?.amount)
    const rate = normalizeCommissionRate(product?.commission?.rate)
    const productInfo = product ? {
      productLink: text(product.detail_link) || affiliateLink,
      productName: text(product.title) || 'Sản phẩm TikTok Shop',
      imageUrl: text(product.main_image_url),
      commission,
      serviceFeeRate: settings.service_fee_rate,
      taxRate: settings.tax_rate,
      userSharePercentage: settings.user_share_percentage,
      user_commission: Math.round(
        (commission - commission * (settings.service_fee_rate + settings.tax_rate) / 100)
        * settings.user_share_percentage / 100,
      ),
      ...(rate !== undefined ? { totalRatePercent: rate } : {}),
    } : null

    await db.insert(linkGenerations).values({
      userId,
      originLink: originalLink,
      affiliateLink,
      subId: resolvedSubId,
      type: 2,
      productInfo: product ?? null,
    })

    return { originalLink, affiliateLink, productInfo, subId: resolvedSubId, userId, type: 2 }
  }
}

export const tiktokService = new TikTokService()
