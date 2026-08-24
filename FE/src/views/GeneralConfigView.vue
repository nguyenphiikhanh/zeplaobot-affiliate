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
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  CompassOutlined,
  GiftOutlined,
  GlobalOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";
import { updateSiteFavicon } from "../utils/favicon";

export interface SiteSettings {
  site_name: string;
  site_description: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  logo_url?: string;
  favicon_url?: string;
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
  logo_url: "",
  favicon_url: "",
  enable_google_login: false,
});

const loading = ref(false);
const saving = ref(false);

// File upload refs and handlers
const logoInputRef = ref<HTMLInputElement | null>(null);
const faviconInputRef = ref<HTMLInputElement | null>(null);

const handleFileUpload = (
  event: Event,
  targetField: "logo_url" | "favicon_url"
) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const maxSizeBytes = 1.5 * 1024 * 1024; // 1.5MB
  if (file.size > maxSizeBytes) {
    message.error(
      "Dung lượng ảnh tải lên quá lớn! Vui lòng chọn file dưới 1.5MB."
    );
    input.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result as string;
    if (result) {
      form.value[targetField] = result;
      message.success(
        `Đã chọn ảnh ${
          targetField === "logo_url" ? "Logo" : "Favicon"
        } thành công!`
      );
    }
  };
  reader.onerror = () => {
    message.error("Không thể đọc file ảnh. Vui lòng thử chọn lại!");
  };
  reader.readAsDataURL(file);
  input.value = "";
};

const triggerLogoSelect = () => logoInputRef.value?.click();
const triggerFaviconSelect = () => faviconInputRef.value?.click();

const clearLogo = () => {
  form.value.logo_url = "";
};

const clearFavicon = () => {
  form.value.favicon_url = "";
};

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
      if (form.value.favicon_url) {
        updateSiteFavicon(form.value.favicon_url);
      }
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
      if (form.value.favicon_url) {
        updateSiteFavicon(form.value.favicon_url);
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
  <section class="max-w-4xl mx-auto space-y-6 pb-12">
    <!-- Header Section -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs"
    >
      <div class="space-y-1 text-left">
        <div
          class="flex items-center gap-2 text-slate-800 font-extrabold text-base sm:text-xl tracking-tight"
        >
          <SettingOutlined class="text-[#ee4d2d]" />
          <h1
            class="text-base sm:text-xl font-bold tracking-tight text-slate-800"
          >
            Cấu hình hệ thống
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Quản trị thông tin thương hiệu, tối ưu SEO và bảo mật tài khoản quản
          trị.
        </p>
      </div>

      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          @click="loadSettings"
          :disabled="loading || saving"
          type="button"
          class="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center justify-center gap-2"
        >
          <ReloadOutlined :spin="loading" />
          <span>Tải lại</span>
        </button>
        <button
          @click="handleSave"
          :disabled="loading || saving"
          type="button"
          class="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-900/10 flex items-center justify-center gap-2 disabled:opacity-60"
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
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-7 space-y-5"
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
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
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
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              ></textarea>
              <p class="text-[11px] text-slate-400">
                Giới thiệu ngắn gọn về dịch vụ trên trang chủ.
              </p>
            </div>
          </div>
        </div>

        <!-- Card Mới: Nhận diện Thương hiệu (Logo & Favicon Base64 + Live Preview) -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-7 space-y-6"
        >
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100"
          >
            <div class="flex items-center gap-2">
              <PictureOutlined class="text-[#ee4d2d]" />
              <span class="text-sm font-extrabold text-slate-900"
                >🎨 Nhận diện Thương hiệu (Logo & Favicon)</span
              >
            </div>
            <span class="text-[11px] text-slate-400 font-medium"
              >Hỗ trợ Upload File (Base64) hoặc dán URL trực tiếp</span
            >
          </div>

          <!-- Upload Controls Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 1. Main Logo Upload Box -->
            <div class="space-y-3 text-left">
              <label
                class="block text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>Logo</span>
                <span class="text-[11px] font-normal text-slate-400"
                  >Khuyên dùng: PNG, SVG</span
                >
              </label>

              <!-- Upload Drag & Drop Area -->
              <div
                class="relative border-2 border-dashed border-slate-200 hover:border-[#ee4d2d] rounded-2xl p-4 transition-all bg-slate-50/50 hover:bg-orange-50/30 group"
              >
                <input
                  ref="logoInputRef"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  class="hidden"
                  @change="(e) => handleFileUpload(e, 'logo_url')"
                />

                <div
                  v-if="form.logo_url"
                  class="flex flex-col items-center justify-center space-y-3 py-2"
                >
                  <div
                    class="w-full h-20 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs overflow-hidden"
                  >
                    <img
                      :src="form.logo_url"
                      alt="Logo preview"
                      class="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="triggerLogoSelect"
                      class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadOutlined /> Thay đổi
                    </button>
                    <button
                      type="button"
                      @click="clearLogo"
                      class="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <DeleteOutlined /> Xóa
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  @click="triggerLogoSelect"
                  class="flex flex-col items-center justify-center space-y-2 py-4 cursor-pointer"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-orange-100 text-[#ee4d2d] flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <UploadOutlined class="text-lg" />
                  </div>
                  <div class="text-xs font-bold text-slate-700">
                    Tải lên Logo mới
                  </div>
                  <div class="text-[11px] text-slate-400 text-center">
                    Bấm vào đây để chọn file từ máy (Max 1.5MB)
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Favicon Upload Box -->
            <div class="space-y-3 text-left">
              <label
                class="block text-xs font-bold text-slate-700 flex items-center justify-between"
              >
                <span>Favicon (Icon trên Tab trình duyệt)</span>
                <span class="text-[11px] font-normal text-slate-400"
                  >Tỉ lệ 1:1 (32x32px)</span
                >
              </label>

              <!-- Upload Drag & Drop Area -->
              <div
                class="relative border-2 border-dashed border-slate-200 hover:border-[#ee4d2d] rounded-2xl p-4 transition-all bg-slate-50/50 hover:bg-orange-50/30 group"
              >
                <input
                  ref="faviconInputRef"
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                  class="hidden"
                  @change="(e) => handleFileUpload(e, 'favicon_url')"
                />

                <div
                  v-if="form.favicon_url"
                  class="flex flex-col items-center justify-center space-y-3 py-2"
                >
                  <div
                    class="w-16 h-16 rounded-xl bg-white border border-slate-200 p-2 flex items-center justify-center shadow-xs overflow-hidden"
                  >
                    <img
                      :src="form.favicon_url"
                      alt="Favicon preview"
                      class="w-10 h-10 object-contain"
                    />
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="triggerFaviconSelect"
                      class="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadOutlined /> Thay đổi
                    </button>
                    <button
                      type="button"
                      @click="clearFavicon"
                      class="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <DeleteOutlined /> Xóa
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  @click="triggerFaviconSelect"
                  class="flex flex-col items-center justify-center space-y-2 py-4 cursor-pointer"
                >
                  <div
                    class="w-10 h-10 rounded-full bg-orange-100 text-[#ee4d2d] flex items-center justify-center group-hover:scale-110 transition-transform"
                  >
                    <CompassOutlined class="text-lg" />
                  </div>
                  <div class="text-xs font-bold text-slate-700">
                    Tải lên Favicon
                  </div>
                  <div class="text-[11px] text-slate-400 text-center">
                    Bấm để chọn file Icon (.png, .ico, .svg)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Mockup Preview Section -->
          <div class="pt-4 border-t border-slate-100 space-y-4">
            <div
              class="flex items-center gap-2 text-xs font-bold text-slate-700 text-left"
            >
              <EyeOutlined class="text-[#ee4d2d]" />
              <span>Live Mockup Preview (Xem trước hiển thị trực quan)</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- 1. Header Navbar Mockup -->
              <div class="space-y-1.5 text-left">
                <span class="text-[11px] font-bold text-slate-500"
                  >1. Hiển thị trên thanh Header Navbar:</span
                >
                <div
                  class="rounded-xl overflow-hidden border border-slate-200 shadow-xs"
                >
                  <!-- Light Gradient Header Simulation -->
                  <div
                    class="bg-gradient-to-r from-[#ee4d2d] via-[#f05330] to-[#ff5722] p-3 flex items-center justify-between text-white"
                  >
                    <div class="flex items-center gap-2.5">
                      <div
                        class="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-xs overflow-hidden shrink-0"
                      >
                        <img
                          v-if="form.logo_url"
                          :src="form.logo_url"
                          alt="Logo"
                          class="w-full h-full object-contain p-0.5"
                        />
                        <GiftOutlined v-else class="text-base text-[#ee4d2d]" />
                      </div>
                      <div class="flex flex-col">
                        <span
                          class="font-black text-xs tracking-tight leading-none truncate max-w-[150px]"
                        >
                          {{ form.site_name || "Affiliate - Hoàn tiền" }}
                        </span>
                        <span class="text-[10px] text-orange-100 font-medium"
                          >Hoàn tiền Affiliate</span
                        >
                      </div>
                    </div>
                    <div
                      class="h-6 px-2.5 rounded-full bg-white/20 text-[10px] font-bold flex items-center"
                    >
                      Menu
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Browser Tab Mockup -->
              <div class="space-y-1.5 text-left">
                <span class="text-[11px] font-bold text-slate-500"
                  >2. Hiển thị trên Tab Trình duyệt (Favicon):</span
                >
                <div
                  class="bg-slate-200 rounded-xl p-2.5 border border-slate-300 shadow-xs space-y-2"
                >
                  <!-- Chrome Tab Bar simulation -->
                  <div
                    class="flex items-center gap-1.5 bg-slate-100 rounded-t-lg p-1.5 max-w-[240px] border border-slate-300/80 shadow-2xs"
                  >
                    <div
                      class="w-4 h-4 rounded-sm flex items-center justify-center overflow-hidden shrink-0"
                    >
                      <img
                        v-if="form.favicon_url"
                        :src="form.favicon_url"
                        alt="Favicon"
                        class="w-full h-full object-contain"
                      />
                      <GlobalOutlined v-else class="text-xs text-slate-500" />
                    </div>
                    <span
                      class="text-[11px] font-medium text-slate-700 truncate"
                    >
                      {{ previewTitle }}
                    </span>
                  </div>
                  <!-- Address Bar simulation -->
                  <div
                    class="bg-white rounded-lg px-3 py-1 text-[11px] font-mono text-slate-500 border border-slate-300 flex items-center gap-1.5"
                  >
                    <span class="text-emerald-600 font-bold">🔒 https://</span>
                    <span class="truncate">your-domain.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card 2: Cấu hình SEO & Meta Tags -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-7 space-y-5"
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
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
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
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
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
                class="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
              />
              <p class="text-[11px] text-slate-400">
                Các từ khóa cách nhau bởi dấu phẩy.
              </p>
            </div>
          </div>
        </div>

        <!-- Card 3: Live Search Preview (Google Simulation) -->
        <div
          class="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-4 sm:p-7 space-y-3 shadow-md"
        >
          <div class="flex items-center gap-2 text-xs font-bold text-slate-300">
            <SearchOutlined class="text-blue-400" />
            <span>Xem trước kết quả hiển thị trên Google (SEO Preview)</span>
          </div>

          <div
            class="bg-white rounded-xl p-3.5 sm:p-4 text-left space-y-1 border border-slate-700"
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

        <!-- Card: Cấu hình Phương thức Đăng nhập -->
        <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-7 space-y-5">
          <div class="flex items-center justify-between pb-3 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <SafetyCertificateOutlined class="text-[#ee4d2d]" />
              <span class="text-sm font-extrabold text-slate-900">Phương thức Đăng nhập</span>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
            <div class="space-y-0.5 text-left">
              <label class="text-xs sm:text-sm font-bold text-slate-800 block cursor-pointer">
                Bật/tắt "Đăng nhập bằng Google"
              </label>
              <p class="text-[11px] sm:text-xs text-slate-500 m-0">
                Cho phép người dùng sử dụng tài khoản google làm phương thức đăng nhập
              </p>
            </div>
            <a-switch v-model:checked="form.enable_google_login" />
          </div>
        </div>

        <!-- Card 4: Đổi mật khẩu Quản trị -->
        <div
          class="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-7 space-y-5"
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
                  class="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
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
                  class="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
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
                  class="w-full rounded-xl border border-slate-200 pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#ee4d2d] focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all bg-slate-50/50 focus:bg-white"
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
              class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-900/10 flex items-center justify-center gap-2 disabled:opacity-60"
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
