<template>
  <div class="w-full space-y-4 sm:space-y-6">
    <!-- Page Title & Header -->
    <div
      class="mt-2 sm:mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4"
    >
      <div>
        <h1
          class="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight"
        >
          Quản Lý <span class="text-[#ee4d2d]">Đơn Hàng</span>
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium">
          Xem thông tin chi tiết và tiến trình hoàn tiền của toàn bộ đơn hàng của bạn.
        </p>
      </div>
    </div>

    <!-- Order Process Info Component -->
    <OrderProcessInfo />

    <!-- MAIN BODY: Filters & Table -->
    <a-card
      :bordered="false"
      class="rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-900/[0.02] bg-white dark:bg-slate-900/60 mt-4 sm:mt-8"
    >
      <!-- Tabs Filter -->
      <a-tabs v-model:activeKey="activeTab" class="font-bold">
        <a-tab-pane key="pending">
          <template #tab>
            <span><ClockCircleOutlined /> Chờ duyệt</span>
          </template>
        </a-tab-pane>
        <a-tab-pane key="success">
          <template #tab>
            <span><CheckCircleOutlined /> Thành công</span>
          </template>
        </a-tab-pane>
        <a-tab-pane key="cancelled">
          <template #tab>
            <span><CloseCircleOutlined /> Đã hủy</span>
          </template>
        </a-tab-pane>
      </a-tabs>

      <!-- Info Box for Pending Tab -->
      <a-alert
        v-if="activeTab === 'pending'"
        type="warning"
        show-icon
        class="mb-6 rounded-xl"
        message="Chờ hoàn: đơn đã ghi nhận hoàn tiền, đang đợi sàn xác nhận hết thời gian hủy, đổi trả. Với Sộp-pe, hãy bấm Đã nhận hàng trong app để được hoàn sớm nhất."
      />

      <!-- Info Box for Cancelled Tab -->
      <a-alert
        v-if="activeTab === 'cancelled'"
        type="error"
        show-icon
        class="mb-6 rounded-xl"
      >
        <template #message>
          <div class="text-[13px] leading-relaxed font-semibold">
            <span class="font-black">Đã hủy:</span> đơn có thể do bạn hủy, hoặc
            cashback bị hủy từ sàn. Saffi là trung gian nên không được cung cấp
            lý do cụ thể, nhưng luôn sẵn sàng gửi thông tin đối soát từ sàn cho
            bạn để đảm bảo hệ thống minh bạch. Vui lòng liên hệ
            <router-link
              :to="{ name: 'ho-tro' }"
              class="text-rose-500 hover:underline font-black transition-all"
              >Hỗ trợ</router-link
            >
            để được cung cấp thêm thông tin.
          </div>
        </template>
      </a-alert>

      <!-- Data List -->
      <a-spin :spinning="isLoading">
        <div v-if="filteredOrders.length > 0" class="flex flex-col gap-3 md:gap-0">
          <div
            v-for="record in filteredOrders"
            :key="record.code"
            @click="openOrderDetails(record)"
            class="flex flex-col md:flex-row md:items-center justify-between p-4 border md:border-0 md:border-b border-slate-100 dark:border-slate-800/60 odd:bg-orange-50/60 even:bg-white dark:odd:bg-orange-900/20 dark:even:bg-slate-900 md:odd:bg-transparent md:even:bg-transparent md:dark:odd:bg-transparent md:dark:even:bg-transparent rounded-2xl md:rounded-none hover:bg-orange-100/50 md:hover:bg-slate-50 dark:hover:bg-orange-900/30 md:dark:hover:bg-slate-800/50 cursor-pointer transition-all duration-200 gap-3 md:gap-0"
          >
            <!-- Phần trên (Mobile) / Cột trái (Desktop): Thông tin SP -->
            <div class="flex items-center gap-3.5 flex-1 min-w-0 pr-0 md:pr-4">
              <div
                class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0"
              >
                <img
                  :src="getBrandLogo(record.type)"
                  class="w-6 h-6 object-contain shrink-0"
                  alt="Logo"
                />
              </div>
              <div class="flex flex-col flex-1 min-w-0">
                <span
                  class="font-bold text-[13px] text-slate-700 dark:text-slate-200 truncate"
                  :title="record.itemName || record.storeName"
                >
                  {{
                    record.itemName || record.storeName || "Sản phẩm từ Shopee"
                  }}
                </span>
                <div
                  class="flex items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium"
                >
                  <span class="text-slate-400">#{{ record.code }}</span>
                  <span
                    class="hidden md:block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"
                  ></span>
                  <span class="hidden md:inline">{{ record.date }}</span>
                </div>
              </div>
            </div>

            <!-- Đường phân cách ngang chỉ hiện trên Mobile -->
            <div class="md:hidden w-full border-t border-dashed border-slate-200 dark:border-slate-700/50 my-1"></div>

            <!-- Phần dưới (Mobile) / Cột phải (Desktop): Hoa hồng & Trạng thái -->
            <div class="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 gap-1.5 md:gap-1.5">
              <span
                class="font-bold uppercase tracking-wider text-[9px] px-2.5 py-0.5 rounded-full whitespace-nowrap inline-block md:order-last"
                :class="
                  record.status === 'Thành công' ||
                  record.status === 'Completed'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : record.status === 'Chờ duyệt'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                "
              >
                {{
                  record.status === "Completed" ||
                  record.status === "Thành công"
                    ? "HOÀN THÀNH"
                    : record.status
                }}
              </span>
              <div
                class="flex items-center gap-1 font-black text-emerald-500 text-[13px]"
              >
                +{{ formatMoney(record.cashbackAmount) }}
                <span
                  class="w-3.5 h-3.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-[8px] font-bold"
                  >đ</span
                >
              </div>
            </div>
          </div>

          <!-- Phân trang -->
          <div class="py-6 flex justify-center pt-8">
            <a-pagination
              v-model:current="currentPage"
              :total="totalOrders"
              :pageSize="pageSize"
              :showSizeChanger="false"
              @change="fetchOrders"
            />
          </div>
        </div>

        <!-- Trạng thái rỗng -->
        <div v-else class="py-12 flex flex-col items-center">
          <div
            class="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4"
          >
            <FrownOutlined class="text-[32px]" />
          </div>
          <h3 class="text-xs font-bold text-slate-700 dark:text-slate-300">
            Không tìm thấy đơn hàng nào
          </h3>
          <p
            class="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[280px]"
          >
            Chưa có đơn hàng nào trong trạng thái này.
          </p>
          <router-link
            v-if="activeTab === 'pending' || activeTab === 'success'"
            :to="{ name: 'hoan-tien' }"
          >
            <a-button type="primary" size="small" class="mt-4 font-bold"
              >MUA SẮM HOÀN TIỀN NGAY</a-button
            >
          </router-link>
        </div>
      </a-spin>
    </a-card>

    <!-- User Order Details Drawer -->
    <a-drawer
      :open="isModalOpen"
      @close="closeOrderDetails"
      placement="right"
      :closable="false"
      :bodyStyle="{ padding: 0 }"
      :width="drawerWidth"
    >
      <div
        v-if="selectedOrder"
        class="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-950"
      >
        <div
          class="flex items-start justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0"
        >
          <div>
            <span
              class="font-black uppercase tracking-wider mb-2 text-[9px] px-2.5 py-1 rounded-full inline-block"
              :class="
                selectedOrder.status === 'Thành công' ||
                selectedOrder.status === 'Completed'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : selectedOrder.status === 'Chờ duyệt'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              "
            >
              {{
                selectedOrder.status === "Completed" ||
                selectedOrder.status === "Thành công"
                  ? "HOÀN THÀNH"
                  : selectedOrder.status
              }}
            </span>
            <h3
              class="text-base font-black text-slate-800 dark:text-slate-100 m-0"
            >
              Chi tiết đơn hàng
              <span class="text-orange-500 dark:text-orange-400 select-all"
                >#{{ selectedOrder.code }}</span
              >
            </h3>
            <p class="text-xs text-slate-500 mt-1 font-medium m-0">
              Cửa hàng: {{ selectedOrder.storeName || "Shopee Store" }}
            </p>
          </div>
          <a-button type="text" @click="closeOrderDetails">
            <template #icon><CloseOutlined /></template>
          </a-button>
        </div>

        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <!-- 1. Rank Discount rate Info -->
          <div
            v-if="selectedOrder.rawItem?.order?.userRank"
            class="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
          >
            <div class="flex flex-col">
              <span
                class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest"
                >Hạng thành viên mua đơn</span
              >
              <span
                class="text-xs font-black text-slate-800 dark:text-slate-200 mt-1"
              >
                Cấp bậc: {{ getRankName(selectedOrder.rawItem.order.userRank) }}
              </span>
            </div>
            <span
              class="font-extrabold text-[9px] px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
            >
              Nhận {{ selectedOrder.rawItem.order.commissionRate }}% hoa hồng
            </span>
          </div>

          <!-- 2. Product Details -->
          <div>
            <span
              class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5"
              >Thông tin sản phẩm</span
            >
            <div
              class="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <div
                class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed"
              >
                {{ selectedOrder.itemName || "Sản phẩm từ Shopee" }}
              </div>
              <div
                class="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2"
              >
                <span v-if="selectedOrder.rawItem?.order?.itemId"
                  >Mã SP: {{ selectedOrder.rawItem.order.itemId }}</span
                >
                <span
                  v-if="selectedOrder.rawItem?.order?.l1GlobalCategory"
                  class="h-1 w-1 bg-slate-300 dark:bg-slate-700 rounded-full"
                ></span>
                <span v-if="selectedOrder.rawItem?.order?.l1GlobalCategory"
                  >Danh mục:
                  {{ selectedOrder.rawItem.order.l1GlobalCategory }}</span
                >
              </div>
            </div>
          </div>

          <!-- 3. Financial Info -->
          <div>
            <span
              class="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2.5"
              >Chi tiết tích lũy hoàn tiền</span
            >
            <div
              class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-500/20 text-center shadow-sm"
            >
              <span
                class="text-[9px] font-black text-[#ee4d2d] uppercase block tracking-widest"
                >Tiền hoàn bạn nhận được</span
              >
              <span class="text-xl font-black text-[#ee4d2d] block mt-1.5"
                >+{{ formatMoney(selectedOrder.cashbackAmount) }}đ</span
              >
            </div>
          </div>

          <!-- 4. Date Info -->
          <div
            class="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2 text-[10px] text-slate-500 font-bold"
          >
            <div>Thời gian đặt hàng: {{ selectedOrder.date }}</div>
            <div>Trạng thái đối soát: {{ selectedOrder.status }}</div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  FrownOutlined,
} from "@ant-design/icons-vue";
import { AFFILIATE_TYPES } from "@/utils/constants";
import OrderProcessInfo from "@/components/OrderProcessInfo.vue";
import axios from "@/api/axios";
import { usePromiseTracker } from "@/composables/usePromiseTracker";

onMounted(() => {
});

const getBrandLogo = (type) => {
  if (type === AFFILIATE_TYPES.TIKTOK) return "/icon/tiktok.webp";
  if (type === AFFILIATE_TYPES.LAZADA) return "/icon/lazada.webp";
  return "/icon/shopee.webp";
};

const activeTab = ref("pending");
const currentPage = ref(1);

const statusMap = {
  pending: "Pending",
  success: "Completed",
  cancelled: "Cancelled",
};

const ordersData = ref(null);
const { isLoading, trackPromise } = usePromiseTracker();

const fetchOrders = async () => {
  try {
    const params = {
      status: statusMap[activeTab.value],
      page: currentPage.value,
    };
    const response = await trackPromise(axios.get("/order", { params }));
    ordersData.value = response.data;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    ordersData.value = null;
  }
};

onMounted(() => {
  fetchOrders();
});

watch(activeTab, () => {
  currentPage.value = 1;
  fetchOrders();
});

const totalOrders = computed(() => ordersData.value?.data?.total || 0);
const pageSize = computed(() => ordersData.value?.data?.per_page || 15);

const rawOrders = computed(() => {
  const res = ordersData.value;
  if (!res) return [];
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
});

const mapOrder = (item) => {
  const order = item.order || item;
  let dateStr = "N/A";
  if (order.order_time) {
    const d = new Date(order.order_time);
    dateStr = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()} ${d
      .getHours()
      .toString()
      .padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  }

  let normStatus = "Chờ duyệt";
  const s = order.order_status?.toLowerCase() || "";
  if (s.includes("completed") || s.includes("Completed"))
    normStatus = "Thành công";
  else if (s.includes("cancelled") || s.includes("Cancelled"))
    normStatus = "Đã hủy";

  return {
    code: order.order_id || "N/A",
    storeName: order.shop_name || "Shopee",
    itemName: order.product_name,
    date: dateStr,
    purchaseAmount: order.purchase_value || 0,
    cashbackAmount: order.user_commission || 0,
    status: normStatus,
    type: order.type || 1,
    rawItem: item,
  };
};

const filteredOrders = computed(() => rawOrders.value.map(mapOrder));

const formatMoney = (val) =>
  Math.round(Number(val || 0)).toLocaleString("vi-VN");

const selectedOrder = ref(null);
const isModalOpen = computed(() => !!selectedOrder.value);
const openOrderDetails = (order) => (selectedOrder.value = order);
const closeOrderDetails = () => (selectedOrder.value = null);

const getRankName = (rank) => {
  if (!rank) return "BẠC";
  const r = rank.toLowerCase();
  if (r === "obsidian") return "TINH HOA";
  if (r === "gold") return "VÀNG";
  if (r === "diamond") return "KIM CƯƠNG";
  return "BẠC";
};

const drawerWidth = ref("100%");
onMounted(() => {
  const updateWidth = () => {
    drawerWidth.value = window.innerWidth >= 768 ? "400px" : "100%";
  };
  updateWidth();
  window.addEventListener("resize", updateWidth);
  onUnmounted(() => window.removeEventListener("resize", updateWidth));
});
</script>

<style scoped>
/* Tối ưu hiển thị thanh Tabs trên Mobile (Option A) */
@media (max-width: 640px) {
  :deep(.ant-tabs-nav-list) {
    width: 100%;
    display: flex;
  }
  :deep(.ant-tabs-tab) {
    flex: 1;
    justify-content: center;
    padding: 12px 2px !important;
    margin: 0 !important;
  }
  :deep(.ant-tabs-tab-btn) {
    font-size: 13px !important;
  }
  :deep(.ant-tabs-tab-btn span) {
    display: flex;
    align-items: center;
    gap: 4px;
    justify-content: center;
  }
  /* Ẩn icon trên mobile để gọn hơn */
  :deep(.ant-tabs-tab-btn .anticon) {
    display: none !important;
  }
}
</style>
