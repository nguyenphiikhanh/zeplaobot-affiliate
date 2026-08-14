<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { message } from "ant-design-vue";
import {
  CloseOutlined,
  DeleteOutlined,
  FileDoneOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  SyncOutlined,
  UploadOutlined,
  UserOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

interface OrderItem {
  id: number;
  order_id: string;
  order_status?: string | null;
  order_time?: string | null;
  shop_name?: string | null;
  product_name?: string | null;
  purchase_value?: number | null;
  actual_commission?: number | null;
  user_commission?: number | null;
  sub_id?: string | null;
  user_id?: string | null;
  user_name?: string | null;
  user_tracking_code?: string | null;
  type?: number | null;
  img_code?: string | null;
  imgCode?: string | null;
}

type CsvRow = Record<string, string | null>;
type ImportRow = Record<string, string | number | null>;

interface AdminUser {
  id: string;
  name: string | null;
  image: string | null;
}

const loading = ref(false);
const orders = ref<OrderItem[]>([]);
const totalOrders = ref(0);
const totalPages = ref(1);
const currentPage = ref(1);
const limit = ref(20);
const selectedStatus = ref("all");
const orderIdInput = ref("");
const orderIdFilter = ref("");
const selectedUserId = ref("");
const isFilterExpanded = ref(false);
const selectedOrder = ref<OrderItem | null>(null);

// User selection modal state
const users = ref<AdminUser[]>([]);
const showUserModal = ref(false);
const userSearch = ref("");
const loadingUsers = ref(false);

const selectedUser = computed(() =>
  users.value.find((x) => x.id === selectedUserId.value)
);
const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase();
  return keyword
    ? users.value.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(keyword) ||
          u.id.toLowerCase().includes(keyword)
      )
    : users.value;
});

const fetchUsers = async () => {
  loadingUsers.value = true;
  try {
    const r = await api.get<ApiResponse<{ users: AdminUser[] }>>(
      "/api/admin/users/list",
      {
        params: {
          page: 1,
          limit: 100,
          search: userSearch.value.trim() || undefined,
        },
      }
    );
    users.value = r.data.data?.users || [];
  } catch {
    users.value = [];
    message.error("Không thể tải danh sách người dùng.");
  } finally {
    loadingUsers.value = false;
  }
};

const openUserModal = async () => {
  showUserModal.value = true;
  userSearch.value = "";
  await fetchUsers();
};

const selectUser = (user: AdminUser) => {
  selectedUserId.value = user.id;
  showUserModal.value = false;
  userSearch.value = "";
  currentPage.value = 1;
  fetchOrders();
};

const clearUserFilter = () => {
  selectedUserId.value = "";
  currentPage.value = 1;
  fetchOrders();
};

const showUploadModal = ref(false);
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const isSyncing = ref(false);

interface SyncStatusInfo {
  isRunning: boolean;
  startedAt: string | null;
  totalDays: number;
  completedDays: number;
  currentDate: string | null;
  successCount: number;
  skippedCount: number;
  message: string;
  error: string | null;
}

const syncStatusInfo = ref<SyncStatusInfo | null>(null);
let syncPollInterval: ReturnType<typeof setInterval> | null = null;

const stopSyncPolling = () => {
  if (syncPollInterval) {
    clearInterval(syncPollInterval);
    syncPollInterval = null;
  }
};

const checkSyncStatus = async () => {
  try {
    const res = await api.get<ApiResponse<SyncStatusInfo>>(
      "/api/admin/orders/sync-status"
    );
    const status = res.data?.data;
    if (!status) return;

    syncStatusInfo.value = status;

    if (status.isRunning) {
      isSyncing.value = true;
      if (!syncPollInterval) {
        syncPollInterval = setInterval(checkSyncStatus, 2000);
      }
    } else {
      if (isSyncing.value) {
        isSyncing.value = false;
        stopSyncPolling();
        message.success(status.message || "Đồng bộ hoàn tất!");
        await fetchOrders();
      } else {
        stopSyncPolling();
      }
    }
  } catch (err) {
    console.error("Lỗi kiểm tra trạng thái đồng bộ:", err);
  }
};

const handleSync = async () => {
  if (isSyncing.value) return;
  isSyncing.value = true;
  try {
    const res = await api.post<
      ApiResponse<{
        alreadyRunning: boolean;
        status: SyncStatusInfo;
        message: string;
      }>
    >("/api/admin/orders/sync-shopee");
    const data = res.data?.data;
    message.info(
      data?.message || res.data?.message || "Đã bắt đầu tiến trình đồng bộ..."
    );

    await checkSyncStatus();
    if (!syncPollInterval) {
      syncPollInterval = setInterval(checkSyncStatus, 2000);
    }
  } catch (error: any) {
    const errorMsg =
      error?.response?.data?.message ||
      error?.message ||
      "Lỗi khi kích hoạt đồng bộ Shopee.";
    message.error(errorMsg);
    isSyncing.value = false;
  }
};

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chờ duyệt", value: "Pending" },
  { label: "Thành công", value: "Completed" },
  { label: "Chờ thanh toán", value: "Unpaid" },
  { label: "Đã hủy", value: "Cancelled" },
];
const columns = [
  { title: "Mã đơn", dataIndex: "order_id", key: "order_id", width: 160 },
  { title: "Người mua", key: "user", width: 180 },
  {
    title: "Sản phẩm",
    dataIndex: "product_name",
    key: "product_name",
    width: 220,
  },
  { title: "Ngày", dataIndex: "order_time", key: "order_time", width: 110 },
  {
    title: "Hoa hồng Sàn",
    dataIndex: "actual_commission",
    key: "actual_commission",
    align: "right",
    width: 140,
  },
  {
    title: "Hoa hồng User",
    dataIndex: "user_commission",
    key: "user_commission",
    align: "right",
    width: 140,
  },
  {
    title: "Trạng thái",
    dataIndex: "order_status",
    key: "order_status",
    align: "center",
    width: 130,
  },
  { title: "", key: "action", width: 50 },
];

const fetchOrders = async () => {
  loading.value = true;
  try {
    const params: Record<string, string | number> = {
      page: currentPage.value,
      limit: limit.value,
    };
    if (selectedStatus.value !== "all") params.status = selectedStatus.value;
    if (orderIdFilter.value) params.order_id = orderIdFilter.value;
    if (selectedUserId.value.trim())
      params.userId = selectedUserId.value.trim();
    const res = await api.get<
      ApiResponse<{ orders: OrderItem[]; total: number; totalPages: number }>
    >("/api/admin/orders", { params });
    orders.value = res.data.data?.orders || [];
    totalOrders.value = res.data.data?.total || 0;
    totalPages.value = res.data.data?.totalPages || 1;
  } catch {
    message.error("Không thể tải danh sách đơn hàng!");
  } finally {
    loading.value = false;
  }
};

watch([selectedStatus, limit], () => {
  currentPage.value = 1;
  fetchOrders();
});
onMounted(() => {
  fetchOrders();
  checkSyncStatus();
});
onUnmounted(() => {
  stopSyncPolling();
});

const clearAllFilters = () => {
  selectedStatus.value = "all";
  orderIdInput.value = "";
  orderIdFilter.value = "";
  selectedUserId.value = "";
  currentPage.value = 1;
  fetchOrders();
};
const applyOrderSearch = () => {
  orderIdFilter.value = orderIdInput.value.trim();
  currentPage.value = 1;
  fetchOrders();
};
const hasFilters = computed(
  () =>
    selectedStatus.value !== "all" ||
    !!orderIdFilter.value ||
    !!selectedUserId.value
);
const pendingCount = computed(
  () =>
    orders.value.filter(
      (item) => item.order_status?.toLowerCase() === "pending"
    ).length
);
const paginationText = computed(
  () => `Hiển thị ${orders.value.length} / Tổng ${totalOrders.value} đơn hàng`
);

const getStatusColor = (status?: string | null) => {
  const value = status?.toLowerCase();
  if (value === "completed" || value === "success") return "success";
  if (value === "pending") return "warning";
  if (value === "unpaid") return "default";
  return "error";
};
const getStatusLabel = (status?: string | null) => {
  const value = status?.toLowerCase();
  if (value === "completed" || value === "success") return "HOÀN THÀNH";
  if (value === "pending") return "CHỜ DUYỆT";
  if (value === "unpaid") return "CHỜ THANH TOÁN";
  if (value === "cancelled") return "ĐÃ HỦY";
  return status || "KHÔNG RÕ";
};
const formatMoney = (value?: number | null) =>
  `${Math.round(Number(value) || 0).toLocaleString("vi-VN")}đ`;

const getAdminOrderCalc = (order: OrderItem) => {
  const actualComm = Number(order.actual_commission) || 0;
  const userComm = Number(order.user_commission) || 0;
  const afterTax = Math.round(actualComm * 0.89);

  const grossProfit = actualComm - userComm;
  const netProfit = afterTax - userComm;
  const marginPercent =
    actualComm > 0 ? Math.round((netProfit / actualComm) * 100) : 0;

  return {
    actualComm,
    afterTax,
    userComm,
    grossProfit,
    netProfit,
    marginPercent,
  };
};

const copyText = (text?: string | null, label = "nội dung") => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  message.success(`Đã sao chép ${label}: ${text}`);
};

const getAdminStatusBadge = (status?: string | null) => {
  const st = (status || "").toLowerCase();
  if (st === "completed" || st === "hoàn thành" || st === "success")
    return {
      label: "Hoàn thành",
      class: "bg-[#e6f7f3] text-[#00b087] border border-[#b2ebe0]/50",
    };
  if (st === "cancelled" || st === "đã hủy" || st === "invalid")
    return {
      label: "Đã hủy",
      class: "bg-rose-50 text-rose-600 border border-rose-200/50",
    };
  return {
    label: "Chờ duyệt",
    class: "bg-amber-50 text-amber-600 border border-amber-200/50",
  };
};

const triggerFileInput = () => fileInput.value?.click();
const chooseFile = (file?: File) => {
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".csv")) {
    message.error("Vui lòng chọn đúng file CSV.");
    return;
  }
  selectedFile.value = file;
};
const handleFileSelect = (event: Event) =>
  chooseFile((event.target as HTMLInputElement).files?.[0]);
const onDrop = (event: DragEvent) => chooseFile(event.dataTransfer?.files?.[0]);
const closeUpload = () => {
  showUploadModal.value = false;
  selectedFile.value = null;
  if (fileInput.value) fileInput.value.value = "";
};

const parseCsvLine = (line: string, delimiter: string) => {
  const values: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') {
      value += '"';
      i++;
    } else if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) {
      values.push(value.trim());
      value = "";
    } else value += char;
  }
  values.push(value.trim());
  return values;
};
const parseNumber = (value: string | null) => {
  if (!value) return null;
  const number = Number(value.replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : null;
};
const mapRow = (row: CsvRow): ImportRow => {
  const value = (key: string) => row[key] || null;
  return {
    orderId: value("Order id"),
    orderStatus: value("Order Status"),
    orderTime: value("Order Time"),
    completeTime: value("Complete Time"),
    clickTime: value("Click Time"),
    shopName: value("Shop Name"),
    itemId: parseNumber(value("Item id")),
    itemName: value("Item Name"),
    qty: parseNumber(value("Qty")),
    purchaseValue: parseNumber(value("Purchase Value(₫)")),
    totalOrderCommission: parseNumber(value("Total Order Commission(₫)")),
    subId1: value("Sub_id1"),
  };
};
const parseCsv = (text: string) => {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim());
  if (lines.length < 2) throw new Error("File CSV không hợp lệ hoặc trống.");
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = parseCsvLine(lines[0], delimiter);
  const rows: ImportRow[] = [];
  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line, delimiter);
    const row: CsvRow = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    const mapped = mapRow(row);
    if (mapped.orderId) rows.push(mapped);
  }
  if (!rows.length)
    throw new Error("Không tìm thấy dữ liệu hợp lệ trong file.");
  return rows;
};
const confirmUpload = async () => {
  if (!selectedFile.value) return;
  isUploading.value = true;
  try {
    const data = parseCsv(await selectedFile.value.text());
    const res = await api.post<
      ApiResponse<{
        successCount: number;
        skippedCount: number;
        message: string;
      }>
    >("/api/admin/orders/upload-csv", { data });
    message.success(res.data.data?.message || "Cập nhật dữ liệu thành công!");
    closeUpload();
    await fetchOrders();
  } catch (error) {
    message.error(
      error instanceof Error ? error.message : "Lỗi khi upload file CSV."
    );
  } finally {
    isUploading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col gap-6 pb-12">
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2 class="text-lg font-bold text-slate-800 tracking-tight">
          Quản lý Đơn hàng
        </h2>
        <p class="text-[13px] text-slate-500 mt-1">
          Theo dõi, đối soát và upload dữ liệu đơn hàng từ mạng Affiliate.
        </p>
      </div>
      <div class="flex items-center gap-2.5 flex-wrap">
        <a-button
          type="default"
          class="!inline-flex !items-center !justify-center !gap-2 !h-9 !px-4 !rounded-xl !border-slate-200 hover:!border-[#ee4d2d] hover:!text-[#ee4d2d] font-semibold transition-colors shadow-sm"
          :loading="isSyncing"
          @click="handleSync"
        >
          <template #icon><SyncOutlined v-if="!isSyncing" /></template>
          <span>{{ isSyncing ? "Đang đồng bộ..." : "Đồng bộ" }}</span>
        </a-button>
        <a-button
          type="primary"
          class="!inline-flex !items-center !justify-center !gap-2 !h-9 !px-4 !rounded-xl !border-none !bg-[#ee4d2d] hover:!bg-[#d63d1e] !text-white font-semibold shadow-sm shadow-orange-500/20"
          @click="showUploadModal = true"
          ><template #icon><UploadOutlined /></template
          ><span>Upload CSV</span></a-button
        >
      </div>
    </div>

    <!-- Sync Progress Banner -->
    <div
      v-if="isSyncing && syncStatusInfo?.isRunning"
      class="p-3.5 px-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-between gap-4 text-xs text-orange-900 shadow-sm animate-pulse"
    >
      <div class="flex items-center gap-3">
        <SyncOutlined spin class="text-orange-600 text-base" />
        <div>
          <span class="font-bold">{{ syncStatusInfo.message }}</span>
          <span
            v-if="syncStatusInfo.currentDate"
            class="ml-2 font-semibold text-orange-700"
            >(Đã xong
            {{
              Math.round(
                (syncStatusInfo.completedDays /
                  Math.max(1, syncStatusInfo.totalDays)) *
                  100
              )
            }}%)</span
          >
        </div>
      </div>
      <div
        class="font-semibold text-orange-700 bg-orange-100/80 px-2.5 py-1 rounded-lg"
      >
        {{
          Math.round(
            (syncStatusInfo.completedDays /
              Math.max(1, syncStatusInfo.totalDays)) *
              100
          )
        }}%
      </div>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12"
        ><a-card size="small" :bordered="false"
          ><a-skeleton-button
            v-if="loading && !orders.length"
            active
            block /><a-statistic
            v-else
            title="Tổng đơn hàng"
            :value="totalOrders" /></a-card
      ></a-col>
      <a-col :xs="24" :sm="12"
        ><a-card size="small" :bordered="false"
          ><a-skeleton-button
            v-if="loading && !orders.length"
            active
            block /><a-statistic
            v-else
            title="Chờ duyệt trên trang"
            :value="pendingCount"
            :value-style="{ color: '#f59e0b' }" /></a-card
      ></a-col>
    </a-row>

    <a-card :bordered="false" :body-style="{ padding: 0 }">
      <div class="p-3 sm:p-4 border-b border-slate-100 flex flex-col gap-3">
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <a-select
              v-model:value="selectedStatus"
              :options="statusOptions"
              class="w-full sm:w-[180px]"
            />
            <a-select
              v-model:value="limit"
              :options="[
                { label: '20 / trang', value: 20 },
                { label: '50 / trang', value: 50 },
                { label: '100 / trang', value: 100 },
              ]"
              class="w-full sm:w-[120px]"
            />

            <button
              type="button"
              class="btn-action-secondary"
              @click="isFilterExpanded = !isFilterExpanded"
            >
              <FilterOutlined />
              <span>{{ isFilterExpanded ? "Thu gọn" : "Mở rộng" }}</span>
            </button>

            <button
              v-if="hasFilters"
              type="button"
              class="btn-action-danger"
              @click="clearAllFilters"
            >
              <DeleteOutlined />
              <span>Xóa bộ lọc</span>
            </button>
          </div>

          <button
            type="button"
            class="btn-action-primary shrink-0 w-full sm:w-auto"
            :disabled="loading"
            @click="fetchOrders"
          >
            <ReloadOutlined />
            <span>Làm mới</span>
          </button>
        </div>

        <div
          v-if="isFilterExpanded"
          class="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 border-dashed"
        >
          <span
            class="text-xs font-semibold text-slate-500 uppercase w-full sm:w-auto"
            >Tìm theo Order ID:</span
          >
          <!-- Unified Order ID Search Pill -->
          <div
            class="flex items-center rounded-xl border border-slate-200 bg-white p-1 focus-within:border-[#ee4d2d] focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-sm w-full sm:w-auto"
          >
            <SearchOutlined class="text-slate-400 ml-2.5 text-xs" />
            <input
              v-model="orderIdInput"
              placeholder="Nhập mã đơn hàng..."
              class="w-full sm:w-52 h-7 pl-2 pr-2 text-xs text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
              @keyup.enter="applyOrderSearch()"
            />
            <button
              v-if="orderIdInput"
              type="button"
              class="text-slate-300 hover:text-slate-500 mr-3.5 text-xs cursor-pointer flex items-center justify-center p-0.5"
              @click="
                orderIdInput = '';
                applyOrderSearch();
              "
            >
              <CloseOutlined class="text-[10px]" />
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 h-7 px-3.5 rounded-lg bg-[#ee4d2d] hover:bg-[#d63d1e] active:bg-[#bd3617] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
              @click="applyOrderSearch()"
            >
              <SearchOutlined class="text-[11px]" />
              <span>Tìm</span>
            </button>
          </div>

          <span
            class="text-xs font-semibold text-slate-500 uppercase w-full sm:w-auto"
            >Người dùng:</span
          >
          <button
            type="button"
            class="btn-action-secondary w-full sm:w-auto justify-between"
            @click="openUserModal"
          >
            <span class="flex items-center gap-2">
              <UserOutlined />
              <span class="max-w-[180px] truncate">{{
                selectedUser
                  ? selectedUser.name || selectedUser.id
                  : "Tìm người dùng"
              }}</span>
            </span>
            <CloseOutlined
              v-if="selectedUserId"
              class="ml-1 text-slate-400 hover:text-rose-500"
              @click.stop="clearUserFilter"
            />
          </button>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="orders"
        :row-key="(r: OrderItem) => r.order_id || r.id"
        :pagination="false"
        :loading="loading"
        :scroll="{ x: 1100 }"
        :custom-row="(record: OrderItem) => ({onClick:()=>selectedOrder=record,class:'cursor-pointer'})"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order_id'"
            ><div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded-md bg-[#ee4d2d] text-white font-extrabold text-[10px]"
                >SHOPEE</span
              ><span class="font-bold text-slate-700 text-xs"
                >#{{ record.order_id }}</span
              >
            </div></template
          >
          <template v-else-if="column.key === 'user'"
            ><div v-if="record.user_id" class="flex flex-col">
              <span class="font-bold text-slate-800 text-xs">{{
                record.user_name || "Người dùng hệ thống"
              }}</span
              ><span class="text-[11px] font-mono text-slate-500"
                >ID: {{ record.user_id }}</span
              >
            </div>
            <span v-else class="text-xs text-slate-400 italic"
              >Không rõ</span
            ></template
          >
          <template v-else-if="column.key === 'product_name'">
            <div class="flex items-center gap-2.5">
              <div
                class="w-9 h-9 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden p-0.5"
              >
                <img
                  v-if="record.img_code || record.imgCode"
                  :src="`https://down-tx-vn.img.susercontent.com/${
                    record.img_code || record.imgCode
                  }.webp`"
                  :alt="record.product_name || 'Shopee'"
                  class="w-full h-full object-cover rounded-md"
                />
                <img
                  v-else
                  src="/logo/shopee.png"
                  alt="Shopee"
                  class="w-full h-full object-contain p-0.5"
                />
              </div>
              <div
                class="font-semibold text-slate-700 text-[13px] truncate max-w-[180px]"
                :title="record.product_name"
              >
                {{ record.product_name || "Sản phẩm từ Shopee" }}
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'order_time'"
            ><span class="text-xs text-slate-500">{{
              record.order_time
                ? new Date(record.order_time).toLocaleDateString("vi-VN")
                : "—"
            }}</span></template
          >
          <template v-else-if="column.key === 'actual_commission'"
            ><span class="font-bold text-slate-800 text-[13px]">{{
              formatMoney(record.actual_commission)
            }}</span></template
          >
          <template v-else-if="column.key === 'user_commission'"
            ><span class="font-bold text-emerald-600 text-[13px]">{{
              formatMoney(record.user_commission)
            }}</span></template
          >
          <template v-else-if="column.key === 'order_status'"
            ><a-tag :color="getStatusColor(record.order_status)">{{
              getStatusLabel(record.order_status)
            }}</a-tag></template
          >
          <template v-else-if="column.key === 'action'"
            ><button
              type="button"
              class="btn-action-primary !h-7 !px-2.5 text-[11px]"
              @click.stop="selectedOrder = record"
            >
              <span>Chi tiết</span><RightOutlined class="text-[10px]" /></button
          ></template>
        </template>
      </a-table>
      <div
        class="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <span class="text-xs text-slate-500">{{ paginationText }}</span
        ><a-pagination
          v-if="totalPages > 1"
          v-model:current="currentPage"
          :total="totalOrders"
          :page-size="limit"
          show-less-items
          @change="fetchOrders"
        />
      </div>
    </a-card>

    <a-modal
      v-model:open="showUploadModal"
      title="Upload dữ liệu đối soát"
      :footer="null"
      @cancel="closeUpload"
    >
      <div class="relative">
        <div
          v-if="isUploading"
          class="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-xl"
        >
          <a-spin size="large" />
          <p class="text-sm font-bold mt-3">Đang xử lý...</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".csv,text/csv"
          @change="handleFileSelect"
        />
        <div
          v-if="!selectedFile"
          class="mt-4 border-2 border-dashed border-orange-200 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer bg-orange-50/40 hover:border-[#ee4d2d] hover:bg-orange-50"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="onDrop"
        >
          <UploadOutlined class="text-3xl text-[#ee4d2d] mb-3" />
          <h4 class="text-sm font-bold">Kéo thả file CSV vào đây</h4>
          <p class="text-[11px] text-slate-500 mb-4">
            hoặc click để chọn file từ máy tính
          </p>
          <a-button
            class="!inline-flex !items-center !justify-center !h-8 !rounded-lg !border-orange-200 !text-[#ee4d2d] font-semibold"
            >Chọn file</a-button
          >
        </div>
        <div
          v-else
          class="mt-4 border border-orange-200 rounded-xl p-5 flex flex-col items-center text-center bg-orange-50/40"
        >
          <FileDoneOutlined class="text-3xl text-[#ee4d2d] mb-3" />
          <h4 class="text-sm font-bold">{{ selectedFile.name }}</h4>
          <p class="text-[11px] text-slate-500 mb-5">
            {{ (selectedFile.size / 1024).toFixed(2) }} KB
          </p>
          <div class="flex items-center justify-center gap-3">
            <a-button
              class="!inline-flex !items-center !justify-center !h-8 !rounded-lg"
              @click="selectedFile = null"
              >Hủy</a-button
            ><a-button
              type="primary"
              class="!inline-flex !items-center !justify-center !h-8 !px-4 !rounded-lg !border-none !bg-[#ee4d2d] hover:!bg-[#d63d1e] !text-white font-semibold"
              @click="confirmUpload"
              >Upload</a-button
            >
          </div>
        </div>
        <div class="mt-4 flex items-start gap-2">
          <InfoCircleOutlined class="text-slate-400 mt-0.5" />
          <p class="text-[11px] text-slate-500">
            File CSV phải được trích xuất từ báo cáo Shopee Affiliate. Hệ thống
            sẽ so khớp <b>Order id</b> và <b>Sub_id1</b>.
          </p>
        </div>
      </div>
    </a-modal>

    <!-- Admin Order Detail Drawer (Enhanced with Profit Calculation & User Card Style) -->
    <a-drawer
      :open="!!selectedOrder"
      placement="right"
      width="460"
      title="Chi tiết đơn hàng (Admin)"
      @close="selectedOrder = null"
    >
      <div v-if="selectedOrder" class="space-y-4 text-left font-sans">
        <!-- 1. Header Profit Spotlight Banner -->
        <div
          class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-slate-700/60 space-y-3"
        >
          <!-- Background decorative glow -->
          <div
            class="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
          ></div>

          <div class="flex items-center justify-between gap-2 relative z-10">
            <div class="space-y-0.5">
              <span
                class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider"
                >LỢI NHUẬN</span
              >
              <div
                class="text-2xl sm:text-3xl font-black text-[#00b087] tracking-tight"
              >
                +{{ formatMoney(getAdminOrderCalc(selectedOrder).netProfit) }}
              </div>
            </div>

            <span
              :class="[
                'px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0',
                getAdminStatusBadge(selectedOrder.order_status).class,
              ]"
            >
              {{ getAdminStatusBadge(selectedOrder.order_status).label }}
            </span>
          </div>

          <div
            class="pt-2 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-xs relative z-10"
          >
            <div>
              <span class="text-slate-400 text-[11px] block">Trước thuế:</span>
              <strong class="text-slate-200 font-bold">{{
                formatMoney(getAdminOrderCalc(selectedOrder).grossProfit)
              }}</strong>
            </div>
          </div>
        </div>

        <!-- 2. Order ID & Date Pill Card -->
        <div
          class="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2"
        >
          <div class="flex items-center justify-between gap-2">
            <span class="text-[10px] font-bold uppercase text-slate-400"
              >Mã đơn hàng Shopee</span
            >
            <span
              class="text-xs text-slate-400 font-medium"
              v-if="selectedOrder.order_time"
            >
              {{ new Date(selectedOrder.order_time).toLocaleString("vi-VN") }}
            </span>
          </div>

          <div class="flex items-center justify-between gap-2">
            <button
              type="button"
              @click="copyText(selectedOrder.order_id, 'mã đơn')"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-mono font-bold text-xs transition-colors cursor-pointer border-0"
              title="Bấm để sao chép mã đơn"
            >
              <span>#{{ selectedOrder.order_id }}</span>
              <CopyOutlined class="text-xs text-slate-400" />
            </button>

            <span
              v-if="selectedOrder.sub_id"
              class="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg"
            >
              SubID: {{ selectedOrder.sub_id }}
            </span>
          </div>
        </div>

        <!-- 3. Buyer / User Info Card -->
        <div
          class="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2"
        >
          <div class="text-[10px] font-bold uppercase text-slate-400">
            Thông tin người mua hàng
          </div>

          <div class="flex items-center gap-3 pt-0.5">
            <div
              class="w-10 h-10 rounded-full bg-orange-100 text-[#ee4d2d] font-black text-sm flex items-center justify-center shrink-0 border border-orange-200"
            >
              {{ (selectedOrder.user_name || "U").charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="text-xs font-bold text-slate-900 truncate">
                {{ selectedOrder.user_name || "Người dùng Zalo" }}
              </div>
              <div
                class="text-[11px] text-slate-400 font-mono flex items-center gap-2 truncate"
              >
                <span>UID: {{ selectedOrder.user_id || "N/A" }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Product Details Card -->
        <div
          class="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-2.5"
        >
          <div class="text-[10px] font-bold uppercase text-slate-400">
            Sản phẩm mua sắm
          </div>

          <div class="flex items-start gap-3">
            <div
              class="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden p-1"
            >
              <img
                v-if="selectedOrder.img_code || selectedOrder.imgCode"
                :src="`https://down-tx-vn.img.susercontent.com/${
                  selectedOrder.img_code || selectedOrder.imgCode
                }.webp`"
                :alt="selectedOrder.product_name || 'Shopee'"
                class="w-full h-full object-cover rounded-lg"
              />
              <img
                v-else
                src="/logo/shopee.png"
                alt="Shopee"
                class="w-full h-full object-contain p-0.5"
              />
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <h4
                class="text-xs font-bold text-slate-900 line-clamp-2 leading-snug m-0"
              >
                {{ selectedOrder.product_name || "Sản phẩm Shopee" }}
              </h4>
              <div class="text-[11px] text-slate-400 font-medium">
                Shop: {{ selectedOrder.shop_name || "Shopee" }}
              </div>
              <div class="text-xs font-black text-slate-800">
                Giá trị đơn: {{ formatMoney(selectedOrder.purchase_value) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 5. Financial Breakdown Grid -->
        <div
          class="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden space-y-0"
        >
          <div
            class="p-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400"
          >
            Chi tiết phân bổ tài chính
          </div>

          <div class="divide-y divide-slate-100 text-xs">
            <div class="p-3 flex items-center justify-between">
              <span class="text-slate-500 font-medium">1. Hoa hồng Sàn:</span>
              <strong class="text-slate-900 font-extrabold">{{
                formatMoney(getAdminOrderCalc(selectedOrder).actualComm)
              }}</strong>
            </div>

            <div class="p-3 flex items-center justify-between">
              <span class="text-slate-500 font-medium"
                >2. Hoa hồng Sau Thuế (89%):</span
              >
              <strong class="text-slate-800 font-bold">{{
                formatMoney(getAdminOrderCalc(selectedOrder).afterTax)
              }}</strong>
            </div>

            <div class="p-3 flex items-center justify-between">
              <span class="text-slate-500 font-medium"
                >3. Hoa hồng trả User:</span
              >
              <strong class="text-rose-500 font-extrabold">{{
                formatMoney(getAdminOrderCalc(selectedOrder).userComm)
              }}</strong>
            </div>

            <div class="p-3 bg-emerald-50/60 flex items-center justify-between">
              <span class="text-emerald-800 font-bold">➔ Lợi nhuận:</span>
              <strong class="text-[#00b087] font-black text-sm">{{
                formatMoney(getAdminOrderCalc(selectedOrder).netProfit)
              }}</strong>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- User Selection Modal -->
    <a-modal
      v-model:open="showUserModal"
      title="Chọn người dùng"
      :footer="null"
      width="560px"
      @after-close="userSearch = ''"
    >
      <a-input
        v-model:value="userSearch"
        allow-clear
        placeholder="Tìm theo tên hoặc Zalo UID..."
        class="mb-4"
        autofocus
      >
        <template #prefix><SearchOutlined class="text-slate-400" /></template>
      </a-input>
      <div class="max-h-[430px] space-y-2 overflow-y-auto pr-1">
        <div v-if="loadingUsers" class="flex justify-center py-12">
          <a-spin />
        </div>
        <button
          v-else
          v-for="user in filteredUsers"
          :key="user.id"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-orange-200 hover:bg-orange-50/60',
            user.id === selectedUserId
              ? 'border-[#ee4d2d] bg-orange-50'
              : 'border-slate-200 bg-[#FAFAFA]',
          ]"
          @click="selectUser(user)"
        >
          <div
            class="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50"
          >
            <img
              v-if="user.image"
              :src="user.image"
              referrerpolicy="no-referrer"
              loading="lazy"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center font-black text-[#ee4d2d]"
            >
              {{ user.name?.charAt(0)?.toUpperCase() || "U" }}
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-bold text-slate-800">
              {{ user.name || "Người dùng Zalo" }}
            </div>
            <div class="mt-1 truncate font-mono text-[10px] text-slate-400">
              UID: {{ user.id }}
            </div>
          </div>
          <span
            v-if="user.id === selectedUserId"
            class="rounded-full bg-[#ee4d2d] px-2.5 py-1 text-[10px] font-bold text-white"
            >Đang chọn</span
          >
        </button>
        <a-empty
          v-if="!loadingUsers && !filteredUsers.length"
          description="Không tìm thấy người dùng"
        />
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
</style>
