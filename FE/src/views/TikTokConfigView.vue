<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import {
  ApiOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  KeyOutlined,
  PercentageOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

interface TikTokSettings {
  platform_enabled: boolean;
  service_fee_rate: number;
  tax_rate: number;
  user_share_percentage: number;
  TIKTOK_BASE_API: string;
  TIKTOK_BASE_API_KEY: string;
  TIKTOK_BASE_API_CREATOR: string;
  TIKTOK_POSTBACK_SECRET: string;
}

const defaultSettings = (): TikTokSettings => ({
  platform_enabled: false,
  service_fee_rate: 0,
  tax_rate: 0,
  user_share_percentage: 80,
  TIKTOK_BASE_API: "",
  TIKTOK_BASE_API_KEY: "",
  TIKTOK_BASE_API_CREATOR: "",
  TIKTOK_POSTBACK_SECRET: "",
});

const settings = reactive<TikTokSettings>(defaultSettings());
const loading = ref(true);
const saving = ref(false);
const showApiKey = ref(false);
const showPostbackSecret = ref(false);

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message || fallback
    : fallback;

const applySettings = (value?: Partial<TikTokSettings>) => {
  Object.assign(settings, defaultSettings(), value || {});
};

const loadConfig = async () => {
  loading.value = true;
  try {
    const response = await api.get<
      ApiResponse<{ settings: TikTokSettings }>
    >("/api/admin/tiktok-config");
    applySettings(response.data.data?.settings);
  } catch (error) {
    message.error(errorMessage(error, "Không thể tải cấu hình TikTok."));
  } finally {
    loading.value = false;
  }
};

const saveConfig = async () => {
  saving.value = true;
  try {
    const response = await api.put<ApiResponse<TikTokSettings>>(
      "/api/admin/tiktok-config",
      { ...settings }
    );
    applySettings(response.data.data);
    message.success("Lưu cấu hình TikTok thành công!");
  } catch (error) {
    message.error(errorMessage(error, "Không thể lưu cấu hình TikTok."));
  } finally {
    saving.value = false;
  }
};

onMounted(loadConfig);
</script>

<template>
  <section class="max-w-4xl mx-auto space-y-6 text-left pb-12">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-slate-800 dark:text-white">
          <VideoCameraOutlined class="text-slate-900 dark:text-white" />
          <h3 class="text-base sm:text-xl font-bold tracking-tight m-0">
            Cấu hình TikTok
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 m-0">
          Quản lý trạng thái hoàn tiền và thông tin kết nối TikTok Shop.
        </p>
      </div>
    </div>

    <a-spin :spinning="loading" tip="Đang tải cấu hình TikTok...">
      <div class="flex flex-col gap-5" :class="{ 'min-h-[360px]': loading }">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-start gap-2.5">
              <div
                class="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 dark:bg-slate-800 dark:text-white"
              >
                <VideoCameraOutlined />
              </div>
              <div>
                <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">
                  Hoàn tiền TikTok Shop
                </h4>
                <p class="mt-0.5 mb-0 text-xs text-slate-500 leading-relaxed">
                  Cho phép hệ thống vận hành tính năng hoàn tiền TikTok Shop.
                </p>
              </div>
            </div>
            <a-switch v-model:checked="settings.platform_enabled" />
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"
            >
              <PercentageOutlined />
            </div>
            <div>
              <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">
                Tỷ lệ hoàn tiền TikTok
              </h4>
              <p class="mt-0.5 mb-0 text-xs text-slate-500">
                Cấu hình phí dịch vụ, thuế và tỷ lệ chia sẻ hoa hồng cho người dùng.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-3.5 pt-1 sm:grid-cols-3">
            <div
              v-for="field in [
                { key: 'service_fee_rate', label: 'Phí dịch vụ (%)' },
                { key: 'tax_rate', label: 'Thuế (%)' },
                { key: 'user_share_percentage', label: 'Tỷ lệ chia sẻ người dùng (%)' },
              ]"
              :key="field.key"
              class="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-700/60 dark:bg-slate-800/60"
            >
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {{ field.label }}:
              </label>
              <div class="relative">
                <input
                  v-model.number="settings[field.key as 'service_fee_rate' | 'tax_rate' | 'user_share_percentage']"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  class="w-full rounded-xl border border-slate-300 bg-white p-2 pr-7 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <span class="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-1">
            <button
              type="button"
              :disabled="saving"
              class="btn-action-primary w-full sm:w-auto !h-9 !px-5 text-xs font-bold"
              @click="saveConfig"
            >
              <ReloadOutlined v-if="saving" spin />
              <SaveOutlined v-else />
              <span>Lưu tỷ lệ hoàn tiền</span>
            </button>
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs space-y-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0"
            >
              <ApiOutlined />
            </div>
            <div>
              <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">
                Thông tin kết nối API
              </h4>
              <p class="mt-0.5 mb-0 text-xs text-slate-500">
                Các thông tin dùng để tạo link, đồng bộ đơn hàng và xác thực postback.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <ApiOutlined /> TIKTOK_BASE_API
              </label>
              <input
                v-model="settings.TIKTOK_BASE_API"
                type="url"
                autocomplete="off"
                placeholder="https://api.example.com"
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <KeyOutlined /> TIKTOK_BASE_API_KEY
              </label>
              <div class="relative">
                <input
                  v-model="settings.TIKTOK_BASE_API_KEY"
                  :type="showApiKey ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Nhập API key TikTok..."
                  class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 pr-11 text-xs font-mono text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  :aria-label="showApiKey ? 'Ẩn API key' : 'Hiện API key'"
                  @click="showApiKey = !showApiKey"
                >
                  <EyeInvisibleOutlined v-if="showApiKey" />
                  <EyeOutlined v-else />
                </button>
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <UserOutlined /> TIKTOK_BASE_API_CREATOR
              </label>
              <input
                v-model="settings.TIKTOK_BASE_API_CREATOR"
                type="text"
                autocomplete="off"
                placeholder="Nhập creator username..."
                class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div class="space-y-1.5">
              <label class="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <SafetyCertificateOutlined /> TIKTOK_POSTBACK_SECRET
              </label>
              <div class="relative">
                <input
                  v-model="settings.TIKTOK_POSTBACK_SECRET"
                  :type="showPostbackSecret ? 'text' : 'password'"
                  autocomplete="new-password"
                  placeholder="Nhập postback secret..."
                  class="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 pr-11 text-xs font-mono text-slate-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  :aria-label="showPostbackSecret ? 'Ẩn postback secret' : 'Hiện postback secret'"
                  @click="showPostbackSecret = !showPostbackSecret"
                >
                  <EyeInvisibleOutlined v-if="showPostbackSecret" />
                  <EyeOutlined v-else />
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-1">
            <button
              type="button"
              :disabled="saving"
              class="btn-action-primary w-full sm:w-auto !h-9 !px-5 text-xs font-bold"
              @click="saveConfig"
            >
              <ReloadOutlined v-if="saving" spin />
              <SaveOutlined v-else />
              <span>Lưu cấu hình TikTok</span>
            </button>
          </div>
        </div>
      </div>
    </a-spin>
  </section>
</template>
