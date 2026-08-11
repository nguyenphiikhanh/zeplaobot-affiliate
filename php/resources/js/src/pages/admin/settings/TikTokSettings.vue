<template>
  <PlatformSettingsPage
    v-model="platforms.tiktok"
    title="Cấu hình hoàn tiền TikTok Shop"
    description="Quản lý trạng thái vận hành tính năng hoàn tiền TikTok Shop."
    platform-title="Hoàn tiền TikTok Shop"
    platform-description="Cho phép người dùng tạo liên kết và theo dõi hoàn tiền TikTok Shop."
    icon="/icon/tiktok.webp"
    icon-class="bg-slate-100 dark:bg-slate-800"
    success-message="Lưu cấu hình TikTok Shop thành công!"
    :on-save="savePlatforms"
    v-model:commission-config="commissionSettings.tiktok"
    :commission-loading="loadingCommissionSettings"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import PlatformSettingsPage from '@/components/admin/settings/PlatformSettingsPage.vue';
import { useAdminSystemSettings } from '@/composables/useAdminSystemSettings';
import { useCommissionSettings } from '@/composables/useCommissionSettings';

const { platforms, loadPlatforms, savePlatforms: savePlatformStatus } = useAdminSystemSettings();
const {
  commissionSettings,
  loadingCommissionSettings,
  loadCommissionSettings,
  saveCommissionSettings,
} = useCommissionSettings();

const savePlatforms = () => Promise.all([savePlatformStatus(), saveCommissionSettings()]).then(() => undefined);

onMounted(() => Promise.all([loadPlatforms(), loadCommissionSettings()]));
</script>
