<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Yêu Cầu Rút Tiền</h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Quản lý và duyệt các lệnh rút tiền từ người dùng.</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="8">
        <a-card size="small" :bordered="false" class="admin-stat-card">
          <a-skeleton-button active v-if="pending && !response" block />
          <a-statistic v-else title="Tổng Lệnh" :value="withdrawals.length" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card size="small" :bordered="false" class="admin-stat-card">
          <a-skeleton-button active v-if="pending && !response" block />
          <a-statistic v-else title="Chờ Xử Lý" :value="pendingCount" :value-style="{ color: '#f59e0b' }" />
        </a-card>
      </a-col>
      <a-col :xs="24" :sm="8">
        <a-card size="small" :bordered="false" class="admin-stat-card">
          <a-skeleton-button active v-if="pending && !response" block />
          <a-statistic v-else title="Tổng Tiền (Chờ)" :value="formatMoney(totalPendingAmount)" :value-style="{ color: '#f43f5e' }" />
        </a-card>
      </a-col>
    </a-row>

    <!-- Data Table -->
    <a-card :bordered="false" class="admin-card" :body-style="{ padding: 0 }">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <a-input-search
            v-model:value="searchInput"
            placeholder="Tìm kiếm mã GD"
            enter-button="Tìm"
            style="width: 220px"
            @search="handleSearch"
          />
          <a-select
            v-model:value="filterStatus"
            :options="statusOptions"
            style="width: 180px"
          />
          <a-select
            v-model:value="limit"
            :options="[
              { label: '10 / trang', value: 10 },
              { label: '20 / trang', value: 20 },
              { label: '50 / trang', value: 50 },
              { label: '100 / trang', value: 100 },
            ]"
            style="width: 120px"
          />
          <a-button v-if="searchQuery || filterStatus !== 'all' || searchInput" @click="clearAllFilters" type="text" danger class="flex items-center gap-1">
            <template #icon><CloseOutlined /></template>
            Xóa bộ lọc
          </a-button>
        </div>

        <a-button
          type="primary"
          ghost
          @click="refresh"
          :loading="pending"
          class="font-medium px-4 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <template #icon><ReloadOutlined /></template>
          Làm mới
        </a-button>
      </div>

      <!-- Table -->
      <a-table
        :columns="columns"
        :data-source="filteredWithdrawals"
        :row-key="(r) => r.id"
        :pagination="false"
        :loading="pending"
        :scroll="{ x: 'max-content' }"
        :custom-row="(record) => ({
          onClick: () => openDetails(record),
          class: 'cursor-pointer',
        })"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'reference_id'">
            <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">#{{ record.reference_id }}</span>
          </template>
          <template v-else-if="column.key === 'user'">
            <div class="flex flex-col">
              <span class="font-bold text-slate-700 dark:text-slate-200 text-xs">{{ record?.wallet?.user?.name || 'Ẩn danh' }}</span>
              <span class="text-[11px] text-slate-500 font-medium mt-0.5 truncate max-w-[150px]">{{ record?.wallet?.user?.email || 'N/A' }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'created_at'">
            <span class="text-xs text-slate-500 font-medium">{{ new Date(record.created_at).toLocaleString('vi-VN') }}</span>
          </template>
          <template v-else-if="column.key === 'amount'">
            <div class="text-right">
              <span class="font-bold text-rose-500 text-[13px]">-{{ formatMoney(Math.abs(record.amount)) }}</span>
            </div>
          </template>
          <template v-else-if="column.key === 'status'">
            <div class="flex items-center justify-center">
              <a-tag :color="getStatusColor(record.status)">{{ getStatusLabel(record.status) }}</a-tag>
            </div>
          </template>
        </template>
      </a-table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium">Trang {{ page }} / {{ totalPages }}</span>
        <a-pagination :current="page" :total="totalPages * limit" :page-size="limit" show-less-items @change="(p) => page = p" />
      </div>
    </a-card>

    <!-- Detail Drawer -->
    <a-drawer v-model:open="isDrawerOpen" placement="right" width="450px" :closable="false">
      <template #title>
        <div v-if="selectedItem">
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Chi Tiết Rút Tiền</h3>
          <p class="text-[11px] text-slate-500 font-medium mt-0.5">{{ selectedItem.reference_id || selectedItem.referenceId }}</p>
        </div>
      </template>
      <template #extra>
        <a-button type="text" @click="closeDetails"><CloseOutlined /></a-button>
      </template>

      <div v-if="selectedItem" class="flex flex-col gap-6">
        <!-- QR Code -->
        <div v-if="selectedItem.qr_code_url" class="flex flex-col items-center">
          <a-card size="small" :bordered="false" class="w-full bg-slate-50 dark:bg-slate-900/50 text-center">
            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">Quét QR chuyển khoản</h4>
            <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-200 inline-block">
              <img :src="selectedItem.qr_code_url" alt="QR Code" class="w-40 h-40 object-contain" />
            </div>
            <p class="text-[11px] text-slate-500 mt-4 max-w-[250px] mx-auto">Sử dụng App Ngân hàng để quét mã QR.</p>
          </a-card>
        </div>

        <!-- Detail grid -->
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="Trạng Thái">
            <a-tag :color="getStatusColor(selectedItem.status)">{{ getStatusLabel(selectedItem.status) }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Số Tiền">
            <span class="font-bold text-rose-500">{{ formatMoney(Math.abs(selectedItem.amount)) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Khách Hàng">
            <span class="font-bold text-sm">{{ selectedItem?.wallet?.user?.name || 'Ẩn danh' }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Email">
            <span class="break-all" :title="selectedItem?.wallet?.user?.email">{{ selectedItem?.wallet?.user?.email || 'N/A' }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Mô Tả">
            <span class="font-medium">{{ selectedItem.description || 'Không có mô tả' }}</span>
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedItem.status === 'rejected'" label="Lý Do Hủy">
            <span class="font-medium text-rose-500">{{ selectedItem.reject_reason || selectedItem.rejectReason || 'Không có lý do cụ thể' }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <template #footer>
        <div v-if="selectedItem">
          <!-- Reject Input -->
          <div v-if="showRejectInput" class="flex flex-col gap-3">
            <div class="flex flex-col gap-1.5">
              <label class="text-[11px] font-bold text-slate-700 dark:text-slate-300">Lý do từ chối <span class="text-rose-500">*</span></label>
              <a-textarea v-model:value="rejectReason" :maxlength="100" :rows="2" placeholder="Nhập lý do từ chối..." class="text-xs font-medium" />
              <div class="flex justify-between items-center text-[10px]">
                <span v-if="rejectError" class="text-rose-500 font-medium">{{ rejectError }}</span>
                <span v-else></span>
                <span class="text-slate-400">{{ rejectReason.length }}/100</span>
              </div>
            </div>
            <a-space class="w-full justify-end">
              <a-button @click="showRejectInput = false">Hủy</a-button>
              <a-button @click="submitUpdateStatus('rejected')" :loading="isUpdating" danger type="primary">Xác nhận từ chối</a-button>
            </a-space>
          </div>

          <!-- Normal Actions -->
          <div v-else>
            <template v-if="selectedItem.status === 'pending'">
              <a-space class="w-full justify-end">
                <a-button @click="showRejectInput = true" danger class="font-semibold">Từ Chối</a-button>
                <a-button @click="submitUpdateStatus('success')" :loading="isUpdating" type="primary" class="font-semibold">Duyệt Lệnh</a-button>
              </a-space>
            </template>
            <template v-else-if="selectedItem.status === 'rejected'">
              <a-alert type="error" show-icon :message="`Lý do từ chối: ${selectedItem.reject_reason || selectedItem.rejectReason || 'Không có lý do cụ thể'}`" />
            </template>
          </div>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { SyncOutlined, CloseOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import axios from "@/api/axios";

const columns = [
  { title: 'Mã GD', dataIndex: 'reference_id', key: 'reference_id', width: 150 },
  { title: 'Người Dùng', dataIndex: 'user', key: 'user', width: 200 },
  { title: 'Thời Gian', dataIndex: 'created_at', key: 'created_at', width: 170 },
  { title: 'Số Tiền', dataIndex: 'amount', key: 'amount', align: 'right', width: 140 },
  { title: 'Trạng Thái', dataIndex: 'status', key: 'status', align: 'center', width: 130 },
];

const page = ref(1);
const limit = ref(20);
const searchQuery = ref("");
const searchInput = ref("");
const filterStatus = ref("all");
const selectedItem = ref(null);

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chờ xử lý", value: "pending" },
  { label: "Đã hoàn thành", value: "success" },
  { label: "Đã hủy", value: "rejected" },
];

const isDrawerOpen = computed({
  get: () => !!selectedItem.value,
  set: (val) => { if (!val) selectedItem.value = null; },
});

const handleSearch = () => { searchQuery.value = searchInput.value.trim(); };
const clearAllFilters = () => { searchInput.value = ""; searchQuery.value = ""; filterStatus.value = "all"; };

const queryParams = computed(() => {
  const params = { page: page.value, limit: limit.value };
  if (searchQuery.value.trim()) params.search = searchQuery.value.trim();
  if (filterStatus.value && filterStatus.value !== "all") params.status = filterStatus.value;
  return params;
});

const response = ref(null);
const pending = ref(false);

const refresh = async () => {
  pending.value = true;
  try {
    const res = await axios.get("/admin/history-transaction", { params: queryParams.value });
    // Note: Assuming /admin/history-transaction for withdrawals if /api/wallet/withdrawals doesn't exist
    // Original used: /api/wallet/withdrawals
    // I will use /wallet/withdrawals from backend API
    // Actually the backend might have /admin/withdrawals or similar. Let's use /wallet/withdrawals for now since that's what Nuxt used.
    const actualRes = await axios.get("/wallet/withdrawals", { params: queryParams.value });
    response.value = actualRes.data;
  } catch (err) {
    console.error(err);
  } finally {
    pending.value = false;
  }
};

watch(queryParams, refresh, { deep: true, immediate: true });

const withdrawals = computed(() => {
  const res = response.value;
  if (!res) return [];
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data?.items) return res.data.items;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
});

const totalPages = computed(() => {
  const res = response.value;
  if (!res) return 1;
  const target = res.data || res;
  if (target.last_page !== undefined) return target.last_page;
  if (target.meta?.last_page !== undefined) return target.meta.last_page;
  return 1;
});

watch([limit, searchQuery, filterStatus], () => { page.value = 1; });

const pendingCount = computed(() => withdrawals.value.filter(i => i.status === "pending").length);
const totalPendingAmount = computed(() => withdrawals.value.filter(i => i.status === "pending").reduce((s, i) => s + Math.abs(i.amount), 0));
const filteredWithdrawals = computed(() => withdrawals.value);

const getStatusColor = (s) => {
  if (s === 'completed' || s === 'success' || s === 'approved') return 'success';
  if (s === 'pending') return 'warning';
  return 'error';
};
const getStatusLabel = (s) => {
  if (s === 'completed' || s === 'success' || s === 'approved') return 'Thành công';
  if (s === 'pending') return 'Chờ duyệt';
  return 'Đã hủy';
};

const formatMoney = (val) => {
  if (!val) return "0đ";
  return val.toLocaleString("vi-VN") + "đ";
};

const isUpdating = ref(false);
const showRejectInput = ref(false);
const rejectReason = ref("");
const rejectError = ref("");

const openDetails = (item) => { selectedItem.value = item; showRejectInput.value = false; rejectReason.value = ""; rejectError.value = ""; };
const closeDetails = () => { selectedItem.value = null; showRejectInput.value = false; };

watch(selectedItem, (newVal) => {
  if (typeof document !== "undefined") document.body.style.overflow = newVal ? "hidden" : "";
});
onUnmounted(() => { if (typeof document !== "undefined") document.body.style.overflow = ""; });

const submitUpdateStatus = async (status) => {
  if (!selectedItem.value) return;
  if (status === "rejected") {
    if (!rejectReason.value.trim()) { rejectError.value = "Vui lòng nhập lý do từ chối"; return; }
    if (rejectReason.value.length > 100) { rejectError.value = "Lý do không được vượt quá 100 ký tự"; return; }
  }
  isUpdating.value = true;
  rejectError.value = "";
  try {
    const payload = { status };
    if (status === "rejected") payload.rejectReason = rejectReason.value.trim();
    const res = await axios.put(`/wallet/withdrawals/${selectedItem.value.id}/status`, payload);
    if (res.data?.success !== false) { await refresh(); closeDetails(); }
  } catch (err) {
    rejectError.value = err.response?.data?.message || err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.";
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
.admin-stat-card { border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
.admin-card { border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
:deep(.ant-table-row:hover > td) { background: rgba(248,250,252,0.8) !important; }
</style>
