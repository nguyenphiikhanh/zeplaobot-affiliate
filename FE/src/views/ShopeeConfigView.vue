<script setup lang="ts">
import { onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import { api, type ApiResponse } from "../services/api";
import {
  KeyOutlined,
  SaveOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  PercentageOutlined,
  MessageOutlined,
  EditOutlined,
} from "@ant-design/icons-vue";

// State variables matching PHP ShopeeSettings.vue
const savingStatus = ref(false);
const savingCookie = ref(false);
const savingZaloConfig = ref(false);
const loadingConfig = ref(true);

// Platforms status
const platformShopee = ref(true);

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
  savingStatus.value = true;
  try {
    const response = await api.put<ApiResponse<ShopeeSettings>>(
      "/api/admin/shopee-config/settings",
      settingsPayload()
    );
    if (response.data.data) applySettings(response.data.data);
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
  <section class="max-w-4xl mx-auto space-y-6 text-left">
    <!-- Page Header -->
    <div class="border-b border-slate-200 dark:border-slate-800 pb-5 text-left">
      <h3 class="m-0 text-lg font-black text-slate-900 dark:text-white">
        Cấu hình hoàn tiền Shopee
      </h3>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        Quản lý trạng thái và cookie vận hành Shopee.
      </p>
    </div>

    <a-spin :spinning="loadingConfig" tip="Đang tải cấu hình Shopee...">
    <div class="flex flex-col gap-5" :class="{ 'min-h-[360px]': loadingConfig }">
      <!-- Commission Settings Card -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
      >
        <div>
          <h4
            class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
          >
            <PercentageOutlined class="text-[#ee4d2d]" />
            <span>Tỷ lệ hoàn tiền Shopee</span>
          </h4>
          <p class="mt-1 mb-0 text-xs text-slate-500">
            Cấu hình tỷ lệ phần trăm hoàn tiền và tỷ lệ chia sẻ cho khách hàng.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <!-- Phí dịch vụ (%) -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >Phí dịch vụ (%):</label
            >
            <div class="relative">
              <input
                v-model.number="serviceFeeRate"
                type="number"
                step="0.1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
              <span
                class="absolute right-3 top-2.5 text-xs text-slate-400 font-bold"
                >%</span
              >
            </div>
          </div>

          <!-- Thuế (%) -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >Thuế (%):</label
            >
            <div class="relative">
              <input
                v-model.number="taxRate"
                type="number"
                step="1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
              <span
                class="absolute right-3 top-2.5 text-xs text-slate-400 font-bold"
                >%</span
              >
            </div>
          </div>

          <!-- Tỷ lệ chia sẻ người dùng (%) -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-700 dark:text-slate-300"
              >Tỷ lệ chia sẻ người dùng (%):</label
            >
            <div class="relative">
              <input
                v-model.number="userSharePercentage"
                type="number"
                step="1"
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-bold text-slate-800 dark:text-slate-100"
              />
              <span class="absolute right-3 top-2.5 text-slate-400 font-bold"
                >%</span
              >
            </div>
          </div>
        </div>

        <!-- Save Button inside Card -->
        <div class="flex justify-end pt-2">
          <button
            @click="saveStatus"
            :disabled="savingStatus"
            type="button"
            class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
          >
            <ReloadOutlined
              :spin="savingStatus"
              v-if="savingStatus"
              class="!text-white"
            />
            <SaveOutlined v-else class="!text-white" />
            <span class="!text-white">Lưu</span>
          </button>
        </div>
      </div>

      <!-- Zalo Bot Expired Notification Card -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
      >
        <div class="flex items-center justify-between gap-4">
          <div>
            <h4
              class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
            >
              <MessageOutlined class="text-blue-500 text-base" />
              <span>Gửi thông báo đến Zalo khi hết hạn Cookie</span>
            </h4>
            <p class="mt-1 mb-0 text-xs leading-5 text-slate-500">
              Tự động gửi 1 tin nhắn cảnh báo qua Zalo khi Shopee Cookie hết hạn
              hoặc không sử dụng được (Convert link, Lấy đơn hàng).
            </p>
          </div>
          <a-switch
            v-model:checked="zaloNotifyOnExpired"
            :loading="savingZaloConfig"
            @change="handleZaloNotifyToggle"
          />
        </div>

        <!-- Conditional Zalo Notification Inputs (Visible when switch is ON) -->
        <div
          v-if="zaloNotifyOnExpired"
          class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in text-left"
        >
          <!-- Input SDT Zalo -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              Số điện thoại Zalo:
            </label>
            <input
              v-model="zaloPhoneNumber"
              type="text"
              placeholder="Nhập số điện thoại Zalo..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100"
            />
            <p class="mt-2 text-[11px] leading-5 text-slate-400 font-medium">
              💡 Số điện thoại của tài khoản Zalo để bot gửi tin nhắn khi Cookie
              hết hạn
            </p>
          </div>

          <!-- Input Nội dung gửi -->
          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              Nội dung gửi:
            </label>
            <textarea
              v-model="zaloNotifyContent"
              rows="3"
              placeholder="Nhập nội dung tin nhắn gửi qua Zalo..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 resize-y"
            ></textarea>
          </div>

          <div class="space-y-1.5">
            <label
              class="block text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              Gửi lại cảnh báo sau:
            </label>
            <a-select
              v-model:value="zaloNotifyRepeatHours"
              :options="[
                { label: '1 giờ', value: 1 },
                { label: '3 giờ', value: 3 },
                { label: '6 giờ', value: 6 },
                { label: '24 giờ', value: 24 },
              ]"
              class="w-full max-w-[220px]"
            />
            <p class="mt-2 text-[11px] leading-5 text-slate-400 font-medium">
              Nếu Cookie vẫn lỗi, hệ thống sẽ gửi lại cảnh báo sau thời gian đã
              chọn.
            </p>
          </div>

          <!-- Save Zalo Config Button -->
          <div class="flex justify-end pt-1">
            <button
              @click="saveZaloNotifyConfig"
              :disabled="savingZaloConfig"
              type="button"
              class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
            >
              <ReloadOutlined
                :spin="savingZaloConfig"
                v-if="savingZaloConfig"
                class="!text-white"
              />
              <SaveOutlined v-else class="!text-white" />
              <span class="!text-white">Lưu cấu hình Cảnh báo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Shopee Cookie Card (Matching php CookieCard.vue) -->
      <div
        class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs text-left"
      >
        <div
          class="flex flex-col sm:flex-row sm:items-start justify-between gap-3"
        >
          <div>
            <h4
              class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
            >
              <KeyOutlined class="text-[#ee4d2d]" />
              <span>Shopee Cookie</span>
            </h4>
            <p class="mt-1 mb-0 text-xs text-slate-500">
              Cookie của tài khoản Shopee dùng cho tác vụ tự động.
            </p>
          </div>

          <!-- Update Button (shown when NOT editing) -->
          <button
            v-if="!isEditingCookie"
            @click="isEditingCookie = true"
            type="button"
            class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all self-start"
          >
            <EditOutlined class="!text-white" />
            <span class="!text-white">Cập nhật</span>
          </button>
        </div>

        <!-- Status view box (shown when NOT editing) -->
        <div
          v-if="!isEditingCookie"
          class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300 flex items-center gap-2"
        >
          <CheckCircleOutlined class="text-emerald-500 text-sm" />
          <span>{{ cookieStatus }}</span>
        </div>

        <!-- Textarea & Action buttons (shown when editing) -->
        <div v-else class="space-y-3 animate-fade-in">
          <textarea
            v-model="shopeeCookieInput"
            rows="5"
            placeholder="Dán Cookie tại đây..."
            class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
          ></textarea>

          <div class="flex justify-end gap-2">
            <button
              @click="cancelCookieEdit"
              :disabled="savingCookie"
              type="button"
              class="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              @click="saveCookie"
              :disabled="savingCookie || !shopeeCookieInput.trim()"
              type="button"
              class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <ReloadOutlined
                :spin="savingCookie"
                v-if="savingCookie"
                class="!text-white"
              />
              <SaveOutlined v-else class="!text-white" />
              <span class="!text-white">Lưu Cookie</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </a-spin>
  </section>
</template>
