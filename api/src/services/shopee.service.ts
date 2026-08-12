import { config } from '../config.js';
import { db } from '../db/index.js';
import { linkGenerations } from '../db/schema.js';
import { getShopeeSettings, getStoredShopeeCookieData } from './shopee-config.service.js';
import { notifyShopeeCookieError } from './zalo-notification.service.js';

export interface ProductInfo {
  productLink?: string;
  productName?: string;
  imageUrl?: string;
  commission?: number;
  rating?: number | string;
  [key: string]: any;
}

export interface ConvertShopeeLinkResult {
  originalLink: string;
  affiliateLink: string;
  productInfo: ProductInfo | null;
  subId: string;
  userId: string;
}

export interface ShopeeBatchCustomLinkItem {
  shortLink?: string;
  longLink?: string;
  failCode?: number;
}

export class ShopeeService {
  private userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36';

  /**
   * Generates a random 8-character alphanumeric subId.
   */
  public generateSubId(length: number = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Extracts shopId and productId from a standard Shopee URL.
   */
  public parseShopeeUrl(url: string): [string, string] | null {
    const productMatch = url.match(/\/product\/(\d+)\/(\d+)/i);
    if (productMatch) {
      return [productMatch[1], productMatch[2]];
    }

    const iMatch = url.match(/-i\.(\d+)\.(\d+)/i);
    if (iMatch) {
      return [iMatch[1], iMatch[2]];
    }

    return null;
  }

  /**
   * Fetches Shopee product metadata via external product info API if configured.
   */
  public async getProductInfo(productLink: string): Promise<ProductInfo | null> {
    const fetchApi = config.shopee.fetchProductApi;
    try {
      const response = await fetch(`${fetchApi}?url=${encodeURIComponent(productLink)}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        console.warn(`[ShopeeService] Fetch product info failed. Status: ${response.status}`);
        return null;
      }

      const resData = (await response.json()) as { productInfo?: ProductInfo };
      return resData.productInfo ?? null;
    } catch (error) {
      console.error('[ShopeeService] Error fetching product info:', error);
      return null;
    }
  }

  /**
   * Generates local short link using APP_URL.
   */
  public getAppShortLink(subId: string): string {
    return `${config.shortLinkBaseUrl}/s/${subId}`;
  }

  /**
   * Generates a fallback affiliate redirect link (an_redir).
   */
  public getShopeeAffiliateFallbackLink(
    shopId: string,
    productId: string,
    subId: string
  ): string {
    const affiliateId = config.shopee.affiliateId;

    const originLink = `https://shopee.vn/opaanlp/${shopId}/${productId}`;
    const params = new URLSearchParams({
      origin_link: originLink,
      affiliate_id: affiliateId,
      sub_id: subId,
    });

    return `https://s.shopee.vn/an_redir?${params.toString()}`;
  }

  /**
   * Calls Shopee GraphQL Batch Custom Link API to generate a short affiliate link.
   */
  public async getShopeeBatchLinkConvert(
    originalLink: string,
    subId: string,
    cookie?: string
  ): Promise<ShopeeBatchCustomLinkItem | null> {
    const shopeeBaseApi = config.shopee.baseApi;
    const storedCookie = await getStoredShopeeCookieData();
    const activeCookie = cookie || storedCookie?.cookie;

    if (!activeCookie) {
      console.warn('[ShopeeService] Shopee Cookie is not set.');
      await notifyShopeeCookieError('Convert link Shopee');
      return null;
    }

    if (!cookie) {
      const updatedAt = storedCookie?.updated_at ? new Date(storedCookie.updated_at) : null;
      const expiresAt = updatedAt ? updatedAt.getTime() + 7 * 24 * 60 * 60 * 1000 : 0;
      if (!updatedAt || Number.isNaN(updatedAt.getTime()) || expiresAt <= Date.now()) {
        console.warn('[ShopeeService] Shopee Cookie is expired.');
        await notifyShopeeCookieError('Convert link Shopee');
        return null;
      }
    }

    const endpoint = `${shopeeBaseApi}/gql?q=batchCustomLink`;
    const query = `
      query batchGetCustomLink($linkParams: [CustomLinkParam!], $sourceCaller: SourceCaller) {
        batchCustomLink(linkParams: $linkParams, sourceCaller: $sourceCaller) {
          shortLink
          longLink
          failCode
        }
      }
    `;

    const payload = {
      operationName: 'batchGetCustomLink',
      query,
      variables: {
        linkParams: [
          {
            originalLink,
            advancedLinkParams: {
              subId1: subId,
            },
          },
        ],
        sourceCaller: 'CUSTOM_LINK_CALLER',
      },
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'user-agent': this.userAgent,
          'sec-fetch-dest': 'empty',
          'sec-fetch-site': 'same-origin',
          'cookie': activeCookie,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.warn(`[ShopeeService] BatchCustomLink HTTP error: ${response.status}`);
        await notifyShopeeCookieError('Convert link Shopee');
        return null;
      }

      const json = (await response.json()) as {
        data?: { batchCustomLink?: ShopeeBatchCustomLinkItem[] };
        errors?: Array<{ message?: string }>;
      };

      const item = json.data?.batchCustomLink?.[0];
      if (!item || item.failCode !== 0 || !item.shortLink) {
        console.warn('[ShopeeService] BatchCustomLink failed or empty shortLink:', item);
        await notifyShopeeCookieError('Convert link Shopee');
        return null;
      }

      return item;
    } catch (error) {
      console.error('[ShopeeService] Error converting link via GraphQL:', error);
      await notifyShopeeCookieError('Convert link Shopee');
      return null;
    }
  }

  /**
   * Main convert method: Converts a raw Shopee link into an affiliate link,
   * associating subId and the sender's Zalo userId (from group chat).
   *
   * @param originalLink Raw Shopee product / landing link
   * @param userId ID of the Zalo user sending the message in the group
   */
  public async generateShopeeLink(
    originalLink: string,
    userId: string
  ): Promise<ConvertShopeeLinkResult> {
    const settings = await getShopeeSettings();
    if (!settings.platform_enabled) {
      throw new Error('Tính năng hoàn tiền Shopee đang tạm tắt.');
    }
    const subId = this.generateSubId();

    // 1. Fetch Product Metadata
    let productData: ProductInfo | null = null;
    try {
      productData = await this.getProductInfo(originalLink);
    } catch (err) {
      console.warn('[ShopeeService] Product info resolution skipped/failed:', err);
    }

    // 2. Determine shopId & productId for potential fallback
    let shopId = '';
    let productId = '';
    const parsedDirect = this.parseShopeeUrl(originalLink);

    if (parsedDirect) {
      [shopId, productId] = parsedDirect;
    } else if (productData?.productLink) {
      const parsedFromMeta = this.parseShopeeUrl(productData.productLink);
      if (parsedFromMeta) {
        [shopId, productId] = parsedFromMeta;
      }
    }

    // 3. Attempt GraphQL short link generation first
    let targetAffiliateLink = '';
    let usedFallback = false;
    try {
      const batchResult = await this.getShopeeBatchLinkConvert(originalLink, subId);
      if (batchResult?.shortLink) {
        targetAffiliateLink = batchResult.shortLink;
      }
    } catch (error) {
      console.warn('[ShopeeService] GraphQL batch convert failed, switching to fallback link.');
    }

    // 4. Fallback link if GraphQL convert was not successful
    if (!targetAffiliateLink) {
      usedFallback = true;
      if (shopId && productId) {
        targetAffiliateLink = this.getShopeeAffiliateFallbackLink(shopId, productId, subId);
      } else {
        const affiliateId = config.shopee.affiliateId;
        targetAffiliateLink = `https://s.shopee.vn/an_redir?origin_link=${encodeURIComponent(
          originalLink
        )}&affiliate_id=${affiliateId}&sub_id=${subId}`;
      }
    }

    if (usedFallback && productData) {
      console.log(`[ShopeeService] Cookie conversion unavailable; using local short-link fallback for ${subId}.`);
    }

    // 5. Save convert record to Database via Drizzle ORM (affiliateLink is the target Shopee link)
    await db.insert(linkGenerations).values({
      userId,
      originLink: originalLink,
      affiliateLink: targetAffiliateLink,
      subId,
      type: 1, // Shopee
      productInfo: productData ?? null,
    });

    // 6. Generate shortened APP_URL link for user facing output
    const shortLink = this.getAppShortLink(subId);

    return {
      originalLink,
      affiliateLink: shortLink,
      productInfo: productData,
      subId,
      userId,
    };
  }

  /**
   * Utility to extract Shopee URLs from text and replace them with converted affiliate links.
   *
   * @param text Raw message text from Zalo group
   * @param userId Zalo sender ID in the group
   */
  public async replaceShopeeLinksInText(text: string, userId: string): Promise<string> {
    const shopeeRegex = /https?:\/\/(?:[a-zA-Z0-9-]+\.)*(?:shopee\.vn|shp\.ee)\/[^\s]+/gi;
    const matches = text.match(shopeeRegex);

    if (!matches || matches.length === 0) {
      return text;
    }

    let updatedText = text;
    for (const rawUrl of matches) {
      try {
        const result = await this.generateShopeeLink(rawUrl, userId);
        if (result.affiliateLink) {
          updatedText = updatedText.replace(rawUrl, result.affiliateLink);
        }
      } catch (err) {
        console.error(`[ShopeeService] Failed converting URL ${rawUrl}:`, err);
      }
    }

    return updatedText;
  }
}

export const shopeeService = new ShopeeService();
