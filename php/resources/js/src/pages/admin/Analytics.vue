<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header & Countdown -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Thống kê chi tiết
        </h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Dữ liệu trực quan về đơn hàng, doanh thu và hiệu suất người dùng.
        </p>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
          <ClockCircleOutlined class="text-emerald-500" />
          <small>
            Báo cáo sẽ được làm mới sau
            <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-800/50">
              {{ timeUntilNextUpdate }}
            </span>
          </small>
        </p>
      </div>
    </div>

    <!-- Section 1: Tài chính -->
    <div>
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
          <DollarOutlined />
        </span>
        Doanh thu & Dòng tiền
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-transparent dark:from-emerald-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="commissionAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Hoa hồng sàn
              </div>
              <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {{ formatMoney(commissionAnalytic.total_commission) }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shadow-emerald-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <BankOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="commissionAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Hoa hồng người dùng
              </div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ formatMoney(commissionAnalytic.total_user_commission) }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-blue-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <UserOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-transparent dark:from-rose-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="commissionAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Phí dịch vụ + Thuế
              </div>
              <div class="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {{ formatMoney(commissionAnalytic.total_fee) }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white shadow-rose-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <PercentageOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-transparent dark:from-amber-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="commissionAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Lợi nhuận (Ước tính)
              </div>
              <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {{ formatMoney(commissionAnalytic.total_profit) }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-amber-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <MoneyCollectOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- Section 2: Người dùng -->
    <div>
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600">
          <TeamOutlined />
        </span>
        Thống kê Người dùng
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-transparent dark:from-purple-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="userAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Tổng người dùng
              </div>
              <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {{ userAnalytic.total_users }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white shadow-purple-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <TeamOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-transparent dark:from-indigo-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="userAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Người dùng mới
              </div>
              <div class="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {{ userAnalytic.new_users }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white shadow-indigo-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <UserAddOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-transparent dark:from-orange-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="userAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Đã có đơn hàng
              </div>
              <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {{ userAnalytic.users_with_orders }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-orange-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <ShoppingCartOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>

        <a-card :bordered="false" class="admin-stat-card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
          <div class="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-transparent dark:from-pink-900/20 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <a-skeleton active :paragraph="{ rows: 1 }" v-if="userAnalyticPending" />
          <div v-else class="flex justify-between items-center relative z-10">
            <div>
              <div class="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                Đã tạo link
              </div>
              <div class="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {{ userAnalytic.users_generate_link }}
              </div>
            </div>
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white shadow-pink-500/30 shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              <LinkOutlined class="text-2xl" />
            </div>
          </div>
        </a-card>
      </div>
    </div>

    <!-- Section 3: Biểu đồ -->
    <div>
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
        <span class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
          <LineChartOutlined />
        </span>
        Biểu đồ Trực quan
      </h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Orders Chart -->
        <a-card :bordered="false" class="admin-card border-t-4 border-emerald-500 hover:shadow-xl transition-shadow duration-300">
          <template #title>
            <span class="font-bold text-emerald-700 dark:text-emerald-400">
              Đơn hàng ({{ orderAnalytic.total_orders }})
            </span>
          </template>
          <div ref="ordersChartRef" class="w-full h-[300px]"></div>
        </a-card>

        <!-- Withdrawals Chart -->
        <a-card :bordered="false" class="admin-card border-t-4 border-amber-500 hover:shadow-xl transition-shadow duration-300">
          <template #title>
            <span class="font-bold text-amber-700 dark:text-amber-400">
              Dòng tiền từ người dùng
            </span>
          </template>
          <div ref="withdrawalsChartRef" class="w-full h-[300px]"></div>
        </a-card>

        <!-- Users & Links Chart -->
        <a-card :bordered="false" class="admin-card lg:col-span-2 border-t-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
          <template #title>
            <span class="font-bold text-blue-700 dark:text-blue-400">
              Hiệu suất tiếp thị
            </span>
          </template>
          <div ref="usersLinksChartRef" class="w-full h-[300px]"></div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, markRaw } from "vue";
import axios from "@/api/axios";
import * as echarts from "echarts/core";
import { PieChart, BarChart } from "echarts/charts";
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  PieChart,
  BarChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
]);
import {
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  LinkOutlined,
  UserAddOutlined,
  BankOutlined,
  UserOutlined,
  PercentageOutlined,
  MoneyCollectOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons-vue";

const timeUntilNextUpdate = ref("00:00:00");
let countdownInterval = null;

const updateCountdown = () => {
  const now = new Date();
  const currentHour = now.getHours();
  let nextHour = 24;

  if (currentHour < 6) nextHour = 6;
  else if (currentHour < 12) nextHour = 12;
  else if (currentHour < 18) nextHour = 18;

  const nextUpdate = new Date();
  nextUpdate.setHours(nextHour, 0, 0, 0);

  const diffMs = nextUpdate.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  timeUntilNextUpdate.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Analytics Data State
const commissionAnalyticData = ref(null);
const commissionAnalyticPending = ref(true);

const orderAnalyticData = ref(null);
const walletAnalyticData = ref(null);
const marketingAnalyticData = ref(null);

const userAnalyticData = ref(null);
const userAnalyticPending = ref(true);

const commissionAnalytic = computed(() => commissionAnalyticData.value || {
  total_commission: 0,
  total_user_commission: 0,
  total_fee: 0,
  total_profit: 0,
});

const orderAnalytic = computed(() => orderAnalyticData.value || {
  total_orders: 0,
  completed_orders: 0,
  pending_orders: 0,
  cancelled_orders: 0,
});

const walletAnalytic = computed(() => walletAnalyticData.value || {
  available_balance: 0,
  pending_balance: 0,
  rejected_balance: 0,
  total_paid: 0,
});

const marketingAnalytic = computed(() => marketingAnalyticData.value || {
  total_links: 0,
  shopee_links: 0,
  lazada_links: 0,
  tiktok_links: 0,
  total_orders: 0,
  shopee_orders: 0,
  tiktok_orders: 0,
  lazada_orders: 0,
});

const userAnalytic = computed(() => userAnalyticData.value || {
  total_users: 0,
  new_users: 0,
  users_with_orders: 0,
  users_generate_link: 0,
});

// Chart DOM references
const ordersChartRef = ref(null);
const withdrawalsChartRef = ref(null);
const usersLinksChartRef = ref(null);

// Echarts instances
let ordersChart = null;
let withdrawalsChart = null;
let usersLinksChart = null;

const formatMoney = (val) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(val || 0);
};

const fetchAnalyticsData = async () => {
  try {
    commissionAnalyticPending.value = true;
    userAnalyticPending.value = true;

    const [commRes, orderRes, walletRes, mktRes, userRes] = await Promise.allSettled([
      axios.get("/admin/analytics", { params: { key: "commission-analytic" } }),
      axios.get("/admin/analytics", { params: { key: "order-analytic" } }),
      axios.get("/admin/analytics", { params: { key: "wallet-analytic" } }),
      axios.get("/admin/analytics", { params: { key: "affiliate-analytic" } }),
      axios.get("/admin/analytics", { params: { key: "user-analytic" } }),
    ]);

    if (commRes.status === "fulfilled") commissionAnalyticData.value = commRes.value.data.data;
    if (orderRes.status === "fulfilled") orderAnalyticData.value = orderRes.value.data.data;
    if (walletRes.status === "fulfilled") walletAnalyticData.value = walletRes.value.data.data;
    if (mktRes.status === "fulfilled") marketingAnalyticData.value = mktRes.value.data.data;
    if (userRes.status === "fulfilled") userAnalyticData.value = userRes.value.data.data;
  } catch (err) {
    console.error("Failed to fetch analytics data", err);
  } finally {
    commissionAnalyticPending.value = false;
    userAnalyticPending.value = false;
    renderCharts();
  }
};

const renderCharts = () => {
  const textColor = "#475569";
  const tooltipBg = "#ffffff";

  // 1. Orders Chart (Pie)
  if (ordersChartRef.value) {
    if (!ordersChart) ordersChart = markRaw(echarts.init(ordersChartRef.value));
    ordersChart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: tooltipBg,
        textStyle: { color: textColor },
      },
      legend: { bottom: "0", textStyle: { color: textColor } },
      series: [
        {
          name: "Đơn hàng",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: { show: false, position: "center" },
          emphasis: { label: { show: true, fontSize: 20, fontWeight: "bold" } },
          labelLine: { show: false },
          data: [
            {
              value: Number(orderAnalytic.value.completed_orders) || 0,
              name: "Hoàn thành",
              itemStyle: { color: "#10b981" },
            },
            {
              value: Number(orderAnalytic.value.pending_orders) || 0,
              name: "Chờ duyệt",
              itemStyle: { color: "#f59e0b" },
            },
            {
              value: Number(orderAnalytic.value.cancelled_orders) || 0,
              name: "Đã huỷ",
              itemStyle: { color: "#ef4444" },
            },
          ],
        },
      ],
    });
  }

  // 2. Withdrawals Chart (Doughnut)
  if (withdrawalsChartRef.value) {
    if (!withdrawalsChart) withdrawalsChart = markRaw(echarts.init(withdrawalsChartRef.value));
    withdrawalsChart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: tooltipBg,
        textStyle: { color: textColor },
      },
      legend: { bottom: "0", textStyle: { color: textColor } },
      series: [
        {
          name: "Rút tiền",
          type: "pie",
          radius: "70%",
          data: [
            {
              value: Number(walletAnalytic.value.total_paid) || 0,
              name: "Đã rút",
              itemStyle: { color: "#10b981" },
            },
            {
              value: Number(walletAnalytic.value.available_balance) || 0,
              name: "Chưa rút",
              itemStyle: { color: "#64748b" },
            },
            {
              value: Number(walletAnalytic.value.pending_balance) || 0,
              name: "Chờ duyệt",
              itemStyle: { color: "#f59e0b" },
            },
            {
              value: Number(walletAnalytic.value.rejected_balance) || 0,
              name: "Đã huỷ",
              itemStyle: { color: "#ef4444" },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    });
  }

  // 3. Marketing Performance (Horizontal Bar Chart)
  if (usersLinksChartRef.value) {
    if (!usersLinksChart) usersLinksChart = markRaw(echarts.init(usersLinksChartRef.value));
    usersLinksChart.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: tooltipBg,
        textStyle: { color: textColor },
      },
      legend: { textStyle: { color: textColor } },
      grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
      xAxis: { type: "value", axisLabel: { color: textColor } },
      yAxis: {
        type: "category",
        data: ["TikTok", "Lazada", "Shopee", "Tổng"],
        axisLabel: { color: textColor },
      },
      series: [
        {
          name: "Link đã tạo",
          type: "bar",
          data: [
            Number(marketingAnalytic.value.tiktok_links) || 0,
            Number(marketingAnalytic.value.lazada_links) || 0,
            Number(marketingAnalytic.value.shopee_links) || 0,
            Number(marketingAnalytic.value.total_links) || 0,
          ],
          itemStyle: { color: "#94a3b8", borderRadius: [0, 4, 4, 0] },
        },
        {
          name: "Phát sinh đơn",
          type: "bar",
          data: [
            Number(marketingAnalytic.value.tiktok_orders) || 0,
            Number(marketingAnalytic.value.lazada_orders) || 0,
            Number(marketingAnalytic.value.shopee_orders) || 0,
            Number(marketingAnalytic.value.total_orders) || 0,
          ],
          itemStyle: { color: "#3b82f6", borderRadius: [0, 4, 4, 0] },
        },
      ],
    });
  }
};

const handleResize = () => {
  ordersChart?.resize();
  withdrawalsChart?.resize();
  usersLinksChart?.resize();
};

onMounted(() => {
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
  fetchAnalyticsData();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  if (countdownInterval) clearInterval(countdownInterval);
  window.removeEventListener("resize", handleResize);
  ordersChart?.dispose();
  withdrawalsChart?.dispose();
  usersLinksChart?.dispose();
});
</script>

<style scoped>
.admin-stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.admin-card {
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
</style>
