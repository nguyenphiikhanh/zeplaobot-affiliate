export const AFFILIATE_TYPES = {
  SHOPEE: 1,
  TIKTOK: 2,
  LAZADA: 3,
  SHOPEEFOOD: 4,
} as const;

export const SHOPEE_COLLECT_LINK = [
  'shopee.vn',
  's.shopee.vn',
]

export const SHOPEEFOOD_COLLECT_LINK = [
  'spf.shopee.vn',
  'shopeefood.vn',
  'shopeefood.shopee.vn'
]

export const TIKTOK_COLLECT_LINK = [
  'tiktok.com',
  'vt.tiktok.com',
  'v.tiktok.com',
]

export const LAZADA_COLLECT_LINK = [
  'lazada.vn',
  's.lazada.vn',
]

export function detectPlatformFromUrl(url: string): number | null {
  if (!url) return null;
  try {
    let urlToParse = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToParse = 'https://' + url;
    }
    const hostname = new URL(urlToParse).hostname;
    
    if (SHOPEEFOOD_COLLECT_LINK.some(domain => hostname.includes(domain))) {
      return AFFILIATE_TYPES.SHOPEEFOOD;
    }
    if (SHOPEE_COLLECT_LINK.some(domain => hostname.includes(domain))) {
      return AFFILIATE_TYPES.SHOPEE;
    }
    if (TIKTOK_COLLECT_LINK.some(domain => hostname.includes(domain))) {
      return AFFILIATE_TYPES.TIKTOK;
    }
    if (LAZADA_COLLECT_LINK.some(domain => hostname.includes(domain))) {
      return AFFILIATE_TYPES.LAZADA;
    }
    return null;
  } catch (e) {
    // Fallback if URL parsing fails
    if (SHOPEEFOOD_COLLECT_LINK.some(domain => url.includes(domain))) return AFFILIATE_TYPES.SHOPEEFOOD;
    if (SHOPEE_COLLECT_LINK.some(domain => url.includes(domain))) return AFFILIATE_TYPES.SHOPEE;
    if (TIKTOK_COLLECT_LINK.some(domain => url.includes(domain))) return AFFILIATE_TYPES.TIKTOK;
    if (LAZADA_COLLECT_LINK.some(domain => url.includes(domain))) return AFFILIATE_TYPES.LAZADA;
    return null;
  }
}
