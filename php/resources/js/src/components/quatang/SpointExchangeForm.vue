<template>
  <div class="py-2 space-y-6">
    <!-- Exchange Form Card -->
    <div
      class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 space-y-4"
    >
      <div
        class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3"
      >
        <div>
          <h3 class="text-sm font-black text-slate-800 dark:text-slate-100 m-0">
            Quy Đổi S-Point Sang VNĐ
          </h3>
          <p class="text-xs text-slate-500 m-0 mt-0.5">
            Tỷ lệ linh hoạt: Mốc từ {{ minPoints }} S-Point = {{ formatVnd(computedOptions[0]?.amount_vnd || 2000) }} VNĐ
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs text-slate-400">Khả dụng: </span>
          <span class="text-sm font-black text-[#ee4d2d]"
            >{{ spointBalance }} S-Point</span
          >
        </div>
      </div>

      <!-- Preset Quick Selection Buttons -->
      <div>
        <div class="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
          Chọn mốc quy đổi:
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            v-for="opt in computedOptions"
            :key="opt.points"
            type="button"
            @click="exchangePoints = opt.points"
            class="py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center"
            :class="
              exchangePoints === opt.points
                ? 'border-[#ee4d2d] bg-orange-500 text-white shadow-sm'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-orange-400'
            "
          >
            {{ opt.points }} Point ({{ formatVnd(opt.amount_vnd) }}đ)
          </button>
        </div>
      </div>

      <!-- Custom Input Field -->
      <div>
        <label
          class="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1"
        >
          Nhập số S-Point muốn đổi (tối thiểu {{ minPoints }}):
        </label>
        <a-input-number
          v-model:value="exchangePoints"
          :min="minPoints"
          :max="spointBalance"
          size="large"
          class="w-full rounded-xl"
          :placeholder="`Ví dụ: ${minPoints}...`"
        />
      </div>

      <!-- Live Calculation Box -->
      <div
        class="bg-orange-50 dark:bg-orange-950/40 rounded-xl p-3.5 border border-orange-200 dark:border-orange-900/50 flex items-center justify-between"
      >
        <span class="text-xs font-bold text-orange-900 dark:text-orange-200"
          >Số tiền bạn sẽ nhận được:</span
        >
        <span class="text-lg font-black text-[#ee4d2d]"
          >+{{ formatVnd(calculateVndExchange(exchangePoints)) }} VNĐ</span
        >
      </div>

      <!-- Redeem Button -->
      <a-button
        type="primary"
        size="large"
        block
        :loading="exchangeLoading"
        :disabled="
          !exchangePoints ||
          exchangePoints < minPoints ||
          exchangePoints > spointBalance
        "
        @click="handleExchangeConfirm"
        class="h-11 rounded-xl font-bold text-sm border-0 shadow-md bg-[#ee4d2d] hover:bg-orange-600"
      >
        XÁC NHẬN ĐỔI
      </a-button>
    </div>

    <!-- Past Redemptions History Table -->
    <div>
      <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3">
        Lịch Sử Quy Đổi Tiền Mặt
      </h4>
      <a-table
        :data-source="exchangesList"
        :columns="exchangesColumns"
        :loading="exchangesLoading"
        :pagination="exchangesPagination"
        row-key="id"
        size="middle"
        @change="(pag: any) => emit('page-change', pag)"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag color="success">Thành công</a-tag>
          </template>
          <template v-if="column.key === 'points'">
            <span class="font-extrabold text-orange-600"
              >{{ record.points }} Point</span
            >
          </template>
          <template v-if="column.key === 'amount_vnd'">
            <span class="font-black text-[#ee4d2d]"
              >+{{ formatVnd(record.amount_vnd) }} VNĐ</span
            >
          </template>
          <template v-if="column.key === 'created_at'">
            <span class="text-xs font-medium text-slate-500">
              {{ formatDate(record.created_at) }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Modal, message } from "ant-design-vue";

interface ExchangeOption {
  points: number;
  amount_vnd: number;
}

const props = defineProps<{
  spointBalance: number;
  exchangesList: any[];
  exchangesLoading: boolean;
  exchangesPagination: any;
  exchangeLoading: boolean;
  exchangeOptions?: ExchangeOption[];
}>();

const emit = defineEmits<{
  (e: "exchange", points: number): void;
  (e: "page-change", pag: any): void;
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

const exchangesColumns = [
  { title: "Thời gian", dataIndex: "created_at", key: "created_at" },
  { title: "S-Point đổi", dataIndex: "points", key: "points" },
  { title: "Số tiền nhận", dataIndex: "amount_vnd", key: "amount_vnd" },
  { title: "Trạng thái", key: "status" },
];

const formatVnd = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    message.error(`Vui lòng chọn số S-Point tối thiểu là ${minPoints.value}.`);
    return;
  }

  const vndAmount = calculateVndExchange(exchangePoints.value);

  Modal.confirm({
    title: "Xác nhận quy đổi S-Point",
    content: `Bạn có chắc muốn dùng ${
      exchangePoints.value
    } S-Point để đổi lấy ${formatVnd(vndAmount)} VNĐ cộng vào Ví?`,
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
