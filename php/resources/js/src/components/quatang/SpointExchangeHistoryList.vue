<template>
  <div class="py-2">
    <a-spin :spinning="loading">
      <!-- List Items (Card Format - Mobile Friendly) -->
      <div v-if="exchangesList && exchangesList.length > 0" class="space-y-2.5">
        <div
          v-for="record in exchangesList"
          :key="record.id"
          class="p-3.5 sm:p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 shadow-2xs"
        >
          <!-- Left: Icon & Exchange Info -->
          <div class="flex items-center gap-3 overflow-hidden">
            <!-- Icon Badge -->
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 font-black shadow-xs bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300/40"
            >
              <DollarCircleFilled />
            </div>

            <!-- Details -->
            <div class="overflow-hidden space-y-0.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span
                  class="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate"
                >
                  Đổi S-Point
                </span>
                <span
                  class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                >
                  -{{ record.points }} Point
                </span>
              </div>
              <div class="text-[11px] text-slate-400 font-medium truncate">
                Cộng vào số dư ví
              </div>
              <div class="text-[10px] text-slate-400 font-medium">
                {{ formatDate(record.created_at) }}
              </div>
            </div>
          </div>

          <!-- Right: Amount & Status Tag -->
          <div class="text-right shrink-0 space-y-1">
            <div
              class="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 leading-none"
            >
              +{{ formatVnd(record.amount_vnd) }} VNĐ
            </div>
            <div>
              <a-tag
                color="success"
                class="font-extrabold rounded-md text-[10px] m-0 border-0 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              >
                Thành công
              </a-tag>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination && pagination.total > (pagination.pageSize || 15)"
          class="flex justify-end pt-3"
        >
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
              Bạn chưa có lịch sử quy đổi S-Point
            </span>
          </template>
        </a-empty>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { Empty } from "ant-design-vue";
import { DollarCircleFilled } from "@ant-design/icons-vue";

const props = defineProps<{
  exchangesList: any[];
  loading: boolean;
  pagination: any;
}>();

const emit = defineEmits<{
  (e: "page-change", pag: any): void;
}>();

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
    second: "2-digit",
  });
};

const handlePageChange = (page: number) => {
  emit("page-change", { current: page });
};
</script>
