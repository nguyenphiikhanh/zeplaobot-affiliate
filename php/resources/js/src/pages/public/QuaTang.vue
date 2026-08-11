<template>
  <div class="w-full max-w-6xl mx-auto space-y-6 pb-12">
    <!-- Hero Banner & Checkin Box (Lazy Loaded) -->
    <CheckinHero
      :spoint-balance="spointBalance"
      :spoint-streak="spointStreak"
      :checked-in-today="checkedInToday"
      :checkin-loading="checkinLoading"
      @checkin="handleCheckin"
    />

    <!-- Early Bird Notification Alert (Lazy Loaded) -->
    <EarlyBirdAlert
      :early-birds-today="earlyBirdsToday"
      :first-checkin-points="firstCheckinPoints"
    />

    <!-- Top Section Grid: Leaderboard & Exchange Card Widget -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Top 10 Leaderboard (Left Side 5 Cols on PC, Top on Mobile) -->
      <div class="lg:col-span-5">
        <SpointLeaderboard
          :leaderboard="leaderboard"
          :loading="leaderboardLoading"
        />
      </div>

      <!-- S-Point Exchange Form Widget (Right Side 7 Cols on PC, Under Leaderboard on Mobile) -->
      <div class="lg:col-span-7">
        <SpointExchangeCard
          :spoint-balance="spointBalance"
          :exchange-options="exchangeOptions"
          :loading="exchangeLoading"
          @exchange="executeExchange"
        />
      </div>
    </div>

    <!-- Tabs Section: S-Point History & Exchange History (Full Width) -->
    <a-card
      :bordered="false"
      class="rounded-3xl shadow-sm border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900"
    >
      <a-tabs v-model:activeKey="activeTab" class="custom-spoint-tabs">
        <!-- Tab 1: Lịch Sử Nhận Point (Lazy Loaded) -->
        <a-tab-pane key="history" tab="📜 Lịch Sử S-Point">
          <SpointHistoryTable
            :history-list="historyList"
            :loading="historyLoading"
            :pagination="historyPagination"
            @page-change="handleHistoryTableChange"
          />
        </a-tab-pane>

        <!-- Tab 2: Lịch Sử Quy Đổi Tiền Mặt (Lazy Loaded, Card-based list format) -->
        <a-tab-pane key="exchanges" tab="💸 Lịch Sử Quy Đổi">
          <SpointExchangeHistoryList
            :exchanges-list="exchangesList"
            :loading="exchangesLoading"
            :pagination="exchangesPagination"
            @page-change="handleExchangesTableChange"
          />
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Early Bird Congratulatory Modal -->
    <EarlyBirdModal
      v-model:open="showEarlyBirdModal"
      :rank="earlyBirdModalData.rank"
      :base-points="earlyBirdModalData.basePoints"
      :early-bird-points="earlyBirdModalData.earlyBirdPoints"
      :total-points="earlyBirdModalData.totalPoints"
      :streak="earlyBirdModalData.streak"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from "vue";
import { message } from "ant-design-vue";
import axios from "@/api/axios";

// Async / Lazy-loaded Components for high performance & code splitting
const CheckinHero = defineAsyncComponent(
  () => import("@/components/quatang/CheckinHero.vue")
);
const EarlyBirdAlert = defineAsyncComponent(
  () => import("@/components/quatang/EarlyBirdAlert.vue")
);
const SpointLeaderboard = defineAsyncComponent(
  () => import("@/components/quatang/SpointLeaderboard.vue")
);
const SpointExchangeCard = defineAsyncComponent(
  () => import("@/components/quatang/SpointExchangeCard.vue")
);
const SpointHistoryTable = defineAsyncComponent(
  () => import("@/components/quatang/SpointHistoryTable.vue")
);
const SpointExchangeHistoryList = defineAsyncComponent(
  () => import("@/components/quatang/SpointExchangeHistoryList.vue")
);
const EarlyBirdModal = defineAsyncComponent(
  () => import("@/components/quatang/EarlyBirdModal.vue")
);

// Reactive State
const activeTab = ref("history");
const spointBalance = ref(0);
const spointStreak = ref(0);
const checkedInToday = ref(false);
const earlyBirdsToday = ref<any[]>([]);
const firstCheckinPoints = ref(2);
const exchangeOptions = ref<any[]>([]);
const checkinLoading = ref(false);

const showEarlyBirdModal = ref(false);
const earlyBirdModalData = ref({
  rank: 1,
  basePoints: 1,
  earlyBirdPoints: 2,
  totalPoints: 3,
  streak: 1,
});

const leaderboard = ref<any[]>([]);
const leaderboardLoading = ref(false);

const historyList = ref<any[]>([]);
const historyLoading = ref(false);
const historyPagination = ref({ current: 1, pageSize: 15, total: 0 });

const exchangeLoading = ref(false);
const exchangesList = ref<any[]>([]);
const exchangesLoading = ref(false);
const exchangesPagination = ref({ current: 1, pageSize: 15, total: 0 });

// API Fetching Methods
const fetchStatus = async () => {
  try {
    const res = await axios.get("/spoint/status");
    if (res.data?.success || res.data?.status === "success") {
      spointBalance.value = res.data.data.spoint_balance;
      spointStreak.value = res.data.data.spoint_streak;
      checkedInToday.value = res.data.data.checked_in_today;
      earlyBirdsToday.value = res.data.data.early_birds_today || [];
      firstCheckinPoints.value = res.data.data.first_checkin_points ?? 2;
      exchangeOptions.value = res.data.data.exchange_options || [];
    }
  } catch (err) {
    console.error("Failed to fetch S-Point status:", err);
  }
};

const fetchLeaderboard = async () => {
  leaderboardLoading.value = true;
  try {
    const res = await axios.get("/spoint/leaderboard");
    if (res.data?.success || res.data?.status === "success") {
      leaderboard.value = res.data.data;
    }
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
  } finally {
    leaderboardLoading.value = false;
  }
};

const fetchHistory = async (page = 1) => {
  historyLoading.value = true;
  try {
    const res = await axios.get(`/spoint/history?page=${page}`);
    if (res.data?.success || res.data?.status === "success") {
      historyList.value = res.data.data.data || [];
      historyPagination.value.current = res.data.data.current_page;
      historyPagination.value.pageSize = res.data.data.per_page;
      historyPagination.value.total = res.data.data.total;
    }
  } catch (err) {
    console.error("Failed to fetch history:", err);
  } finally {
    historyLoading.value = false;
  }
};

const fetchExchanges = async (page = 1) => {
  exchangesLoading.value = true;
  try {
    const res = await axios.get(`/spoint/exchanges?page=${page}`);
    if (res.data?.success || res.data?.status === "success") {
      exchangesList.value = res.data.data.data || [];
      exchangesPagination.value.current = res.data.data.current_page;
      exchangesPagination.value.pageSize = res.data.data.per_page;
      exchangesPagination.value.total = res.data.data.total;
    }
  } catch (err) {
    console.error("Failed to fetch exchanges:", err);
  } finally {
    exchangesLoading.value = false;
  }
};

// Handlers
const handleCheckin = async (turnstileToken?: string) => {
  if (checkedInToday.value) return;
  checkinLoading.value = true;
  try {
    const res = await axios.post("/spoint/checkin", {
      cf_turnstile_response: turnstileToken || "",
    });
    if (res.data?.success || res.data?.status === "success") {
      const checkinData = res.data.data?.checkin;
      if (checkinData && checkinData.early_bird_rank) {
        earlyBirdModalData.value = {
          rank: checkinData.early_bird_rank,
          basePoints: checkinData.base_points,
          earlyBirdPoints: checkinData.early_bird_points,
          totalPoints: checkinData.total_points,
          streak: checkinData.streak_count,
        };
        showEarlyBirdModal.value = true;
      } else {
        message.success(res.data.message || "Điểm danh thành công!");
      }
      await fetchStatus();
      await fetchLeaderboard();
      await fetchHistory(1);
    }
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Có lỗi xảy ra khi điểm danh.";
    message.error(errorMsg);
  } finally {
    checkinLoading.value = false;
  }
};

const executeExchange = async (points: number) => {
  exchangeLoading.value = true;
  try {
    const res = await axios.post("/spoint/exchange", { points });
    if (res.data?.success || res.data?.status === "success") {
      message.success(res.data.message || "Quy đổi thành công!");
      await fetchStatus();
      await fetchLeaderboard();
      await fetchExchanges(1);
    }
  } catch (err: any) {
    const errorMsg =
      err.response?.data?.message || "Có lỗi xảy ra khi quy đổi S-Point.";
    message.error(errorMsg);
  } finally {
    exchangeLoading.value = false;
  }
};

const handleHistoryTableChange = (pag: any) => {
  fetchHistory(pag.current);
};

const handleExchangesTableChange = (pag: any) => {
  fetchExchanges(pag.current);
};

onMounted(() => {
  fetchStatus();
  fetchLeaderboard();
  fetchHistory(1);
  fetchExchanges(1);
});
</script>

<style scoped>
:deep(.custom-spoint-tabs .ant-tabs-nav) {
  margin-bottom: 16px;
}

:deep(.custom-spoint-tabs .ant-tabs-tab-btn) {
  font-weight: 800;
  font-size: 14px;
}

:deep(.custom-spoint-tabs .ant-tabs-ink-bar) {
  background: #ee4d2d !important;
  height: 3px;
  border-radius: 3px;
}

:deep(.custom-spoint-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #ee4d2d !important;
}
</style>
