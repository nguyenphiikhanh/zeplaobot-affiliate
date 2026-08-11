import { ref } from 'vue';
import axios from '@/api/axios';

export interface WalletData {
  availableBalance: number;
  pendingBalance: number;
  totalPaid: number;
}

export function useWallet() {
  const walletData = ref<WalletData>({
    availableBalance: 0,
    pendingBalance: 0,
    totalPaid: 0
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchWallet = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await axios.get('/wallet');
      if (res.data) {
        const resData = res.data.data || res.data;
        walletData.value = {
          availableBalance: resData.available_balance || 0,
          pendingBalance: resData.pending_balance || 0,
          totalPaid: resData.total_paid || 0,
        };
      }
    } catch (err: any) {
      error.value = err?.message || 'Có lỗi xảy ra khi tải thông tin ví';
      console.error('useWallet error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  return {
    walletData,
    isLoading,
    error,
    fetchWallet
  };
}
