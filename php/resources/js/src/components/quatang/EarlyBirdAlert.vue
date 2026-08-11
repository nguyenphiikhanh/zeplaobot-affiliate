<template>
  <div
    class="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300/80 dark:border-amber-700/60 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5"
  >
    <!-- Left Section: Icon & Highlighting Reward Info -->
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center text-xl shrink-0 font-black shadow-md shadow-amber-500/20"
      >
        <ThunderboltFilled class="text-slate-900 text-lg" />
      </div>

      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="text-xs sm:text-sm font-black text-slate-900 dark:text-amber-100 uppercase tracking-wide"
          >
            Thưởng Điểm Danh Sớm Mỗi Ngày
          </span>
          <span
            class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-900 dark:text-amber-300"
          >
            Người Điểm Danh Sớm Nhất
          </span>
        </div>

        <!-- Highlighted Reward Badges -->
        <div class="flex flex-wrap items-center gap-2 pt-0.5">
          <div
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-500/10 dark:bg-rose-950/40 border border-rose-400/30 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <span>🥇 Top 1:</span>
            <span class="font-black text-rose-600 dark:text-rose-400"
              >+{{ firstCheckinPoints }} S-Point</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Today's earliest check-in user -->
    <div
      v-if="earlyBirdsToday && earlyBirdsToday.length > 0"
      class="flex items-center gap-2 self-start md:self-center shrink-0 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-200/80 dark:border-slate-800 shadow-sm"
    >
      <span
        class="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-0.5"
      >
        Hôm nay:
      </span>

      <div class="flex items-center gap-1.5">
        <a-tooltip
          v-for="eb in earlyBirdsToday"
          :key="eb.id"
          :title="`Điểm danh sớm nhất: ${eb.user?.name || 'User'} (+${
            eb.early_bird_points
          } S-Point)`"
        >
          <div
            class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs hover:border-amber-400 transition-colors"
          >
            <!-- Rank Crown Badge -->
            <span
              class="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0 shadow-xs bg-gradient-to-r from-amber-400 to-yellow-500"
            >
              {{ eb.early_bird_rank }}
            </span>

            <!-- User Name (Truncated) -->
            <span
              class="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[70px] truncate"
            >
              {{ eb.user?.name || "User" }}
            </span>
          </div>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ThunderboltFilled } from "@ant-design/icons-vue";

defineProps<{
  earlyBirdsToday: any[];
  firstCheckinPoints: number;
}>();
</script>
