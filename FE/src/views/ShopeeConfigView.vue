<script setup lang="ts">
import { onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import { api, type ApiResponse } from "../services/api";
import { cacheAffiliateConfig } from "../services/affiliate-config-state";
import {
  KeyOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PercentageOutlined,
  MessageOutlined,
  EditOutlined,
  ShoppingOutlined,
} from "@ant-design/icons-vue";

// State variables matching PHP ShopeeSettings.vue
const savingStatus = ref(false);
const savingCookie = ref(false);
const savingZaloConfig = ref(false);
const loadingConfig = ref(true);

// Platforms status
const platformShopee = ref(true);
const affiliateId = ref("");

// Commission settings (service fee, tax, and user share rate)
const serviceFeeRate = ref(1.0);
const taxRate = ref(10.0);
const userSharePercentage = ref(80.0);

// Zalo Notification Config & Fields
const zaloNotifyOnExpired = ref(false);
const zaloPhoneNumber = ref("");
const zaloNotifyContent = ref(
  "⚠️ Cảnh báo: Shopee Cookie đã hết hạn. Vui lòng truy cập trang Admin để cập nhật Cookie mới!"
);
const zaloNotifyRepeatHours = ref(3);

// Cookie Config & Status (matching php CookieCard.vue)
const isEditingCookie = ref(false);
const shopeeCookieInput = ref("");
const cookieStatus = ref("Đang kiểm tra...");

interface ShopeeSettings {
  affiliate_id: string;
  platform_enabled: boolean;
  service_fee_rate: number;
  tax_rate: number;
  user_share_percentage: number;
  zalo_notify_on_expired: boolean;
  zalo_phone_number: string;
  zalo_notify_content: string;
  zalo_notify_repeat_hours: number;
}

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;

const settingsPayload = (): ShopeeSettings => ({
  affiliate_id: affiliateId.value.trim(),
  platform_enabled: platformShopee.value,
  service_fee_rate: Number(serviceFeeRate.value),
  tax_rate: Number(taxRate.value),
  user_share_percentage: Number(userSharePercentage.value),
  zalo_notify_on_expired: zaloNotifyOnExpired.value,
  zalo_phone_number: zaloPhoneNumber.value.trim(),
  zalo_notify_content: zaloNotifyContent.value.trim(),
  zalo_notify_repeat_hours: Number(zaloNotifyRepeatHours.value),
});

const applySettings = (settings: ShopeeSettings) => {
  affiliateId.value = settings.affiliate_id || "";
  platformShopee.value = settings.platform_enabled;
  serviceFeeRate.value = settings.service_fee_rate;
  taxRate.value = settings.tax_rate;
  userSharePercentage.value = settings.user_share_percentage;
  zaloNotifyOnExpired.value = settings.zalo_notify_on_expired;
  zaloPhoneNumber.value = settings.zalo_phone_number;
  zaloNotifyContent.value = settings.zalo_notify_content;
  zaloNotifyRepeatHours.value = settings.zalo_notify_repeat_hours;
};

const loadConfig = async () => {
  loadingConfig.value = true;
  try {
    const response = await api.get<
      ApiResponse<{ settings: ShopeeSettings; cookie_status: string }>
    >("/api/admin/shopee-config");
    if (response.data.data) {
      applySettings(response.data.data.settings);
      cookieStatus.value = response.data.data.cookie_status;
    }
  } catch (error) {
    cookieStatus.value = "Không thể tải trạng thái Cookie.";
    message.error(errorMessage(error, "Không thể tải cấu hình Shopee."));
  } finally {
    loadingConfig.value = false;
  }
};

onMounted(loadConfig);

const saveStatus = async () => {
  if (!affiliateId.value.trim()) {
    message.warning("Affiliate ID không được để trống!");
    return;
  }
  savingStatus.value = true;
  try {
    const response = await api.put<ApiResponse<ShopeeSettings>>(
      "/api/admin/shopee-config/settings",
      settingsPayload()
    );
    if (response.data.data) applySettings(response.data.data);
    cacheAffiliateConfig();
    message.success("Lưu cấu hình hoàn tiền Shopee thành công!");
  } catch (error) {
    message.error(errorMessage(error, "Không thể lưu cấu hình Shopee."));
  } finally {
    savingStatus.value = false;
  }
};

const saveZaloNotifyConfig = async () => {
  if (
    zaloNotifyOnExpired.value &&
    (!zaloPhoneNumber.value.trim() || !zaloNotifyContent.value.trim())
  ) {
    message.warning("Vui lòng nhập số điện thoại và nội dung thông báo Zalo!");
    return;
  }
  savingZaloConfig.value = true;
  try {
    const response = await api.put<ApiResponse<ShopeeSettings>>(
      "/api/admin/shopee-config/settings",
      settingsPayload()
    );
    if (response.data.data) applySettings(response.data.data);
    message.success("Cập nhật cấu hình thông báo Zalo thành công!");
  } catch (error) {
    message.error(
      errorMessage(error, "Không thể lưu cấu hình thông báo Zalo.")
    );
  } finally {
    savingZaloConfig.value = false;
  }
};

const handleZaloNotifyToggle = async (enabled: boolean) => {
  // Enabling still requires the phone/content form below to be completed and
  // saved explicitly. Disabling is persisted immediately because that form is hidden.
  if (enabled) return;

  savingZaloConfig.value = true;
  try {
    const response = await api.put<ApiResponse<ShopeeSettings>>(
      "/api/admin/shopee-config/settings",
      settingsPayload()
    );
    if (response.data.data) applySettings(response.data.data);
    message.success("Đã tắt thông báo Cookie hết hạn.");
  } catch (error) {
    zaloNotifyOnExpired.value = true;
    message.error(
      errorMessage(error, "Không thể tắt thông báo Cookie hết hạn.")
    );
  } finally {
    savingZaloConfig.value = false;
  }
};

const cancelCookieEdit = () => {
  isEditingCookie.value = false;
  shopeeCookieInput.value = "";
};

const saveCookie = async () => {
  if (!shopeeCookieInput.value.trim()) {
    message.warning("Vui lòng dán Cookie Shopee mới!");
    return;
  }

  savingCookie.value = true;
  try {
    const response = await api.put<ApiResponse<{ cookie_status: string }>>(
      "/api/admin/shopee-config/cookie",
      {
        cookie: shopeeCookieInput.value.trim(),
      }
    );
    cookieStatus.value =
      response.data.data?.cookie_status || "Cookie đã được cập nhật.";
    isEditingCookie.value = false;
    shopeeCookieInput.value = "";
    message.success("Cập nhật Cookie Shopee thành công!");
  } catch (error) {
    message.error(errorMessage(error, "Không thể cập nhật Cookie Shopee."));
  } finally {
    savingCookie.value = false;
  }
};
</script>

<template>
  <section class="max-w-4xl mx-auto space-y-6 text-left pb-12">
    <!-- Page Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left"
    >
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 text-slate-800 font-extrabold text-base sm:text-xl tracking-tight"
        >
          <ShoppingOutlined class="text-[#ee4d2d]" />
          <h3 class="text-base sm:text-xl font-bold text-slate-800 tracking-tight m-0">
            Cấu hình hoàn tiền Shopee
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 m-0">
          Quản lý Affiliate ID, tỷ lệ hoàn tiền và Cookie vận hành Shopee.
        </p>
      </div>
    </div>

    <a-spin :spinning="loadingConfig" tip="Đang tải cấu hình Shopee...">
      <div class="flex flex-col gap-5" :class="{ 'min-h-[360px]': loadingConfig }">
        <!-- Affiliate ID Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-orange-100 text-[#ee4d2d] flex items-center justify-center font-bold shrink-0">
              <KeyOutlined />
            </div>
            <div>
              <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-1">
                <span>Affiliate ID</span>
                <span class="text-rose-500">*</span>
              </h4>
              <p class="mb-0 mt-0.5 text-xs text-slate-500">Mã Affiliate ID dùng để tạo link tiếp thị Shopee. Đây là cấu hình bắt buộc.</p>
            </div>
          </div>
          <input
            v-model="affiliateId"
            type="text"
            autocomplete="off"
            placeholder="Nhập Affiliate ID Shopee..."
            class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <div class="flex justify-end pt-1">
            <button
              type="button"
              :disabled="savingStatus"
              class="btn-action-primary w-full sm:w-auto !h-9 !px-5 text-xs font-bold"
              @click="saveStatus"
            >
              <ReloadOutlined v-if="savingStatus" spin />
              <SaveOutlined v-else />
              <span>Lưu Affiliate ID</span>
            </button>
          </div>
        </div>

        <!-- Commission Settings Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <PercentageOutlined />
            </div>
            <div>
              <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">Tỷ lệ hoàn tiền Shopee</h4>
              <p class="mt-0.5 mb-0 text-xs text-slate-500">Cấu hình tỷ lệ phí dịch vụ, thuế và tỷ lệ chia sẻ hoa hồng cho người dùng.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <!-- Phí dịch vụ (%) -->
            <div class="space-y-1.5 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Phí dịch vụ (%):</label>
              <div class="relative">
                <input
                  v-model.number="serviceFeeRate"
                  type="number"
                  step="0.1"
                  class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <span class="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            <!-- Thuế (%) -->
            <div class="space-y-1.5 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Thuế (%):</label>
              <div class="relative">
                <input
                  v-model.number="taxRate"
                  type="number"
                  step="1"
                  class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <span class="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>

            <!-- Tỷ lệ chia sẻ người dùng (%) -->
            <div class="space-y-1.5 bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">Tỷ lệ chia sẻ người dùng (%):</label>
              <div class="relative">
                <input
                  v-model.number="userSharePercentage"
                  type="number"
                  step="1"
                  class="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-slate-100"
                />
                <span class="absolute right-3 top-2 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-1">
            <button
              @click="saveStatus"
              :disabled="savingStatus"
              type="button"
              class="btn-action-primary w-full sm:w-auto !h-9 !px-5 text-xs font-bold"
            >
              <ReloadOutlined v-if="savingStatus" spin />
              <SaveOutlined v-else />
              <span>Lưu tỷ lệ hoàn tiền</span>
            </button>
          </div>
        </div>

        <!-- Zalo Bot Expired Notification Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                <MessageOutlined />
              </div>
              <div>
                <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">Gửi thông báo Zalo khi hết hạn Cookie</h4>
                <p class="mt-0.5 mb-0 text-xs text-slate-500 leading-relaxed">Tự động gửi tin nhắn cảnh báo qua Zalo khi Shopee Cookie bị hết hạn.</p>
              </div>
            </div>
            <a-switch
              v-model:checked="zaloNotifyOnExpired"
              :loading="savingZaloConfig"
              @change="handleZaloNotifyToggle"
            />
          </div>

          <div
            v-if="zaloNotifyOnExpired"
            class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5 animate-fade-in"
          >
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">Số điện thoại Zalo:</label>
              <input
                v-model="zaloPhoneNumber"
                type="text"
                placeholder="Nhập số điện thoại Zalo..."
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
              />
              <p class="mt-1 text-[11px] text-slate-400">💡 Số điện thoại tài khoản Zalo nhận tin nhắn cảnh báo</p>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">Nội dung tin nhắn:</label>
              <textarea
                v-model="zaloNotifyContent"
                rows="3"
                placeholder="Nhập nội dung tin nhắn..."
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 resize-y"
              ></textarea>
            </div>

            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-800 dark:text-slate-200">Gửi lại cảnh báo sau:</label>
              <a-select
                v-model:value="zaloNotifyRepeatHours"
                :options="[
                  { label: '1 giờ', value: 1 },
                  { label: '3 giờ', value: 3 },
                  { label: '6 giờ', value: 6 },
                  { label: '24 giờ', value: 24 },
                ]"
                class="w-full sm:max-w-[220px]"
              />
            </div>

            <div class="flex justify-end pt-1">
              <button
                @click="saveZaloNotifyConfig"
                :disabled="savingZaloConfig"
                type="button"
                class="btn-action-primary w-full sm:w-auto !h-9 !px-5 text-xs font-bold"
              >
                <ReloadOutlined v-if="savingZaloConfig" spin />
                <SaveOutlined v-else />
                <span>Lưu cấu hình cảnh báo</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Shopee Cookie Card -->
        <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <KeyOutlined />
              </div>
              <div>
                <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">Shopee Cookie</h4>
                <p class="mt-0.5 mb-0 text-xs text-slate-500">Cookie tài khoản Shopee dùng cho các tác vụ tự động.</p>
              </div>
            </div>
            <button
              v-if="!isEditingCookie"
              @click="isEditingCookie = true"
              type="button"
              class="btn-action-primary !h-8 !px-3.5 text-xs font-bold shrink-0"
            >
              <EditOutlined />
              <span>Cập nhật</span>
            </button>
          </div>

          <div
            v-if="!isEditingCookie"
            class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 flex items-center gap-2"
          >
            <CheckCircleOutlined class="text-emerald-500 text-sm shrink-0" />
            <span class="truncate">{{ cookieStatus }}</span>
          </div>

          <div v-else class="space-y-3 animate-fade-in">
            <textarea
              v-model="shopeeCookieInput"
              rows="5"
              placeholder="Dán Cookie Shopee mới tại đây..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
            ></textarea>

            <div class="flex items-center justify-end gap-2">
              <button
                @click="cancelCookieEdit"
                :disabled="savingCookie"
                type="button"
                class="btn-action-secondary !h-9 !px-4 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                @click="saveCookie"
                :disabled="savingCookie || !shopeeCookieInput.trim()"
                type="button"
                class="btn-action-primary !h-9 !px-5 text-xs font-bold"
              >
                <ReloadOutlined v-if="savingCookie" spin />
                <SaveOutlined v-else />
                <span>Lưu Cookie</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
  </section>
</template>
