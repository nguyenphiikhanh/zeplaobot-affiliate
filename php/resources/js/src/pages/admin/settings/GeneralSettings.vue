<template>
  <section>
    <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="m-0 text-base font-black text-slate-900 dark:text-white">Cấu hình chung</h3>
        <p class="mt-1 mb-0 text-xs text-slate-500">
          Quản lý thông tin liên hệ và nội dung nhận diện website.
        </p>
      </div>
      <a-button type="primary" :loading="saving" class="font-bold" @click="save">
        Lưu cấu hình
      </a-button>
    </div>

    <a-spin :spinning="loading">
      <a-form layout="vertical" class="flex flex-col gap-5">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div class="mb-5">
            <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">Cấu hình liên hệ</h4>
            <p class="mt-1 mb-0 text-xs text-slate-500">
              Các kênh hỗ trợ được hiển thị trên website và trong email hệ thống.
            </p>
          </div>

          <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <a-form-item label="Zalo" class="mb-0">
              <a-input
                v-model:value="settings.contact_zalo"
                placeholder="https://zalo.me/..."
              />
            </a-form-item>
            <a-form-item label="Email" class="mb-0">
              <a-input
                v-model:value="settings.contact_email"
                type="email"
                placeholder="support@example.com"
              />
            </a-form-item>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div class="mb-5">
            <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">Cấu hình trang</h4>
            <p class="mt-1 mb-0 text-xs text-slate-500">
              Tên hiển thị và mô tả được sử dụng cho tiêu đề, SEO và chia sẻ mạng xã hội.
            </p>
          </div>

          <a-form-item label="Tên Website">
            <a-input
              v-model:value="settings.site_name"
              :maxlength="100"
              show-count
              placeholder="Tên website"
            />
          </a-form-item>
          <a-form-item label="Mô tả Website (SEO Meta)" class="mb-0">
            <a-textarea
              v-model:value="settings.seo_description"
              :maxlength="320"
              :rows="4"
              show-count
              placeholder="Mô tả ngắn gọn nội dung website"
            />
          </a-form-item>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div class="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
            <h4 class="m-0 flex items-center gap-2 text-sm font-black uppercase text-slate-900 dark:text-white">
              <PictureOutlined class="text-[#ee4d2d]" />
              Hình ảnh &amp; nhận diện thương hiệu
            </h4>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div
              v-for="asset in brandingAssets"
              :key="asset.key"
              class="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50/40 p-4 dark:border-slate-700 dark:bg-slate-950/30"
            >
              <div class="mb-3 text-xs font-black uppercase text-slate-800 dark:text-slate-100">
                {{ asset.label }}
              </div>
              <div class="mb-3 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                Kích thước đề xuất: <strong>{{ asset.size }}</strong>
              </div>
              <div
                class="flex h-28 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-white p-3 dark:border-slate-600 dark:bg-slate-800"
              >
                <img
                  :src="settings[asset.key]"
                  :alt="asset.label"
                  class="h-full w-full"
                  :class="asset.key === 'social_share_image' ? 'object-cover' : 'object-contain'"
                />
              </div>
              <div class="mt-auto pt-3">
                <a-button
                  block
                  class="font-bold"
                  :loading="uploadingAsset === asset.key"
                  :disabled="Boolean(uploadingAsset)"
                  @click="selectAsset(asset.key)"
                >
                  <template #icon><UploadOutlined /></template>
                  Tải ảnh lên
                </a-button>
              </div>
            </div>
          </div>

          <input
            ref="fileInput"
            type="file"
            style="display: none"
            accept="image/jpeg,image/png,image/webp,image/gif"
            @change="uploadAsset"
          />

          <div class="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Ảnh mới sẽ thay thế ảnh đã upload trước đó của cùng loại. Hỗ trợ JPG, PNG, WEBP, GIF; tối đa 5 MB.
          </div>

          <div class="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
            <strong>Mẹo hữu ích:</strong>
            Bạn có thể sử dụng
            <a
              href="https://chatgpt.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-[#ee4d2d] underline"
            >ChatGPT</a>
            để tạo logo không nền. Sau đó, sử dụng công cụ cắt ảnh tại
            <a
              href="https://www.img2go.com/vi/crop-image"
              target="_blank"
              rel="noopener noreferrer"
              class="font-bold text-[#ee4d2d] underline"
            >img2go.com</a>
            để cắt bớt khoảng trắng dư thừa giúp logo hiển thị cân đối và đẹp mắt nhất.
          </div>
        </div>
      </a-form>
    </a-spin>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import axios from '@/api/axios';
import { useSiteSettings } from '@/composables/useSiteSettings';
import { PictureOutlined, UploadOutlined } from '@ant-design/icons-vue';

const settings = reactive({
  contact_zalo: '',
  contact_email: '',
  site_name: '',
  seo_description: '',
  logo_light: '/saffi_logo.webp',
  favicon: '/saficon.webp',
  social_share_image: '/saffi_gold.webp',
  loading_image: '/saffi_gold.webp',
});
const loading = ref(false);
const saving = ref(false);
const uploadingAsset = ref('');
const selectedAsset = ref('');
const fileInput = ref<HTMLInputElement | null>(null);
const { loadSiteSettings } = useSiteSettings();

type BrandingAssetKey = 'logo_light' | 'favicon' | 'social_share_image' | 'loading_image';

const brandingAssets: Array<{ key: BrandingAssetKey; label: string; size: string }> = [
  { key: 'logo_light', label: 'Logo Website', size: '600 × 200 px (3:1) hoặc 512 × 512 px (1:1)' },
  { key: 'favicon', label: 'Favicon Website', size: '512 × 512 px (tỷ lệ 1:1)' },
  { key: 'social_share_image', label: 'Ảnh Share MXH (SEO)', size: '1200 × 630 px' },
  { key: 'loading_image', label: 'Ảnh Loading', size: '512 × 512 px (PNG/WEBP nền trong suốt)' },
];

const selectAsset = (asset: BrandingAssetKey) => {
  selectedAsset.value = asset;
  if (fileInput.value) {
    fileInput.value.value = '';
    fileInput.value.click();
  }
};

const uploadAsset = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const asset = selectedAsset.value as BrandingAssetKey;
  if (!file || !asset) return;

  if (file.size > 5 * 1024 * 1024) {
    message.error('Ảnh tải lên không được vượt quá 5 MB.');
    return;
  }

  uploadingAsset.value = asset;
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(
      `/admin/system-config/site-settings/assets/${asset}`,
      formData,
    );
    const data = response?.data?.data;
    if (data) Object.assign(settings, data);
    await loadSiteSettings(true);
    message.success('Cập nhật hình ảnh thành công!');
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể tải hình ảnh lên.');
  } finally {
    uploadingAsset.value = '';
    selectedAsset.value = '';
  }
};

const load = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/site-settings');
    Object.assign(settings, response?.data?.data ?? response?.data);
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể tải cấu hình chung.');
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  saving.value = true;
  try {
    const response = await axios.put('/admin/system-config/site-settings', settings);
    const data = response?.data?.data;
    if (data) Object.assign(settings, data);
    await loadSiteSettings(true);
    message.success('Lưu cấu hình chung thành công!');
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể lưu cấu hình chung.');
  } finally {
    saving.value = false;
  }
};

onMounted(load);
</script>
