<template>
  <a-card :bordered="false" class="settings-card">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" :class="iconClass">
          <img :src="icon" :alt="title" class="h-7 w-7 object-contain" />
        </div>
        <div>
          <h4 class="m-0 text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {{ title }}
          </h4>
          <p class="mt-1 mb-0 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {{ description }}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3 self-end sm:self-auto">
        <span class="text-xs font-bold text-slate-500">
          {{ modelValue ? 'Đang hoạt động' : 'Đang tắt' }}
        </span>
        <a-switch
          :checked="modelValue"
          @update:checked="$emit('update:modelValue', $event)"
        />
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean;
  title: string;
  description: string;
  icon: string;
  iconClass?: string;
}>(), {
  iconClass: 'bg-orange-50 dark:bg-orange-500/10',
});

defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();
</script>

<style scoped>
.settings-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 16px;
  box-shadow: none;
}

:global(.dark) .settings-card {
  border-color: rgb(30 41 59);
}
</style>
