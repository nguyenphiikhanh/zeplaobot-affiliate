<template>
  <div class="w-full space-y-4 sm:space-y-6">
    <!-- User Welcome & Rank Section -->
    <a-row :gutter="[16, 16]" v-if="user" class="mb-4 sm:mb-6">
      <a-col :xs="24" :lg="15">
        <a-card :bordered="false" class="h-full rounded-2xl sm:rounded-[1.5rem] bg-[#fffaf3] dark:bg-[#ee4d2d]/10 border border-orange-500/10 shadow-sm relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 dark:bg-orange-500/20 rounded-full blur-[60px] translate-x-1/3 -translate-y-1/2 pointer-events-none"></div>

          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative z-10 h-full">
            <div class="flex items-center gap-3 sm:gap-4 flex-1">
              <div class="w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl sm:text-2xl border-2 sm:border-4 border-white dark:border-slate-800 overflow-hidden shadow-sm">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer"
                  :alt="userName"
                />
                <span v-else>{{ firstLetter }}</span>
              </div>

              <div class="flex-1 min-w-0">
                <h2 class="text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100 m-0 mb-0.5 sm:mb-1 tracking-tight">Xin chào, {{ userName }}!</h2>
                <p class="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed m-0 max-w-lg">
                  Rank <strong class="text-[#ee4d2d]">{{ rankInfo.name }}</strong>
                  &middot; Hoàn <strong class="text-[#ee4d2d]">{{ rankProgress.normalRate }}%</strong> thưởng &middot;
                  <strong class="text-[#ee4d2d]">{{ rankProgress.promoRate }}%</strong> ngày đôi.
                </p>
              </div>
            </div>

            <div class="shrink-0 mt-1 sm:mt-0">
              <router-link :to="{ name: 'hoan-tien' }">
                <a-button
                  type="primary"
                  class="h-9 sm:h-10 font-bold text-[11px] sm:text-[12px] tracking-wider sm:tracking-widest rounded-full shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <span>MUA SẮM HOÀN TIỀN NGAY</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a-button>
              </router-link>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :lg="9">
        <a-card :bordered="false" class="h-full rounded-2xl sm:rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div class="flex items-center gap-4 sm:gap-5">
            <div
              class="relative w-[76px] h-[76px] sm:w-[100px] sm:h-[100px] shrink-0 rounded-full flex items-center justify-center"
              :style="{ background: `conic-gradient(#EE4D2D ${rankProgress.percent}%, transparent ${rankProgress.percent}%)` }"
            >
              <div class="absolute inset-[8px] sm:inset-[10px] bg-white dark:bg-slate-900 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  :src="rankInfo.image"
                  :alt="rankInfo.name"
                  class="w-10 h-10 sm:w-14 sm:h-14 object-contain transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div class="absolute inset-0 rounded-full border border-slate-100 dark:border-slate-800 -z-10"></div>
            </div>

            <div class="flex flex-col flex-1">
              <div class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-400">XẾP HẠNG</div>
              <div class="text-xl sm:text-[26px] font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none my-0.5 sm:my-1">{{ rankInfo.name }}</div>

              <div class="text-xs sm:text-[13px] text-slate-500 font-medium mt-0.5 sm:mt-1">
                Đơn hàng:
                <span class="font-bold text-slate-800 dark:text-slate-200">
                  {{ user.completed_orders_count ?? 0 }} / {{ rankProgress.nextThreshold }}
                </span>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- Leaderboard -->
    <div v-if="user" ref="leaderboardRef" class="w-full min-h-[80px]">
      <HomeLeaderboard v-if="leaderboardVisible" />
    </div>

    <!-- Generic Content for Guests -->
    <div v-else class="text-center py-20">
      <h1 class="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">Chào mừng đến với Saffi</h1>
      <p class="text-slate-500 mb-8">Trợ lý mua sắm hoàn tiền thông minh dành cho bạn.</p>
      <router-link :to="{ name: 'login' }">
        <a-button type="primary" size="large" class="font-bold rounded-lg px-8">Đăng Nhập Ngay</a-button>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Home'
});

import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import HomeLeaderboard from "@/components/HomeLeaderboard.vue";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const userName = computed(() => user.value?.name || "bạn");
const userAvatar = computed(() => user.value?.avatar || "");
const firstLetter = computed(() => userName.value.charAt(0).toUpperCase());

const leaderboardRef = ref(null);
const leaderboardVisible = ref(false);

onMounted(() => {
  if (typeof IntersectionObserver === "undefined" || !leaderboardRef.value) {
    leaderboardVisible.value = true;
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        leaderboardVisible.value = true;
        observer.disconnect();
      }
    },
    { rootMargin: "200px" }
  );
  observer.observe(leaderboardRef.value);
});

const rankInfo = computed(() => {
  const rank = user.value?.rank || "silver";
  if (rank === "obsidian") return { name: "TINH HOA", image: "/saffi_obsidian.webp" };
  if (rank === "gold") return { name: "VÀNG", image: "/saffi_gold.webp" };
  return { name: "BẠC", image: "/saffi_silver.webp" };
});

const rankProgress = computed(() => {
  const count = user.value?.completed_orders_count ?? 0;
  const rank = user.value?.rank || "silver";

  if (rank === "obsidian")
    return { nextRankName: "ĐẠT ĐỈNH", nextThreshold: 50, percent: 100, normalRate: 80, promoRate: 90 };
  if (rank === "gold")
    return {
      nextRankName: "TINH HOA",
      nextThreshold: 50,
      percent: Math.min(Math.round((count / 50) * 100), 100),
      normalRate: 70,
      promoRate: 80,
    };
  return {
    nextRankName: "VÀNG",
    nextThreshold: 10,
    percent: Math.min(Math.round((count / 10) * 100), 100),
    normalRate: 60,
    promoRate: 70,
  };
});
</script>

<style scoped>
@keyframes soft-fade-in {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.75; transform: scale(0.98); }
}

.animate-soft-fade {
  animation: soft-fade-in 2.5s ease-in-out infinite;
  will-change: opacity, transform; /* Tối ưu hiệu năng render */
}
</style>
