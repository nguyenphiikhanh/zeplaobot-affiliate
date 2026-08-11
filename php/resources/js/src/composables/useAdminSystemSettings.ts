import { ref } from 'vue';
import axios from '@/api/axios';

export interface PlatformSettings {
  shopee: boolean;
  tiktok: boolean;
  lazada: boolean;
  shopeefood: boolean;
}

const platforms = ref<PlatformSettings>({
  shopee: true,
  tiktok: true,
  lazada: false,
  shopeefood: false,
});
const loading = ref(false);
const initialized = ref(false);

const loadPlatforms = async (force = false) => {
  if (initialized.value && !force) return;

  loading.value = true;
  try {
    const response = await axios.get('/admin/system-config');
    const payload = response?.data?.data ?? response?.data;
    const config = Array.isArray(payload)
      ? payload.find((item) => item.key === 'platforms_status')
      : payload;

    if (config?.value) {
      let value = config.value;
      if (typeof value === 'string') {
        try {
          value = JSON.parse(value);
        } catch {
          value = {};
        }
      }

      platforms.value = {
        shopee: value.shopee ?? false,
        tiktok: value.tiktok ?? false,
        lazada: value.lazada ?? false,
        shopeefood: value.shopeefood ?? false,
      };
    }
    initialized.value = true;
  } finally {
    loading.value = false;
  }
};

const savePlatforms = async () => {
  await axios.post('/admin/system-config', {
    platforms: JSON.stringify(platforms.value),
  });
};

export const useAdminSystemSettings = () => ({
  platforms,
  loading,
  loadPlatforms,
  savePlatforms,
});
