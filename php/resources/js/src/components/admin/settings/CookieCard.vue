<template>
  <a-card :bordered="false" class="settings-card">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 class="m-0 text-sm font-extrabold text-slate-800 dark:text-slate-100">{{ title }}</h4>
          <p class="mt-1 mb-0 text-xs text-slate-500">{{ description }}</p>
        </div>
        <a-button v-if="!editing" type="primary" size="small" @click="editing = true">
          Cập nhật
        </a-button>
      </div>

      <div v-if="!editing" class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
        {{ status }}
      </div>

      <div v-else class="flex flex-col gap-3">
        <a-textarea
          v-model:value="value"
          :rows="5"
          placeholder="Dán cookie mới vào đây..."
        />
        <div class="flex justify-end gap-2">
          <a-button :disabled="loading" @click="cancel">Hủy</a-button>
          <a-button type="primary" :loading="loading" :disabled="!value.trim()" @click="submit">
            Lưu cookie
          </a-button>
        </div>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  title: string;
  description: string;
  status: string;
  loading: boolean;
}>();

const emit = defineEmits<{
  (event: 'save', value: string): void;
}>();

const editing = ref(false);
const value = ref('');

const cancel = () => {
  editing.value = false;
  value.value = '';
};

const submit = () => {
  if (!value.value.trim()) return;
  emit('save', value.value);
  editing.value = false;
  value.value = '';
};
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
