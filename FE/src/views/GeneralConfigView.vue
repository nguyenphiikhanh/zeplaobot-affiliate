<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { message } from "ant-design-vue";
import {
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
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
      error.response?.data?.message || "Không thể tải cấu hình chung"
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
    message.success("Lưu cấu hình chung & SEO thành công!");
  } catch (error: any) {
    message.error(
      error.response?.data?.message || "Không thể lưu cấu hình chung"
    );
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadSettings();
});

const previewTitle = computed(
  () => form.value.meta_title || form.value.site_name || "Tiêu đề trang web"
);
const previewDesc = computed(
  () =>
    form.value.meta_description ||
    form.value.site_description ||
    "Mô tả hiển thị trên kết quả tìm kiếm..."
);
</script>

<template>
  <section class="space-y-6 max-w-5xl mx-auto pb-10 text-left">
    <!-- Page Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5"
    >
      <div>
        <h1
          class="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5"
        >
          <div
            class="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs"
          >
            <GlobalOutlined class="text-xl" />
          </div>
          <span>Cấu hình chung & SEO</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">
          Quản lý tên trang web, mô tả và cài đặt Meta Tags tối ưu cho công cụ
          tìm kiếm (Google, Zalo).
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
      </div>
    </a-spin>
  </section>
</template>
