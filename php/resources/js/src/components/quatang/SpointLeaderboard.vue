<template>
  <a-card
    :bordered="false"
    class="rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 h-full"
  >
    <template #title>
      <div class="flex items-center justify-between">
        <div
          class="flex items-center gap-2 text-base font-black text-slate-800 dark:text-slate-100"
        >
          <TrophyOutlined class="text-amber-500 text-lg" /> Top S-Point
        </div>
        <a-tag color="orange" class="m-0 font-bold rounded-md text-[10px]"
          >TỔNG TÍCH LŨY</a-tag
        >
      </div>
    </template>

    <a-spin :spinning="loading">
      <!-- Leaderboard List -->
      <div v-if="leaderboard && leaderboard.length > 0" class="space-y-2.5">
        <div
          v-for="(userItem, index) in leaderboard"
          :key="userItem.id"
          class="flex items-center justify-between p-2.5 rounded-2xl transition-all border"
          :class="getItemCardClass(index)"
        >
          <div class="flex items-center gap-2.5 overflow-hidden">
            <!-- Distinct Activity Icon for Top 3 vs Others -->
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border"
              :class="getIconBadgeClass(index)"
            >
              <CrownOutlined v-if="index === 0" />
              <FireOutlined v-else-if="index === 1" />
              <StarOutlined v-else-if="index === 2" />
              <ThunderboltOutlined v-else />
            </div>
            <div class="overflow-hidden">
              <div
                class="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[150px]"
              >
                {{ userItem.name }}
              </div>
            </div>
          </div>

          <div class="text-right shrink-0">
            <div
              class="font-black"
              :class="index < 3 ? 'text-[#ee4d2d] text-sm' : 'text-slate-700 dark:text-slate-300 text-xs'"
            >
              {{ userItem.spoint_total ?? userItem.spoint_balance }}
              <span class="text-[9px] font-bold">P</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-8 text-center">
        <a-empty
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
        >
          <template #description>
            <span class="text-xs font-medium text-slate-400">
              Chưa có dữ liệu xếp hạng S-Point
            </span>
          </template>
        </a-empty>
      </div>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
import {
  TrophyOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  FireOutlined,
  StarOutlined,
} from "@ant-design/icons-vue";
import { Empty } from "ant-design-vue";

defineProps<{
  leaderboard: any[];
  loading: boolean;
}>();

const getItemCardClass = (index: number) => {
  if (index === 0)
    return "bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-300/90 dark:border-amber-700/80 shadow-sm";
  if (index === 1)
    return "bg-gradient-to-r from-slate-300/25 via-slate-200/10 to-transparent border-slate-300 dark:border-slate-700/80";
  if (index === 2)
    return "bg-gradient-to-r from-orange-500/15 via-orange-500/5 to-transparent border-orange-300/90 dark:border-orange-700/80";
  return "bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700";
};

const getIconBadgeClass = (index: number) => {
  if (index === 0)
    return "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-400/40";
  if (index === 1)
    return "bg-slate-300/40 text-slate-700 dark:text-slate-200 border-slate-300/60 dark:border-slate-600";
  if (index === 2)
    return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-400/40";
  return "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200/50 dark:border-slate-700/50";
};
</script>
