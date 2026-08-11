<template>
  <section>
    <div class="mb-6">
      <h3 class="m-0 text-base font-black text-slate-900 dark:text-white">{{ title }}</h3>
      <p class="mt-1 mb-0 text-xs text-slate-500">{{ description }}</p>
    </div>

    <PlatformStatusCard
      :model-value="modelValue"
      :title="platformTitle"
      :description="platformDescription"
      :icon="icon"
      :icon-class="iconClass"
      @update:model-value="$emit('update:modelValue', $event)"
    />

    <CommissionSettingsCard
      v-if="commissionConfig"
      :model-value="commissionConfig"
      :loading="commissionLoading"
      class="mt-5"
      @update:model-value="$emit('update:commissionConfig', $event)"
    />

    <div class="mt-5 flex justify-end">
      <a-button type="primary" class="font-bold" :loading="saving" @click="save">
        Lưu cấu hình
      </a-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import PlatformStatusCard from './PlatformStatusCard.vue';
import CommissionSettingsCard from './CommissionSettingsCard.vue';
import type { CommissionPlatformSettings } from '@/composables/useCommissionSettings';

const props = defineProps<{
  modelValue: boolean;
  title: string;
  description: string;
  platformTitle: string;
  platformDescription: string;
  icon: string;
  iconClass?: string;
  successMessage: string;
  onSave: () => Promise<void>;
  commissionConfig?: CommissionPlatformSettings;
  commissionLoading?: boolean;
}>();

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'update:commissionConfig', value: CommissionPlatformSettings): void;
}>();

const saving = ref(false);

const save = async () => {
  saving.value = true;
  try {
    await props.onSave();
    message.success(props.successMessage);
  } catch (error: any) {
    message.error(error?.response?.data?.message || 'Không thể lưu cấu hình.');
  } finally {
    saving.value = false;
  }
};
</script>
