<template>
  <a-card
    :bordered="false"
    class="rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full"
  >
    <template #title>
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div
          class="flex items-center gap-2 text-base font-black text-slate-800 dark:text-slate-100"
        >
          <DollarOutlined class="text-orange-500 text-lg" /> Quy Đổi S-Point
        </div>
        <div class="flex items-center gap-1.5 text-xs font-bold">
          <span class="text-slate-400">Khả dụng:</span>
          <span
            class="px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#ee4d2d] dark:text-orange-400 font-extrabold border border-orange-200 dark:border-orange-900/60"
          >
            {{ spointBalance }} S-Point
          </span>
        </div>
      </div>
    </template>

    <div class="space-y-4">
      <!-- Rate Explanation Banner -->
      <div
        class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60"
      >
        <p
          class="text-xs text-slate-600 dark:text-slate-300 font-medium m-0 leading-relaxed"
        >
          💡
          <span class="font-bold text-slate-800 dark:text-slate-100"
            >Tỷ lệ quy đổi linh hoạt:</span
          >
          <span v-if="computedOptions.length > 0">
            Mốc từ {{ computedOptions[0].points }} S-Point = {{ formatVnd(computedOptions[0].amount_vnd) }} VNĐ
          </span>
          <span
            class="text-orange-600 dark:text-orange-400 font-bold block sm:inline"
          >
            (Đổi số điểm càng cao nhận ưu đãi càng lớn)</span
          >
        </p>
      </div>

      <!-- Preset Selection -->
      <div>
        <div
          class="text-xs font-extrabold text-slate-600 dark:text-slate-400 mb-2 flex items-center justify-between"
        >
          <span>Chọn mốc quy đổi:</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="opt in computedOptions"
            :key="opt.points"
            type="button"
            @click="exchangePoints = opt.points"
            class="py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5"
            :class="
              exchangePoints === opt.points
                ? 'border-[#ee4d2d] bg-gradient-to-r from-orange-500 to-[#ee4d2d] text-white shadow-sm scale-[1.02]'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-orange-400 hover:bg-orange-50/30'
            "
          >
            <span class="font-black text-sm">{{ opt.points }} Point</span>
            <span class="text-[10px] opacity-90 font-medium"
              >{{ formatVnd(opt.amount_vnd) }}đ</span
            >
          </button>
        </div>
      </div>

      <!-- Realtime Calculation Box -->
      <div
        class="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 dark:from-orange-950/40 dark:to-rose-950/40 rounded-2xl p-4 border border-orange-200/80 dark:border-orange-900/60 flex items-center justify-between"
      >
        <div class="space-y-0.5">
          <div class="text-xs font-bold text-slate-600 dark:text-slate-300">
            Số tiền nhận vào ví:
          </div>
          <div class="text-[10px] text-slate-400 font-medium">
            Cộng trực tiếp vào tài khoản
          </div>
        </div>
        <div class="text-xl font-black text-[#ee4d2d]">
          +{{ formatVnd(calculateVndExchange(exchangePoints)) }} VNĐ
        </div>
      </div>

      <!-- Submit Action Button -->
      <a-button
        type="primary"
        size="large"
        block
        :loading="loading"
        :disabled="
          !exchangePoints ||
          exchangePoints < minPoints ||
          exchangePoints > spointBalance
        "
        @click="handleExchangeConfirm"
        class="h-12 rounded-2xl font-black text-sm border-0 shadow-md bg-gradient-to-r from-orange-500 to-[#ee4d2d] hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
      >
        <DollarOutlined /> XÁC NHẬN ĐỔI
      </a-button>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { DollarOutlined } from "@ant-design/icons-vue";
import { Modal, message } from "ant-design-vue";

interface ExchangeOption {
  points: number;
  amount_vnd: number;
}

const props = defineProps<{
  spointBalance: number;
  loading: boolean;
  exchangeOptions?: ExchangeOption[];
}>();

const emit = defineEmits<{
  (e: "exchange", points: number): void;
}>();

const defaultOptions: ExchangeOption[] = [
  { points: 6, amount_vnd: 2000 },
  { points: 12, amount_vnd: 4000 },
  { points: 30, amount_vnd: 12000 },
  { points: 60, amount_vnd: 24000 },
];

const computedOptions = computed<ExchangeOption[]>(() => {
  if (Array.isArray(props.exchangeOptions) && props.exchangeOptions.length > 0) {
    return props.exchangeOptions;
  }
  return defaultOptions;
});

const minPoints = computed(() => {
  return computedOptions.value[0]?.points || 6;
});

const exchangePoints = ref<number | null>(minPoints.value);

watch(
  minPoints,
  (newMin) => {
    if (!exchangePoints.value || exchangePoints.value < newMin) {
      exchangePoints.value = newMin;
    }
  },
  { immediate: true }
);

const formatVnd = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val || 0);
};

const calculateVndExchange = (points: number | null) => {
  if (!points || points < minPoints.value) return 0;

  const exact = computedOptions.value.find((opt) => opt.points === points);
  if (exact) return exact.amount_vnd;

  let bestTier = computedOptions.value[0];
  for (const opt of computedOptions.value) {
    if (points >= opt.points) {
      bestTier = opt;
    }
  }

  return Math.round((points / bestTier.points) * bestTier.amount_vnd);
};

const handleExchangeConfirm = () => {
  if (!exchangePoints.value || exchangePoints.value < minPoints.value) {
    message.error(`Vui lòng chọn tối thiểu ${minPoints.value} S-Point để quy đổi.`);
    return;
  }

  const vndAmount = calculateVndExchange(exchangePoints.value);

  Modal.confirm({
    title: "Xác nhận quy đổi S-Point",
    content: `Bạn có chắc chắn muốn dùng ${
      exchangePoints.value
    } S-Point để đổi lấy ${formatVnd(vndAmount)} VNĐ cộng vào ví?`,
    okText: "Đổi ngay",
    cancelText: "Hủy",
    okButtonProps: {
      style: { backgroundColor: "#ee4d2d", borderColor: "#ee4d2d" },
    },
    onOk() {
      if (exchangePoints.value) {
        emit("exchange", exchangePoints.value);
      }
    },
  });
};
</script>
