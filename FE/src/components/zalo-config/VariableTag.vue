<script setup lang="ts">
import { useZaloConfig } from "../../composables/useZaloConfig";

const props = withDefaults(
  defineProps<{
    name: string;
    variant?: "orange" | "rose";
    size?: "sm" | "md";
  }>(),
  {
    variant: "orange",
    size: "md",
  }
);

const { copyVariable, getVarDesc } = useZaloConfig();
</script>

<template>
  <a-tooltip :title="getVarDesc(props.name)" :trigger="['hover', 'click']">
    <button
      type="button"
      @click="copyVariable(props.name)"
      :class="[
        'rounded-lg font-mono font-bold transition-all cursor-pointer inline-flex items-center justify-center',
        props.variant === 'rose'
          ? 'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700'
          : 'bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700',
        props.size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-[11px]',
      ]"
    >
      {{ props.name }}
    </button>
  </a-tooltip>
</template>
