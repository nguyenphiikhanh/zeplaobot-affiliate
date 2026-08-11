import { ref } from 'vue';
import axios from '@/api/axios';

export interface SiteSettings {
  contact_zalo: string;
  contact_email: string;
  site_name: string;
  seo_description: string;
  logo_light: string;
  favicon: string;
  social_share_image: string;
  loading_image: string;
}

const siteSettings = ref<SiteSettings>({
  contact_zalo: 'https://zalo.me/',
  contact_email: 'support@saffi.vn',
  site_name: 'Saffi',
  seo_description: 'Hoàn tiền mua sắm tự động Shopee, TikTok Shop, Lazada. Tiết kiệm thông minh với mỗi đơn hàng.',
  logo_light: '/saffi_logo.webp',
  favicon: '/saficon.webp',
  social_share_image: '/saffi_gold.webp',
  loading_image: '/saffi_gold.webp',
});
let loadingPromise: Promise<void> | null = null;
let initialized = false;

const loadSiteSettings = (force = false) => {
  if (initialized && !force) return Promise.resolve();
  if (loadingPromise && !force) return loadingPromise;

  loadingPromise = axios.get('/site-settings')
    .then((response) => {
      const data = response?.data?.data ?? response?.data;
      if (data) siteSettings.value = data;
      initialized = true;
    })
    .catch(() => {
      initialized = true;
    })
    .finally(() => {
      loadingPromise = null;
    });

  return loadingPromise;
};

export const useSiteSettings = () => ({
  siteSettings,
  loadSiteSettings,
});
