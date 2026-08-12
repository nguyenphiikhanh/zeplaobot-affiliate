const AFFILIATE_CONFIGURED_KEY = 'shopee_affiliate_id_configured'

export const hasCachedAffiliateConfig = () =>
  localStorage.getItem(AFFILIATE_CONFIGURED_KEY) === 'true'

export const cacheAffiliateConfig = () =>
  localStorage.setItem(AFFILIATE_CONFIGURED_KEY, 'true')

export const clearAffiliateConfigCache = () =>
  localStorage.removeItem(AFFILIATE_CONFIGURED_KEY)
