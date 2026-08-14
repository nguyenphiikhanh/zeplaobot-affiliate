<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message } from "ant-design-vue";
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  SearchOutlined,
  LockOutlined,
  KeyOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

export interface SiteSettings {
  site_name: string;
  site_description: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
}

const form = ref<SiteSettings>({
  site_name: "Affiliate - Hoàn tiền Mua sắm",
  site_description:
    "Nền tảng hoàn tiền mua sắm tự động hàng đầu Việt Nam. Tối ưu hoa hồng Shopee nhanh chóng và minh bạch.",
  meta_title: "Affiliate - Hoàn tiền Mua sắm",
  meta_description:
    "Nền tảng hoàn tiền mua sắm tự động hàng đầu Việt Nam. Tối ưu hoa hồng Shopee nhanh chóng và minh bạch.",
  keywords:
    "hoàn tiền shopee, affiliate shopee, nhận hoa hồng shopee, hoàn tiền mua sắm",
});

const loading = ref(false);
const saving = ref(false);

// Password form state
const passwordForm = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});
const changingPassword = ref(false);
const showCurrentPass = ref(false);
const showNewPass = ref(false);
const showConfirmPass = ref(false);

const loadSettings = async () => {
  loading.value = true;
  try {
    const response = await api.get<ApiResponse<SiteSettings>>(
      "/api/admin/site-config"
    );
    if (response.data.data) {
      form.value = { ...form.value, ...response.data.data };
    }
  } catch (error: any) {
    message.error(
      error.response?.data?.message || "Không thể tải cấu hình hệ thống"
    );
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!form.value.site_name.trim()) {
    message.warning("Vui lòng nhập Tên trang web!");
    return;
  }

  saving.value = true;
  try {
    const response = await api.put<ApiResponse<SiteSettings>>(
      "/api/admin/site-config",
      form.value
    );
    if (response.data.data) {
      form.value = { ...form.value, ...response.data.data };
      if (form.value.meta_title) {
        document.title = form.value.meta_title;
      }
    }
    message.success("Lưu cấu hình hệ thống & SEO thành công!");
  } catch (error: any) {
    message.error(
      error.response?.data?.message || "Không thể lưu cấu hình hệ thống"
    );
  } finally {
    saving.value = false;
  }
};

const handleChangePassword = async () => {
  if (!passwordForm.value.current_password) {
    message.warning("Vui lòng nhập mật khẩu hiện tại!");
    return;
  }
  if (!passwordForm.value.new_password) {
    message.warning("Vui lòng nhập mật khẩu mới!");
    return;
  }
  if (passwordForm.value.new_password.length < 6) {
    message.warning("Mật khẩu mới phải có ít nhất 6 ký tự!");
    return;
  }
  if (passwordForm.value.new_password !== passwordForm.value.confirm_password) {
    message.warning("Mật khẩu xác nhận không khớp!");
    return;
  }

  changingPassword.value = true;
  try {
    await api.post("/api/admin/change-password", {
      current_password: passwordForm.value.current_password,
      new_password: passwordForm.value.new_password,
    });
    message.success("Đổi mật khẩu quản trị thành công!");
    passwordForm.value = {
      current_password: "",
      new_password: "",
      confirm_password: "",
    };
  } catch (error: any) {
    message.error(
      error.response?.data?.message ||
        "Đổi mật khẩu thất bại, vui lòng kiểm tra lại"
    );
  } finally {
    changingPassword.value = false;
  }
};

const previewTitle = computed(() => {
  return form.value.meta_title || form.value.site_name || "Tiêu đề trang web";
});

const previewDesc = computed(() => {
  return (
    form.value.meta_description ||
    form.value.site_description ||
    "Mô tả trang web hiển thị trên công cụ tìm kiếm."
  );
});

onMounted(() => {
  loadSettings();
});
</script>

<template>
  <section class="max-w-4xl mx-auto space-y-6">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs"
    >
      <div class="space-y-1 text-left">
        <div
          class="flex items-center gap-2 text-slate-800 font-extrabold text-lg sm:text-xl"
        >
          <SettingOutlined class="text-[#ee4d2d]" />
          <h1>Cấu hình hệ thống</h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Quản trị thông tin thương hiệu, tối ưu SEO và bảo mật tài khoản quản
          trị.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="loadSettings"
          :disabled="loading || saving"
          type="button"
          class="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-2"
        >
          <ReloadOutlined :spin="loading" />
          <span>Tải lại</span>
        </button>
        <button
          @click="handleSave"
          :disabled="loading || saving"
          type="button"
          class="px-5 py-2.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-900/10 flex items-center gap-2 disabled:opacity-60"
        >
          <ReloadOutlined v-if="saving" spin />
          <SaveOutlined v-else />
          <span>Lưu cấu hình</span>
        </button>
      </div>
    </div>

    <a-spin :spinning="loading">
      <div class="space-y-6">
        <!-- Card 1: Thông tin chung trang web -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-5"
        >
          <div class="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span class="text-sm font-extrabold text-slate-900"
              >🌐 Thông tin chung Website</span
            >
          </div>

          <div class="grid grid-cols-1 gap-5">
            <!-- Tên trang web -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Tên trang web <span class="text-rose-500">*</span>
              </label>
              <input
                v-model="form.site_name"
                type="text"
                placeholder="VD: Affiliate - Hoàn tiền"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              />
              <p class="text-[11px] text-slate-400">
                Tên thương hiệu chính hiển thị trên thanh điều hướng và chân
                trang.
              </p>
            </div>

            <!-- Mô tả trang web -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Mô tả trang web
              </label>
              <textarea
                v-model="form.site_description"
                rows="3"
                placeholder="Mô tả tóm tắt giới thiệu nền tảng hoàn tiền của bạn..."
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              ></textarea>
              <p class="text-[11px] text-slate-400">
                Giới thiệu ngắn gọn về dịch vụ trên trang chủ.
              </p>
            </div>
          </div>
        </div>

        <!-- Card 2: Cấu hình SEO & Meta Tags -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-5"
        >
          <div
            class="flex items-center justify-between pb-3 border-b border-slate-100"
          >
            <span class="text-sm font-extrabold text-slate-900"
              >🔍 Cấu hình SEO & Meta Tags</span
            >
          </div>

          <div class="grid grid-cols-1 gap-5">
            <!-- Meta Title -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Tiêu đề (Meta Title)
              </label>
              <input
                v-model="form.meta_title"
                type="text"
                placeholder="VD: Affiliate - Hoàn tiền Tự động"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              />
              <p class="text-[11px] text-slate-400">
                Hiển thị làm thẻ <code>&lt;title&gt;</code> của trang web trên
                tab trình duyệt và kết quả tìm kiếm Google (Khuyên dùng: 50-60
                ký tự).
              </p>
            </div>

            <!-- Meta Description -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Mô tả SEO (Meta Description)
              </label>
              <textarea
                v-model="form.meta_description"
                rows="3"
                placeholder="Nhập đoạn mô tả cuốn hút hiển thị dưới link trên kết quả tìm kiếm..."
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              ></textarea>
              <p class="text-[11px] text-slate-400">
                Thẻ <code>meta description</code> giúp tăng tỷ lệ click (CTR) từ
                Google & Zalo khi chia sẻ link (Khuyên dùng: 140-160 ký tự).
              </p>
            </div>

            <!-- Keywords -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Từ khóa SEO (Keywords)
              </label>
              <input
                v-model="form.keywords"
                type="text"
                placeholder="hoàn tiền shopee, affiliate shopee, nhận hoa hồng shopee"
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              />
              <p class="text-[11px] text-slate-400">
                Các từ khóa cách nhau bởi dấu phẩy.
              </p>
            </div>
          </div>
        </div>

        <!-- Card 3: Live Search Preview (Google Simulation) -->
        <div
          class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-7 space-y-3 shadow-md"
        >
          <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
            <SearchOutlined class="text-blue-400" />
            <span>Xem trước kết quả hiển thị trên Google (SEO Preview)</span>
          </div>

          <div
            class="bg-white rounded-xl p-4 text-left space-y-1 border border-slate-700"
          >
            <div
              class="text-[11px] text-slate-500 truncate flex items-center gap-1"
            >
              <span
                class="w-2 h-2 rounded-full bg-emerald-500 inline-block"
              ></span>
              <span>https://your-domain.com</span>
            </div>
            <h3
              class="text-base sm:text-lg font-semibold text-blue-700 hover:underline cursor-pointer leading-tight truncate"
            >
              {{ previewTitle }}
            </h3>
            <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {{ previewDesc }}
            </p>
          </div>
        </div>

        <!-- Card 4: Đổi mật khẩu Quản trị -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-5"
        >
          <div
            class="flex items-center justify-between pb-3 border-b border-slate-100"
          >
            <div class="flex items-center gap-2">
              <LockOutlined class="text-[#ee4d2d]" />
              <span class="text-sm font-extrabold text-slate-900"
                >Bảo mật & Đổi mật khẩu Quản trị</span
              >
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Mật khẩu hiện tại -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Mật khẩu hiện tại <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordForm.current_password"
                  :type="showCurrentPass ? 'text' : 'password'"
                  placeholder="Nhập mật khẩu hiện tại"
                  class="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  tabindex="-1"
                  @click="showCurrentPass = !showCurrentPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <component
                    :is="showCurrentPass ? EyeInvisibleOutlined : EyeOutlined"
                  />
                </button>
              </div>
            </div>

            <!-- Mật khẩu mới -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Mật khẩu mới <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordForm.new_password"
                  :type="showNewPass ? 'text' : 'password'"
                  placeholder="Tối thiểu 6 ký tự"
                  class="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  tabindex="-1"
                  @click="showNewPass = !showNewPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <component
                    :is="showNewPass ? EyeInvisibleOutlined : EyeOutlined"
                  />
                </button>
              </div>
            </div>

            <!-- Xác nhận mật khẩu mới -->
            <div class="space-y-1.5 text-left">
              <label class="block text-xs font-bold text-slate-700">
                Xác nhận mật khẩu <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <input
                  v-model="passwordForm.confirm_password"
                  :type="showConfirmPass ? 'text' : 'password'"
                  placeholder="Nhập lại mật khẩu mới"
                  class="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  tabindex="-1"
                  @click="showConfirmPass = !showConfirmPass"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <component
                    :is="showConfirmPass ? EyeInvisibleOutlined : EyeOutlined"
                  />
                </button>
              </div>
            </div>
          </div>

          <div class="flex justify-end pt-2">
            <button
              @click="handleChangePassword"
              :disabled="changingPassword"
              type="button"
              class="px-5 py-2.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-900/10 flex items-center gap-2 disabled:opacity-60"
            >
              <ReloadOutlined v-if="changingPassword" spin />
              <KeyOutlined v-else />
              <span>Cập nhật mật khẩu</span>
            </button>
          </div>
        </div>
      </div>
    </a-spin>
  </section>
</template>
