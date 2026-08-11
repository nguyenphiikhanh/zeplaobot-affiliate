<template>
  <a-modal
    v-model:open="visible"
    :footer="null"
    :closable="false"
    :width="460"
    centered
    class="referral-promote-modal"
  >
    <div class="space-y-4 sm:space-y-5 text-slate-800 dark:text-slate-100 pt-2">
      <!-- Gradient Header Badge -->
      <div
        class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500 p-5 text-white shadow-lg shadow-orange-500/20 text-center space-y-2"
      >
        <div
          class="w-12 h-12 mx-auto rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl"
        >
          🎁
        </div>
        <h3
          class="text-lg sm:text-xl font-black text-white m-0 tracking-tight leading-snug"
        >
          Giới Thiệu Ngay - Nhận Quà Liền Tay!
        </h3>
        <p
          class="text-xs text-white/90 font-medium m-0 leading-relaxed max-w-sm mx-auto"
        >
          Thưởng <strong class="text-amber-200">+5 S-Point</strong> cho đơn hàng
          đầu tiên &amp;
          <strong class="text-amber-200">5% hoa hồng</strong> trong 365 ngày cho
          cả hai!
        </p>
      </div>

      <!-- Quick Copy Referral Link -->
      <div class="space-y-1.5">
        <label
          class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block"
        >
          Liên kết giới thiệu của bạn
        </label>
        <div
          class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <span
            class="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 pl-2 truncate flex-1"
          >
            {{ referralLink || "Đang tải link..." }}
          </span>
          <a-button
            type="primary"
            size="middle"
            class="bg-orange-500 hover:bg-orange-600 text-white font-bold border-0 rounded-lg shadow-sm shrink-0 text-xs flex items-center gap-1"
            @click="copyLink"
          >
            <CopyOutlined /> {{ copied ? "Đã chép" : "Sao chép" }}
          </a-button>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-2.5">
        <a-button
          block
          type="primary"
          size="large"
          class="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black border-0 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm h-11"
          @click="goToReferralPage"
        >
          <ShareAltOutlined /> Giới thiệu bạn bè ngay
        </a-button>

        <div class="text-center pt-0.5">
          <button
            type="button"
            class="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
            @click="goToReferralPage"
          >
            <FileTextOutlined /> Xem thể lệ chương trình &rarr;
          </button>
        </div>
      </div>

      <!-- Modal Footer: Checkbox 72h & Close Button -->
      <div
        class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs"
      >
        <label
          class="flex items-center gap-1.5 cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 select-none"
        >
          <input
            type="checkbox"
            v-model="dontShow72h"
            class="rounded border-slate-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
          />
          <span>Không hiển thị lại trong 72h</span>
        </label>

        <a-button
          type="text"
          size="small"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold"
          @click="handleClose"
        >
          Đóng
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { message } from "ant-design-vue";
import {
  CopyOutlined,
  ShareAltOutlined,
  FileTextOutlined,
} from "@ant-design/icons-vue";

const visible = ref(false);
const copied = ref(false);
const dontShow72h = ref(false);

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const referralLink = computed(() => {
  const code = authStore.user?.referral_code;
  if (!code) return "";
  const origin = window.location.origin;
  return `${origin}/?ref=${code}`;
});

const checkAndShowModal = () => {
  // Only show for logged in users
  if (!authStore.token) return;

  // Do not show if already on the /gioi-thieu page
  if (route.name === "gioi-thieu") return;

  const untilStr = localStorage.getItem("saffi_ref_modal_until");
  if (untilStr) {
    const until = Number(untilStr);
    if (Date.now() < until) {
      return; // Still in snooze period
    }
  }

  // Delay smooth popup 1.5s after page load
  setTimeout(() => {
    visible.value = true;
  }, 1500);
};

const handleClose = () => {
  visible.value = false;
  // Calculate snooze hours: 72 hours if checked, 24 hours default
  const hours = dontShow72h.value ? 72 : 24;
  const snoozeUntil = Date.now() + hours * 60 * 60 * 1000;
  localStorage.setItem("saffi_ref_modal_until", snoozeUntil.toString());
};

const copyLink = () => {
  if (!referralLink.value) return;
  navigator.clipboard.writeText(referralLink.value);
  copied.value = true;
  message.success("Đã sao chép liên kết giới thiệu!");
  setTimeout(() => {
    copied.value = false;
  }, 2500);
};

const goToReferralPage = () => {
  handleClose();
  router.push({ name: "gioi-thieu" });
};

onMounted(() => {
  checkAndShowModal();
});

watch(
  () => route.name,
  () => {
    if (!visible.value) {
      checkAndShowModal();
    }
  }
);
</script>

<style scoped>
:deep(.ant-modal-content) {
  border-radius: 24px !important;
  overflow: hidden;
  padding: 20px !important;
}

html.dark :deep(.ant-modal-content) {
  background-color: #0f172a !important;
  border: 1px solid #1e293b;
}
</style>
