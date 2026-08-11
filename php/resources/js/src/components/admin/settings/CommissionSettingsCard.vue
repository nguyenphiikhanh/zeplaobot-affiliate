<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
    <div class="mb-5">
      <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">{{ title }}</h4>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        {{ description }}
      </p>
    </div>

    <a-spin :spinning="loading">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a-form-item label="Hạng Bạc (%)" class="mb-0">
          <a-input-number
            :value="modelValue.rank_rates.silver"
            :min="0"
            :max="100"
            :precision="2"
            class="w-full"
            @update:value="updateRankRate('silver', $event)"
          />
        </a-form-item>
        <a-form-item label="Hạng Vàng (%)" class="mb-0">
          <a-input-number
            :value="modelValue.rank_rates.gold"
            :min="0"
            :max="100"
            :precision="2"
            class="w-full"
            @update:value="updateRankRate('gold', $event)"
          />
        </a-form-item>
        <a-form-item label="Hạng Tinh Hoa (%)" class="mb-0">
          <a-input-number
            :value="modelValue.rank_rates.obsidian"
            :min="0"
            :max="100"
            :precision="2"
            class="w-full"
            @update:value="updateRankRate('obsidian', $event)"
          />
        </a-form-item>
      </div>

      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <a-form-item label="Hoa hồng thêm ngày sale (%)" class="mb-0">
          <a-input-number
            :value="modelValue.sale_day_bonus"
            :min="0"
            :max="100"
            :precision="2"
            class="w-full"
            @update:value="updateField('sale_day_bonus', $event)"
          />
        </a-form-item>
        <a-form-item label="Phí dịch vụ (%)" class="mb-0">
          <a-input-number
            :value="modelValue.service_fee"
            :min="0"
            :max="100"
            :precision="2"
            class="w-full"
            @update:value="updateField('service_fee', $event)"
          />
        </a-form-item>
        <a-form-item label="Thuế (%)" class="mb-0">
          <a-input-number
            :value="modelValue.tax"
            :min="0"
            :max="100"
            :precision="2"
            class="w-full"
            @update:value="updateField('tax', $event)"
          />
        </a-form-item>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import type { CommissionPlatformSettings } from '@/composables/useCommissionSettings';

const props = withDefaults(defineProps<{
  modelValue: CommissionPlatformSettings;
  loading?: boolean;
  title?: string;
  description?: string;
}>(), {
  title: 'Tỷ lệ hoàn tiền',
  description: 'Thiết lập tỷ lệ chia hoa hồng, ưu đãi ngày sale và các khoản khấu trừ trên hoa hồng của người dùng.',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: CommissionPlatformSettings): void;
}>();

const numberValue = (value: number | null) => Number(value ?? 0);

const updateRankRate = (
  rank: keyof CommissionPlatformSettings['rank_rates'],
  value: number | null,
) => {
  emit('update:modelValue', {
    ...props.modelValue,
    rank_rates: {
      ...props.modelValue.rank_rates,
      [rank]: numberValue(value),
    },
  });
};

const updateField = (
  field: 'sale_day_bonus' | 'service_fee' | 'tax',
  value: number | null,
) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: numberValue(value),
  });
};
</script>
