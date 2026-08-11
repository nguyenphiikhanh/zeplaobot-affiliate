<template>
  <PlatformSettingsPage
    v-model="platforms.lazada"
    title="Cấu hình hoàn tiền Lazada"
    description="Quản lý trạng thái vận hành tính năng hoàn tiền Lazada."
    platform-title="Hoàn tiền Lazada"
    platform-description="Cho phép người dùng tạo liên kết và theo dõi hoàn tiền Lazada."
    icon="/icon/lazada.webp"
    icon-class="bg-blue-50 dark:bg-blue-500/10"
    success-message="Lưu cấu hình Lazada thành công!"
    :on-save="savePlatforms"
    v-model:commission-config="commissionSettings.lazada"
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
