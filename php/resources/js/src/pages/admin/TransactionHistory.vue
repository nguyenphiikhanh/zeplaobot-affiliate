<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h2
          class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight"
        >
          Lịch sử giao dịch
        </h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Xem chi tiết lịch sử giao dịch và biến động số dư của thành viên.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <a-button
          type="primary"
          @click="showUserModal = true"
          class="font-semibold flex items-center gap-1.5"
        >
          <template #icon><UserOutlined /></template>
          Chọn Người Dùng
        </a-button>
      </div>
    </div>

    <!-- Empty State -->
    <a-card
      v-if="!selectedUser"
      :bordered="false"
      class="admin-card min-h-[400px] flex flex-col items-center justify-center"
    >
      <a-empty
        description="Vui lòng chọn người dùng để xem thông tin lịch sử giao dịch"
      >
        <template #image>
          <div class="text-5xl text-slate-300 mb-4 flex justify-center">
            <TeamOutlined />
          </div>
        </template>
        <a-button type="primary" @click="showUserModal = true" class="mt-4 font-semibold">
          Chọn ngay
        </a-button>
      </a-empty>
    </a-card>

    <!-- Main Content -->
    <div v-else class="flex flex-col gap-6">
      <!-- User Info Header -->
      <a-card :bordered="false" class="admin-card">
        <div class="flex items-center gap-4">
          <div
            class="h-14 w-14 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden"
          >
            <img
              v-if="selectedUser.image"
              :src="selectedUser.image"
              class="h-full w-full object-cover"
            />
            <span v-else class="text-xl font-bold text-indigo-600 uppercase">{{
              selectedUser.name?.charAt(0) || "U"
            }}</span>
          </div>
          <div>
            <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">
              {{ selectedUser.name || "Người dùng" }}
            </h3>
            <p class="text-sm text-slate-500">{{ selectedUser.email }}</p>
          </div>
          <a-button type="text" class="ml-auto" @click="selectedUser = null">
            <CloseOutlined /> Đóng
          </a-button>
        </div>
      </a-card>

      <!-- Stats Cards -->
      <a-row :gutter="[16, 16]">
        <a-col :xs="12" :sm="12" :lg="6">
          <a-card
            :loading="overviewPending"
            size="small"
            :bordered="false"
            class="admin-stat-card"
          >
            <a-statistic
              title="Số dư khả dụng"
              :value="overviewStats.availableBalance"
              :value-style="{ color: '#10b981' }"
            >
              <template #formatter="{ value }"
                >{{ formatMoney(value) }}đ</template
              >
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="12" :lg="6">
          <a-card
            :loading="overviewPending"
            size="small"
            :bordered="false"
            class="admin-stat-card"
          >
            <a-statistic
              title="Số tiền đã rút"
              :value="overviewStats.totalWithdrawn"
              :value-style="{ color: '#ee4d2d' }"
            >
              <template #formatter="{ value }"
                >{{ formatMoney(value) }}đ</template
              >
            </a-statistic>
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="12" :lg="6">
          <a-card
            :loading="overviewPending"
            size="small"
            :bordered="false"
            class="admin-stat-card"
          >
            <a-statistic
              title="Số đơn hoàn thành"
              :value="overviewStats.completedOrders"
            />
          </a-card>
        </a-col>
        <a-col :xs="12" :sm="12" :lg="6">
          <a-card
            :loading="overviewPending"
            size="small"
            :bordered="false"
            class="admin-stat-card"
          >
            <a-statistic
              title="Xếp hạng"
              :value="overviewStats.ranking"
              :value-style="{
                color: '#f59e0b',
                fontSize: '20px',
                fontWeight: 'bold',
              }"
            />
          </a-card>
        </a-col>
      </a-row>

      <!-- Data Table -->
      <a-card :bordered="false" class="admin-card" :body-style="{ padding: 0 }">
        <!-- Toolbar -->
        <div
          class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div class="flex flex-wrap items-center gap-3">
            <a-range-picker v-model:value="dateRange" style="width: 260px" />

            <a-select
              v-model:value="selectedStatus"
              :options="statusOptions"
              style="width: 160px"
            />

            <a-select
              v-model:value="selectedType"
              :options="typeOptions"
              style="width: 160px"
            />

            <a-button
              v-if="
                selectedStatus !== 'all' || selectedType !== 'all' || dateRange
              "
              @click="clearFilters"
              type="text"
              danger
              class="flex items-center gap-1"
            >
              <template #icon><DeleteOutlined /></template> Xóa bộ lọc
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

        <a-table
          :columns="columns"
          :data-source="transactions"
          :row-key="(r) => r.id"
          :pagination="false"
          :loading="pending"
          :scroll="{ x: 'max-content' }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'created_at'">
              <span class="text-xs text-slate-500 font-medium">{{
                record.created_at
                  ? new Date(record.created_at).toLocaleString("vi-VN")
                  : ""
              }}</span>
            </template>
            <template v-else-if="column.key === 'reference_id'">
              <div class="space-y-0.5">
                <div v-if="record.reference_id" class="font-bold text-slate-700 dark:text-slate-200 text-xs">
                  #{{ record.reference_id }}
                </div>
                <div v-if="record.description" class="text-[11px] text-slate-500 max-w-[240px] truncate" :title="record.description">
                  {{ record.description }}
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'type'">
              <div class="flex items-center justify-center">
                <a-tag v-if="record.type === 'point'" color="gold" class="font-bold">
                  🎁 Đổi S-Point
                </a-tag>
                <a-tag v-else-if="record.type === 'referral_commission'" color="orange" class="font-bold">
                  💰 HH Giới thiệu
                </a-tag>
                <a-tag v-else-if="record.type === 'commission'" color="blue" class="font-bold">
                  ⚡ Hoa hồng đơn
                </a-tag>
                <a-tag v-else color="purple" class="font-bold">
                  💸 Rút tiền
                </a-tag>
              </div>
            </template>
            <template v-else-if="column.key === 'amount'">
              <div class="text-right">
                <span
                  :class="
                    record.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  "
                  class="font-black text-[13px]"
                >
                  {{ record.amount > 0 ? "+" : ""
                  }}{{ formatMoney(record.amount) }}đ
                </span>
              </div>
            </template>
            <template v-else-if="column.key === 'status'">
              <div class="flex items-center justify-center">
                <a-tag :color="getStatusColor(record.status)">{{
                  getStatusLabel(record.status)
                }}</a-tag>
              </div>
            </template>
          </template>
        </a-table>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-end"
        >
          <a-pagination
            :current="currentPage"
            :total="totalPages * limit"
            :page-size="limit"
            show-less-items
            @change="(page) => (currentPage = page)"
          />
        </div>
      </a-card>
    </div>

    <!-- User Selection Modal -->
    <a-modal
      v-model:open="showUserModal"
      title="Tìm kiếm thành viên"
      :footer="null"
    >
      <a-input-search
        v-model:value="userSearchQuery"
        placeholder="Tìm kiếm thành viên..."
        enter-button="Tìm"
        @search="handleUserSearch"
        class="mb-4"
      />
      <div class="min-h-[150px] max-h-[400px] overflow-y-auto">
        <div
          v-if="usersLoading"
          class="flex flex-col items-center justify-center py-8 gap-3"
        >
          <a-spin />
          <span class="text-xs font-semibold text-slate-400">Đang tải...</span>
        </div>
        <a-empty
          v-else-if="usersList.length === 0"
          description="Không tìm thấy người dùng"
        />
        <div v-else class="flex flex-col gap-1">
          <button
            v-for="u in usersList"
            :key="u.id"
            @click="selectUser(u)"
            class="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
            type="button"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden"
              >
                <img
                  v-if="u.image"
                  :src="u.image"
                  class="h-full w-full object-cover"
                />
                <span
                  v-else
                  class="text-sm font-bold text-indigo-600 uppercase"
                  >{{ u.name?.charAt(0) || "U" }}</span
                >
              </div>
              <div class="flex flex-col min-w-0">
                <span
                  class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate"
                  >{{ u.name || "Người dùng Saffi" }}</span
                >
                <span
                  class="text-[11px] font-medium text-slate-500 truncate mt-0.5"
                  >{{ u.email }}</span
                >
              </div>
            </div>
            <a-tag color="green">CHỌN</a-tag>
          </button>
        </div>

        <div
          v-if="userPagination.totalPages > 1"
          class="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          <span class="text-[11px] font-bold text-slate-400 uppercase"
            >Trang {{ userPagination.page }} /
            {{ userPagination.totalPages }}</span
          >
          <a-space>
            <a-button
              :disabled="userPagination.page === 1"
              size="small"
              @click="fetchUsers(userPagination.page - 1, userSearchQuery, 20)"
            >
              <template #icon><LeftOutlined /></template>
            </a-button>
            <a-button
              :disabled="userPagination.page === userPagination.totalPages"
              size="small"
              @click="fetchUsers(userPagination.page + 1, userSearchQuery, 20)"
            >
              <template #icon><RightOutlined /></template>
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import {
  UserOutlined,
  TeamOutlined,
  CloseOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { useAdminUsers } from "@/composables/useAdminUsers";
import axios from "@/api/axios";

const formatMoney = (val) => Math.round(val || 0).toLocaleString("vi-VN");

// User Selection Modal Logic
const showUserModal = ref(false);
const selectedUser = ref(null);

const {
  users: usersList,
  isLoading: usersLoading,
  pagination: userPagination,
  fetchUsers,
} = useAdminUsers();
const userSearchQuery = ref("");

const handleUserSearch = () => {
  fetchUsers(1, userSearchQuery.value, 20);
};

const selectUser = (user) => {
  selectedUser.value = user;
  showUserModal.value = false;

  if (selectedStatus) selectedStatus.value = "all";
  if (selectedType) selectedType.value = "all";
  if (dateRange) dateRange.value = null;

  currentPage.value = 1;
};

onMounted(() => {
  fetchUsers(1, "", 20);
});

// Overview Stats API
const overviewResponse = ref(null);
const overviewPending = ref(false);

const fetchOverview = async () => {
  if (!selectedUser.value) {
    overviewResponse.value = null;
    return;
  }
  overviewPending.value = true;
  try {
    const res = await axios.get(`/admin/history-transaction/${selectedUser.value.id}/overview`);
    overviewResponse.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    overviewPending.value = false;
  }
};

watch(selectedUser, fetchOverview, { immediate: true });

const getRankName = (rank) => {
  if (!rank) return "BẠC";
  const r = rank.toLowerCase();
  if (r === "obsidian") return "TINH HOA";
  if (r === "gold") return "VÀNG";
  if (r === "diamond") return "KIM CƯƠNG";
  return "BẠC";
};

const overviewStats = computed(() => {
  const data = overviewResponse.value?.data || overviewResponse.value || {};
  return {
    availableBalance: data.wallet?.available_balance || 0,
    totalWithdrawn: data.wallet?.total_paid || 0,
    completedOrders: data.completed_orders_count || 0,
    ranking: getRankName(data.rank),
  };
});

// Table & Filter Logic
const dateRange = ref(null);
const selectedStatus = ref("all");
const selectedType = ref("all");

const statusOptions = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Thành công", value: "success" },
  { label: "Đang xử lý", value: "pending" },
  { label: "Đã hủy", value: "rejected" },
];

const typeOptions = [
  { label: "Tất cả GD", value: "all" },
  { label: "Hoa hồng đơn", value: "commission" },
  { label: "HH Giới thiệu", value: "referral_commission" },
  { label: "Đổi S-Point", value: "point" },
  { label: "Rút tiền", value: "withdrawal" },
];

const clearFilters = () => {
  dateRange.value = null;
  selectedStatus.value = "all";
  selectedType.value = "all";
};

const columns = [
  { title: "Thời gian", dataIndex: "created_at", key: "created_at", width: 150 },
  { title: "Nội dung / Tham chiếu", dataIndex: "reference_id", key: "reference_id", width: 220 },
  { title: "Loại GD", dataIndex: "type", key: "type", align: "center", width: 150 },
  { title: "Số tiền", dataIndex: "amount", key: "amount", align: "right", width: 140 },
  { title: "Trạng thái", dataIndex: "status", key: "status", align: "center", width: 130 },
];

const currentPage = ref(1);
const limit = ref(10);

const queryParams = computed(() => {
  const params = {
    page: currentPage.value,
    limit: limit.value,
  };
  if (selectedStatus.value !== "all") params.status = selectedStatus.value;
  if (selectedType.value !== "all") params.type = selectedType.value;
  if (dateRange.value && dateRange.value.length === 2) {
    params.start_date = dateRange.value[0].format("YYYY-MM-DD");
    params.end_date = dateRange.value[1].format("YYYY-MM-DD");
  }
  return params;
});

const response = ref(null);
const pending = ref(false);

const refresh = async () => {
  if (!selectedUser.value) {
    response.value = null;
    return;
  }
  pending.value = true;
  try {
    const res = await axios.get(`/admin/history-transaction/${selectedUser.value.id}`, {
      params: queryParams.value,
    });
    response.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    pending.value = false;
  }
};

watch([queryParams, selectedUser], refresh, { deep: true, immediate: true });

const transactions = computed(() => {
  const res = response.value;
  if (!res) return [];
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
});

const totalPages = computed(() => {
  const res = response.value;
  if (!res) return 1;
  if (res.last_page !== undefined) return res.last_page;
  if (res.data?.totalPages !== undefined) return res.data.totalPages;
  const total = res.total !== undefined ? res.total : res.data?.total || 0;
  return Math.ceil(total / limit.value) || 1;
});

watch([selectedStatus, selectedType, dateRange, limit], () => {
  currentPage.value = 1;
});

const getStatusColor = (s) => {
  if (s === "success" || s === "completed") return "success";
  if (s === "pending") return "warning";
  return "error";
};

const getStatusLabel = (s) => {
  if (s === "success" || s === "completed") return "THÀNH CÔNG";
  if (s === "pending") return "ĐANG XỬ LÝ";
  return "ĐÃ HỦY";
};
</script>

<style scoped>
.admin-card {
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
.admin-stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
:deep(.ant-table-row:hover > td) {
  background: rgba(248, 250, 252, 0.8) !important;
}
</style>
