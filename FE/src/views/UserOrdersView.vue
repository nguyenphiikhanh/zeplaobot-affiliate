<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  CopyOutlined,
  SearchOutlined,
  ReloadOutlined,
  GiftOutlined,
  CalendarOutlined,
} from "@ant-design/icons-vue";
import {
  api,
  getSessionUser,
  type ApiResponse,
  type SessionUser,
} from "../services/api";
import viVN from "ant-design-vue/es/locale/vi_VN";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

const router = useRouter();
const user = ref<SessionUser | null>(null);

interface Order {
  id: number;
  orderId: string;
  orderStatus: string | null;
  orderTime: string | null;
  shopName: string | null;
  productName: string | null;
  purchaseValue: number | null;
  actualCommission: number | null;
  userCommission: number | null;
  userSharePercentage?: number | null;
  subId: string | null;
  imgCode?: string | null;
}

const getCurrentMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const rows = ref<Order[]>([]);
const loading = ref(false);
const searchQuery = ref("");
const selectedMonth = ref<string>(getCurrentMonthString());
const page = ref(1);
const total = ref(0);
const limit = 15;

const loadUser = async () => {
  try {
    user.value = await getSessionUser();
  } catch {
    // ignore
  }
};

const monthOptions = computed(() => {
  const options = [{ label: "Tất cả các tháng", value: "" }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    options.push({
      label: `Tháng ${m}/${y}`,
      value: `${y}-${String(m).padStart(2, "0")}`,
    });
  }
  return options;
});

const unreceivedCount = ref<number>(0);
const estimatedCommission = ref<number>(0);

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: page.value,
      limit,
    };
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }
    if (selectedMonth.value) {
      params.month = selectedMonth.value;
    }
    const res = await api.get<
      ApiResponse<{
        orders: Order[];
        total: number;
        summary?: { unreceivedCount: number; estimatedCommission: number };
      }>
    >("/api/user/orders", { params });
    rows.value = res.data.data?.orders || [];
    total.value = res.data.data?.total || 0;
    if (res.data.data?.summary) {
      unreceivedCount.value = res.data.data.summary.unreceivedCount || 0;
      estimatedCommission.value = res.data.data.summary.estimatedCommission || 0;
    }
  } catch (error: any) {
    message.error(
      error.response?.data?.message || "Không thể tải danh sách đơn hàng"
    );
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUser();
  fetchOrders();
});

watch(selectedMonth, (newVal) => {
  if (!newVal) {
    selectedMonth.value = getCurrentMonthString();
    return;
  }
  page.value = 1;
  fetchOrders();
});

const handleSearch = () => {
  page.value = 1;
  fetchOrders();
};

const formatMoney = (v: number | null) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(v || 0)) + "đ";
};

const formatDate = (dStr: string | null) => {
  if (!dStr) return "";
  const d = new Date(dStr);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const copyOrderId = (orderId: string) => {
  if (!orderId) return;
  navigator.clipboard.writeText(orderId);
  message.success(`Đã sao chép mã đơn: ${orderId}`);
};

const getStatusBadge = (status: string | null) => {
  if (status === "Completed" || status === "COMPLETED")
    return {
      label: "Hoàn thành",
      class: "bg-[#e6f7f3] text-[#00b087] border border-[#b2ebe0]/50",
    };
  if (status === "Cancelled" || status === "CANCELLED")
    return {
      label: "Đã hủy",
      class: "bg-rose-50 text-rose-600 border border-rose-200/50",
    };
  return {
    label: "Chờ duyệt",
    class: "bg-amber-50 text-amber-600 border border-amber-200/50",
  };
};

const getOrderCalc = (item: Order) => {
  const userComm = item.userCommission || 0;
  const shareRate = item.userSharePercentage || 90;

  let gross = item.actualCommission || 0;
  if (!gross && userComm > 0) {
    gross = Math.round(userComm / (shareRate / 100) / 0.89);
  }

  let afterTax =
    gross > 0
      ? Math.round(gross * 0.88999)
      : Math.round(userComm / (shareRate / 100));

  return {
    gross: formatMoney(gross),
    afterTax: formatMoney(afterTax),
    shareRate: `${shareRate}%`,
    userComm: formatMoney(userComm),
  };
};
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4 text-left">
    <!-- Top Stats Bar: 2 Summary Cards (ĐƠN CHƯA NHẬN & ƯỚC TÍNH NHẬN) -->
    <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
      <!-- Card 1: ĐƠN CHƯA NHẬN -->
      <div
        class="bg-white rounded-2xl p-3.5 sm:p-4.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
      >
        <div
          class="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider"
        >
          ĐƠN CHƯA NHẬN
        </div>
        <div v-if="loading" class="h-7 w-20 bg-slate-200 rounded-md animate-pulse mt-1"></div>
        <div v-else class="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          {{ unreceivedCount }} <span class="text-sm font-extrabold text-slate-500">đơn</span>
        </div>
      </div>

      <!-- Card 2: ƯỚC TÍNH NHẬN -->
      <div
        class="bg-white rounded-2xl p-3.5 sm:p-4.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between"
      >
        <div
          class="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider"
        >
          ƯỚC TÍNH NHẬN
        </div>
        <div v-if="loading" class="h-7 w-28 bg-slate-200 rounded-md animate-pulse mt-1"></div>
        <div v-else class="text-xl sm:text-2xl font-black text-[#00b087] mt-1 truncate">
          {{ formatMoney(estimatedCommission) }}
        </div>
      </div>
    </div>

    <!-- Month Selector Bar & Reload Button -->
    <div class="flex items-center gap-2">
      <!-- Orange Month DatePicker Component -->
      <div class="relative flex-1">
        <a-config-provider
          :locale="viVN"
          :theme="{
            token: {
              colorPrimary: '#ee4d2d',
              borderRadius: 12,
              colorBgContainer: '#fffbf9',
              colorBorder: '#ffdcd3',
            },
          }"
        >
          <a-date-picker
            v-model:value="selectedMonth"
            picker="month"
            placeholder="Chọn tháng xem đơn..."
            format="[Tháng] MM/YYYY"
            value-format="YYYY-MM"
            class="orange-month-picker w-full !h-10.5 !rounded-xl !bg-orange-50/60 !border-orange-200/80 !text-sm font-extrabold shadow-2xs hover:!border-[#ee4d2d] transition-all"
            :allow-clear="true"
          >
            <template #suffixIcon>
              <CalendarOutlined class="text-[#ee4d2d] text-base" />
            </template>
          </a-date-picker>
        </a-config-provider>
      </div>

      <!-- Reload Button -->
      <button
        type="button"
        @click="fetchOrders"
        :disabled="loading"
        class="h-10.5 px-4.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-sm font-bold text-[#ee4d2d] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all shrink-0"
      >
        <ReloadOutlined :class="{ 'animate-spin': loading }" />
        <span>Tải lại</span>
      </button>
    </div>

    <!-- Search Bar (Redesigned Modern Orange Theme) -->
    <div
      class="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 shadow-2xs relative flex items-center gap-2"
    >
      <div class="relative flex-1 flex items-center">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
          class="w-full h-10.5 pl-9 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#ee4d2d] focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all placeholder:text-slate-400"
        />
        <SearchOutlined
          class="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500 text-base pointer-events-none"
        />
        <button
          v-if="searchQuery"
          type="button"
          @click="searchQuery = ''; handleSearch()"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200/60 w-4.5 h-4.5 rounded-full flex items-center justify-center cursor-pointer border-0"
          title="Xóa tìm kiếm"
        >
          <CloseOutlined class="text-[10px]" />
        </button>
      </div>

      <button
        type="button"
        @click="handleSearch"
        class="h-10.5 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-orange-500 hover:from-[#d83d1e] hover:to-orange-600 active:scale-95 text-white text-xs sm:text-sm font-black transition-all cursor-pointer shadow-sm shadow-orange-500/20 flex items-center justify-center shrink-0 border-0"
      >
        <span>Tìm kiếm</span>
      </button>
    </div>

    <!-- Skeleton Loading Cards -->
    <div v-if="loading" class="space-y-3 sm:space-y-4">
      <div
        v-for="n in 4"
        :key="n"
        class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 animate-pulse"
      >
        <div class="flex items-start gap-3">
          <div class="w-16 h-16 rounded-xl bg-slate-100 shrink-0"></div>
          <div class="flex-1 space-y-2 pt-0.5">
            <div class="h-4 bg-slate-100 rounded-md w-3/4"></div>
            <div class="h-3 bg-slate-100 rounded-md w-1/3"></div>
            <div class="h-3 bg-slate-100 rounded-md w-1/2"></div>
          </div>
        </div>
        <div class="h-10 bg-slate-50 rounded-xl w-full"></div>
      </div>
    </div>

    <div v-else-if="rows.length" class="space-y-3 sm:space-y-4">
      <!-- Single Order Item Card -->
      <div
        v-for="item in rows"
        :key="item.id"
        class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden transition-all hover:shadow-xs"
      >
        <!-- Top Section: Image, Title, Badges, Shop & Price -->
        <div class="p-3.5 sm:p-4 flex items-start gap-3">
          <!-- Product Image -->
          <div
            class="w-15 h-15 sm:w-16 sm:h-16 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden p-1"
          >
            <img
              v-if="item.imgCode"
              :src="`https://down-tx-vn.img.susercontent.com/${item.imgCode}.webp`"
              :alt="item.productName || 'Shopee'"
              class="w-full h-full object-cover rounded-lg"
            />
            <img
              v-else
              src="/logo/shopee.png"
              alt="Shopee"
              class="w-full h-full object-contain p-0.5"
            />
          </div>

          <!-- Product Details -->
          <div class="min-w-0 flex-1 space-y-1">
            <!-- Product Title -->
            <h3
              class="text-base sm:text-lg font-black text-slate-950 line-clamp-2 leading-snug m-0 tracking-tight"
              style="font-weight: 900;"
            >
              {{ item.productName || "Sản phẩm Shopee" }}
            </h3>

            <!-- Badges Row: Shopee + Status -->
            <div class="flex items-center gap-1.5 pt-0.5 flex-wrap">
              <span
                class="px-2 py-0.5 rounded-md bg-[#ee4d2d] text-white font-extrabold text-xs leading-tight"
              >
                Shopee
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded-md text-xs font-bold leading-tight',
                  getStatusBadge(item.orderStatus).class,
                ]"
              >
                {{ getStatusBadge(item.orderStatus).label }}
              </span>
            </div>

            <!-- Shop name & Price -->
            <div class="text-xs sm:text-sm text-slate-500 font-bold pt-0.5 truncate">
              {{ item.shopName || "shopee" }} ·
              <span class="text-slate-800 font-extrabold">{{ formatMoney(item.purchaseValue) }}</span>
            </div>
          </div>
        </div>

        <!-- Middle Section: Order ID Chip + Date -->
        <div
          class="px-3.5 sm:px-4 pb-3 flex items-center justify-between gap-2 text-xs"
        >
          <!-- Order ID Pill + Copy button -->
          <button
            type="button"
            @click="copyOrderId(item.orderId)"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-mono font-bold text-xs transition-colors cursor-pointer border-0"
            title="Bấm để sao chép mã đơn"
          >
            <span>{{ item.orderId }}</span>
            <CopyOutlined class="text-xs text-slate-400" />
          </button>

          <!-- Order Date -->
          <span class="text-slate-400 text-xs font-medium">
            {{ formatDate(item.orderTime) }}
          </span>
        </div>

        <!-- Financial Metric Grid (2 cols on mobile, 4 cols on sm+) -->
        <div
          class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 bg-[#f8fbfb] border-t border-slate-100 sm:divide-x sm:divide-slate-200/80 text-center p-2 sm:py-2.5 sm:px-1"
        >
          <!-- Col 1: HH ĐƠN -->
          <div
            class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
          >
            <div
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              HH ĐƠN
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate w-full">
              {{ getOrderCalc(item).gross }}
            </div>
          </div>

          <!-- Col 2: SAU THUẾ -->
          <div
            class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
          >
            <div
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              SAU THUẾ
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate w-full">
              {{ getOrderCalc(item).afterTax }}
            </div>
          </div>

          <!-- Col 3: % NHẬN -->
          <div
            class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
          >
            <div
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              % NHẬN
            </div>
            <div class="text-xs sm:text-sm font-extrabold text-slate-900 truncate w-full">
              {{ getOrderCalc(item).shareRate }}
            </div>
          </div>

          <!-- Col 4: NHẬN VỀ -->
          <div
            class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
          >
            <div
              class="text-xs font-bold text-slate-400 uppercase tracking-wider"
            >
              NHẬN VỀ
            </div>
            <div class="text-xs sm:text-sm font-black text-[#00b087] truncate w-full">
              {{ getOrderCalc(item).userComm }}
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="total > limit" class="pt-4 flex justify-center">
        <a-pagination
          :current="page"
          :total="total"
          :page-size="limit"
          size="small"
          @change="
            (p: number) => {
              page = p;
              fetchOrders();
            }
          "
        />
      </div>
    </div>

    <!-- Empty State Option C (Mobile Responsive + Prominent CTA) -->
    <div
      v-else
      class="py-2 sm:py-4 flex flex-col items-center justify-center w-full"
    >
      <div
        class="w-full bg-gradient-to-br from-orange-50/80 via-amber-50/40 to-orange-100/30 border border-orange-200/70 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-xs relative overflow-hidden"
      >
        <div
          class="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-[#ee4d2d] to-amber-500 text-white flex items-center justify-center mx-auto text-3xl sm:text-4xl shadow-md shadow-orange-500/20 transform -rotate-3 transition-transform hover:rotate-0"
        >
          🎁
        </div>

        <div class="space-y-2">
          <div class="inline-block px-3.5 py-1 rounded-full bg-orange-100/80 text-[#ee4d2d] text-xs sm:text-sm font-black tracking-wide uppercase">
            Chưa có đơn hàng
          </div>
          <h3
            class="text-base sm:text-xl font-black text-slate-900 tracking-tight m-0"
          >
            Hiện tại bạn chưa có đơn hàng nào!
          </h3>
          <p
            class="text-xs sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto font-semibold m-0"
          >
            Dán link Shopee vào trang
            <router-link
              to="/generate-link"
              class="font-black text-[#ee4d2d] hover:underline decoration-orange-400"
              >Tạo link</router-link
            >
            để mua sắm và nhận hoa hồng hoàn tiền tự động nhé!
          </p>
        </div>

        <div class="pt-2">
          <button
            type="button"
            @click="router.push('/generate-link')"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#ee4d2d] to-orange-500 hover:from-[#d83d1e] hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all cursor-pointer border-0 group"
          >
            <span>🔥 Tạo link hoàn tiền ngay</span>
            <span
              class="group-hover:translate-x-1 transition-transform font-bold"
              >➔</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.orange-month-picker) {
  border-color: #ffdcd3 !important;
  background: #fff8f6 !important;
}

:deep(.orange-month-picker .ant-picker-input > input) {
  color: #ee4d2d !important;
  font-weight: 800 !important;
}

:deep(.ant-picker-dropdown) {
  border-radius: 16px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 25px -5px rgba(238, 77, 45, 0.15),
    0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

:deep(.ant-picker-cell-selected .ant-picker-cell-inner),
:deep(.ant-picker-month-panel-selected-cell .ant-picker-cell-inner) {
  background-color: #ee4d2d !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border-radius: 10px !important;
  box-shadow: 0 4px 10px rgba(238, 77, 45, 0.3) !important;
}

:deep(.ant-picker-cell-hover .ant-picker-cell-inner) {
  background-color: #fff0ec !important;
  color: #ee4d2d !important;
  border-radius: 10px !important;
}

:deep(.ant-picker-header-view button:hover),
:deep(.ant-picker-header button:hover) {
  color: #ee4d2d !important;
}
</style>
