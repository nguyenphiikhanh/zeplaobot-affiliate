import { ref } from 'vue';
import axios from '@/api/axios';

export interface CommissionPlatformSettings {
  rank_rates: {
    silver: number;
    gold: number;
    obsidian: number;
  };
  sale_day_bonus: number;
  service_fee: number;
  tax: number;
}

export type CommissionPlatform = 'shopee' | 'tiktok' | 'lazada';

const defaultPlatformSettings = (
  serviceFee = 0,
  tax = 0,
): CommissionPlatformSettings => ({
  rank_rates: { silver: 60, gold: 70, obsidian: 80 },
  sale_day_bonus: 10,
  service_fee: serviceFee,
  tax,
});

const commissionSettings = ref<Record<CommissionPlatform, CommissionPlatformSettings>>({
  shopee: defaultPlatformSettings(0.98, 10),
  tiktok: defaultPlatformSettings(),
  lazada: defaultPlatformSettings(),
});
const loadingCommissionSettings = ref(false);
const commissionSettingsInitialized = ref(false);

const loadCommissionSettings = async (force = false) => {
  if (commissionSettingsInitialized.value && !force) return;

  loadingCommissionSettings.value = true;
  try {
    const response = await axios.get('/admin/system-config/commission');
    const data = response?.data?.data ?? response?.data;
    if (data?.shopee && data?.tiktok && data?.lazada) {
      commissionSettings.value = data;
    }
    commissionSettingsInitialized.value = true;
  } finally {
    loadingCommissionSettings.value = false;
  }
};

const saveCommissionSettings = async () => {
  const response = await axios.put('/admin/system-config/commission', {
    settings: commissionSettings.value,
  });
  const data = response?.data?.data;
  if (data) commissionSettings.value = data;
};

export const useCommissionSettings = () => ({
  commissionSettings,
  loadingCommissionSettings,
  loadCommissionSettings,
  saveCommissionSettings,
});
