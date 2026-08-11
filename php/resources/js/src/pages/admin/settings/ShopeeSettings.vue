<template>
  <section>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="m-0 text-base font-black text-slate-900 dark:text-white">Cấu hình hoàn tiền Shopee</h3>
        <p class="mt-1 mb-0 text-xs text-slate-500">Quản lý trạng thái và cookie vận hành Shopee.</p>
      </div>
      <a-button type="primary" :loading="savingStatus" class="font-bold" @click="saveStatus">
        Lưu trạng thái
      </a-button>
    </div>

    <div class="flex flex-col gap-5">
      <PlatformStatusCard
        v-model="platforms.shopee"
        title="Hoàn tiền Shopee"
        description="Cho phép người dùng sử dụng tính năng hoàn tiền Shopee."
        icon="/icon/shopee.webp"
      />

      <PlatformStatusCard
        v-model="platforms.shopeefood"
        title="Hoàn tiền ShopeeFood"
        description="Cho phép người dùng sử dụng tính năng hoàn tiền ShopeeFood."
        icon="/icon/shopeefood.webp"
      />

      <CommissionSettingsCard
        v-model="commissionSettings.shopee"
        :loading="loadingCommissionSettings"
        title="Tỷ lệ hoàn tiền Shopee & ShopeeFood"
        description="ShopeeFood sử dụng chung tỷ lệ hạng, ưu đãi ngày sale, phí dịch vụ và thuế với Shopee."
      />

      <!-- Thông báo Telegram khi Cookie hết hạn -->
      <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-center justify-between gap-4">
          <div>
            <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>🤖 Gửi thông báo bot Telegram khi hết hạn Cookie</span>
            </h4>
            <p class="mt-1 mb-0 text-xs leading-5 text-slate-500">
              Tự động gửi 1 tin nhắn cảnh báo tới Telegram Bot khi Shopee Cookie hết hạn hoặc không sử dụng được (Convert link, Lấy đơn hàng, Batch replace link).
            </p>
          </div>
          <a-switch
            v-model:checked="telegramNotifyOnExpired"
            :loading="savingTelegramConfig"
            @change="saveTelegramNotifyConfig"
          />
        </div>
      </div>

      <CookieCard
        title="Shopee Cookie"
        description="Cookie của tài khoản Shopee dùng cho tác vụ tự động."
        :status="cookieStatus"
        :loading="savingCookie"
        @save="saveCookie($event, false)"
      />

      <CookieCard
        title="Shopee Blacklist Cookie"
        description="Cookie dùng cho user bị ghim huỷ hoa hồng."
        :status="blacklistCookieStatus"
        :loading="savingBlacklistCookie"
        @save="saveCookie($event, true)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import axios from '@/api/axios';
import PlatformStatusCard from '@/components/admin/settings/PlatformStatusCard.vue';
import CookieCard from '@/components/admin/settings/CookieCard.vue';
import CommissionSettingsCard from '@/components/admin/settings/CommissionSettingsCard.vue';
import { useAdminSystemSettings } from '@/composables/useAdminSystemSettings';
import { useCommissionSettings } from '@/composables/useCommissionSettings';

const { platforms, loadPlatforms, savePlatforms } = useAdminSystemSettings();
const {
  commissionSettings,
  loadingCommissionSettings,
  loadCommissionSettings,
  saveCommissionSettings,
} = useCommissionSettings();
const cookieStatus = ref('Đang kiểm tra...');
const blacklistCookieStatus = ref('Đang kiểm tra...');
const telegramNotifyOnExpired = ref(true);
const savingTelegramConfig = ref(false);

const savingStatus = ref(false);
const savingCookie = ref(false);
const savingBlacklistCookie = ref(false);

const loadCookies = async () => {
  try {
    const response = await axios.get('/admin/system-config/shopee_cookie');
    const data = response?.data?.data ?? response?.data;
    cookieStatus.value = data?.shopee_cookies || 'Cookie chưa được cấu hình.';
    blacklistCookieStatus.value = data?.shopee_blacklist_cookies || 'Cookie chưa được cấu hình.';
    telegramNotifyOnExpired.value = data?.telegram_notify_on_expired ?? true;
  } catch {
    cookieStatus.value = 'Không thể tải trạng thái cookie.';
    blacklistCookieStatus.value = 'Không thể tải trạng thái cookie.';
  }
};

const saveTelegramNotifyConfig = async () => {
  savingTelegramConfig.value = true;
  try {
    await axios.put('/admin/system-config/shopee_cookie', {
      telegram_notify_on_expired: telegramNotifyOnExpired.value,
    });
    message.success('Cập nhật cấu hình thông báo Telegram thành công!');
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể lưu cấu hình thông báo Telegram.');
  } finally {
    savingTelegramConfig.value = false;
  }
};

onMounted(async () => {
  await Promise.all([loadPlatforms(), loadCommissionSettings(), loadCookies()]);
});

const saveStatus = async () => {
  savingStatus.value = true;
  try {
    await Promise.all([savePlatforms(), saveCommissionSettings()]);
    message.success('Lưu trạng thái Shopee thành công!');
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể lưu trạng thái Shopee.');
  } finally {
    savingStatus.value = false;
  }
};

const saveCookie = async (cookie: string, blacklist: boolean) => {
  const loadingRef = blacklist ? savingBlacklistCookie : savingCookie;
  loadingRef.value = true;
  try {
    await axios.put('/admin/system-config/shopee_cookie', {
      shopee_cookies: cookie,
      blacklist,
    });
    await loadCookies();
    message.success('Cập nhật cookie thành công!');
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể cập nhật cookie.');
  } finally {
    loadingRef.value = false;
  }
};
</script>
