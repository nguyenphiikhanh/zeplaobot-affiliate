<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    :centered="true"
    :closable="false"
    width="460px"
    class="early-bird-modal"
  >
    <div class="text-center py-4 sm:py-5 px-2 sm:px-4 space-y-4">
      <!-- Top 1 Gold Header -->
      <div v-if="rank === 1" class="space-y-3">
        <div
          class="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto flex items-center justify-center"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full blur-xl opacity-60 animate-pulse"
          ></div>
          <img
            :src="'/saffi_gold.webp'"
            alt="Gold Saffi"
            class="w-full h-full object-contain relative z-10 transform hover:scale-105 transition-transform"
          />
        </div>
        <div
          class="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-black uppercase tracking-wider"
        >
          👑 TOP 1 ĐIỂM DANH SỚM NHẤT
        </div>
        <h3 class="text-xl font-black text-amber-900 dark:text-amber-200 m-0">
          CAO THỦ DẬY SỚM! 🏆
        </h3>
        <p
          class="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed m-0"
        >
          Báo thức chưa kịp kêu mà bạn đã nổ điểm danh rồi! Bạn chính là thần
          tốc độ rinh <b>S-Point</b> hôm nay! 🚀
        </p>
      </div>

      <!-- Regular Checkin Header -->
      <div v-else class="space-y-3">
        <div
          class="relative w-36 h-36 sm:w-40 sm:h-40 mx-auto flex items-center justify-center"
        >
          <div
            class="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full blur-xl opacity-60 animate-pulse"
          ></div>
          <img
            :src="'/saffi_gold.webp'"
            alt="Gold Saffi"
            class="w-full h-full object-contain relative z-10 transform hover:scale-105 transition-transform"
          />
        </div>
        <div
          class="inline-block px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 border border-orange-300 text-orange-900 dark:text-orange-200 text-xs font-black uppercase tracking-wider"
        >
          🎉 ĐIỂM DANH THÀNH CÔNG
        </div>
        <h3 class="text-xl font-black text-orange-900 dark:text-orange-200 m-0">
          ĐÃ TÍCH ĐIỂM HÔM NAY! ✨
        </h3>
        <p
          class="text-xs text-orange-800 dark:text-orange-300 font-medium leading-relaxed m-0"
        >
          Bạn đã điểm danh thành công Ngày {{ streak }}/5! Tiếp tục duy trì
          chuỗi liên tiếp để nhận thêm thưởng nhé! 🚀
        </p>
      </div>

      <!-- Points Breakdown Card -->
      <div
        class="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 border border-orange-200 dark:border-slate-700 rounded-2xl p-4 space-y-2.5 shadow-sm text-left"
      >
        <div
          class="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium"
        >
          <span>Điểm danh gốc (Ngày {{ streak }}/5):</span>
          <span class="font-bold text-slate-800 dark:text-slate-100"
            >+{{ basePoints }} S-Point</span
          >
        </div>
        <div
          v-if="earlyBirdPoints > 0"
          class="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-bold"
        >
          <span>⚡ Thưởng điểm danh sớm nhất:</span>
          <span class="font-black text-amber-600 dark:text-amber-400"
            >+{{ earlyBirdPoints }} S-Point</span
          >
        </div>
        <div
          class="border-t border-orange-200 dark:border-slate-700 pt-2 flex items-center justify-between"
        >
          <span
            class="text-xs font-black text-slate-900 dark:text-white uppercase"
            >Tổng nhận hôm nay:</span
          >
          <span class="text-xl font-black text-[#ee4d2d]"
            >+{{ totalPoints }} S-Point 🎉</span
          >
        </div>
      </div>

      <!-- Cashback Encouragement Note -->
      <p
        class="text-xs font-bold text-orange-800 dark:text-orange-200 bg-orange-100/70 dark:bg-orange-950/50 p-2.5 rounded-xl border border-orange-200/80 dark:border-orange-900/60 m-0"
      >
        🛍️ Đừng quên mua sắm qua Saffi để hoàn thêm tiền nhé!
      </p>

      <!-- Action Buttons -->
      <div class="space-y-2 pt-1">
        <a-button
          type="primary"
          size="large"
          block
          @click="handleGoToCashback"
          class="h-11 rounded-xl font-black text-sm uppercase bg-gradient-to-r from-orange-500 to-rose-500 border-0 shadow-md hover:from-orange-600 hover:to-rose-600 flex items-center justify-center gap-1.5"
        >
          <ShoppingOutlined /> Mua sắm hoàn tiền ngay
        </a-button>

        <a-button
          type="text"
          block
          @click="visible = false"
          class="text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Đóng
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { ShoppingOutlined } from "@ant-design/icons-vue";

const props = defineProps<{
  open: boolean;
  rank: number;
  basePoints: number;
  earlyBirdPoints: number;
  totalPoints: number;
  streak: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const router = useRouter();

const visible = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const handleGoToCashback = () => {
  visible.value = false;
  router.push("/hoan-tien");
};
</script>

<style scoped>
:deep(.ant-modal-content) {
  border-radius: 1.5rem !important;
  overflow: hidden;
  padding: 1rem !important;
}
</style>
