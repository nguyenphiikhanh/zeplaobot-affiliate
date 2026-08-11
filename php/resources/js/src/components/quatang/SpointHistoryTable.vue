<template>
  <div class="py-2">
    <a-spin :spinning="loading">
      <!-- List Items (Card Format - Mobile Friendly) -->
      <div v-if="historyList && historyList.length > 0" class="space-y-2.5">
        <div
          v-for="record in historyList"
          :key="record.id"
          class="p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-orange-200 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
        >
          <!-- Left: Icon & Info -->
          <div class="flex items-center gap-3 overflow-hidden">
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 font-black shadow-xs"
              :class="getIconBgClass(record.type)"
            >
              <ThunderboltFilled v-if="record.type === 'early_bird'" />
              <CheckCircleFilled v-else-if="record.type === 'checkin'" />
              <GiftFilled v-else />
            </div>

            <!-- Details -->
            <div class="overflow-hidden space-y-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">
                  {{ getTypeTitle(record) }}
                </span>
                <span
                  v-if="record.type === 'early_bird'"
                  class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30"
                >
                  Top {{ getEarlyBirdRank(record) }}
                </span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium truncate">
                {{ record.description || 'Thưởng tích lũy điểm danh' }}
              </div>
              <div class="text-[10px] text-slate-400 font-medium">
                {{ formatDate(record.created_at) }}
              </div>
            </div>
          </div>

          <!-- Right: Points Badge -->
          <div class="text-right shrink-0">
            <div class="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 leading-none">
              +{{ record.points }}
            </div>
            <div class="text-[10px] font-bold text-slate-400 mt-0.5">
              S-Point
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.total > (pagination.pageSize || 15)" class="flex justify-end pt-3">
          <a-pagination
            :current="pagination.current || 1"
            :total="pagination.total"
            :page-size="pagination.pageSize || 15"
            size="small"
            @change="handlePageChange"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center">
        <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE">
          <template #description>
            <span class="text-xs font-medium text-slate-400">
              Chưa có lịch sử nhận điểm S-Point
            </span>
          </template>
        </a-empty>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { Empty } from "ant-design-vue";
import {
  ThunderboltFilled,
  CheckCircleFilled,
  GiftFilled,
} from "@ant-design/icons-vue";

const props = defineProps<{
  historyList: any[];
  loading: boolean;
  pagination: any;
}>();

const emit = defineEmits<{
  (e: "page-change", pag: any): void;
}>();

const getIconBgClass = (type: string) => {
  if (type === "early_bird") {
    return "bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-300/40";
  }
  if (type === "checkin") {
    return "bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40";
  }
  return "bg-gradient-to-br from-orange-400/20 to-rose-500/20 text-orange-600 dark:text-orange-400 border border-orange-300/40";
};

const getTypeTitle = (record: any) => {
  if (record.type === "early_bird") {
    return "⚡ Thưởng Điểm Danh Sớm";
  }
  if (record.type === "checkin") {
    return "📅 Điểm Danh Hàng Ngày";
  }
  if (record.type === "referral_first_order") {
    return "🎁 Thưởng Giới Thiệu Đơn Đầu";
  }
  return "🎁 Thưởng S-Point";
};

const getEarlyBirdRank = (record: any) => {
  if (!record.description) return "";
  const match = record.description.match(/Hạng (\d)/);
  return match ? match[1] : "";
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
    second: "2-digit",
  });
};

const handlePageChange = (page: number) => {
  emit("page-change", { current: page });
};
</script>
