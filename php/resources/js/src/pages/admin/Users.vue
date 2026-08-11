<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Quản lý Thành Viên</h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Danh sách thành viên đăng ký sử dụng nền tảng Saffi.</p>
      </div>
    </div>

    <!-- Error -->
    <a-alert v-if="error" type="error" show-icon :message="error" />

    <!-- Table -->
    <a-card :bordered="false" class="admin-card" :body-style="{ padding: 0 }">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <a-select
            v-model:value="selectedRank"
            :options="[
              { label: 'Tất cả cấp bậc', value: 'all' },
              { label: 'Hạng Bạc', value: 'silver' },
              { label: 'Hạng Vàng', value: 'gold' },
              { label: 'Hạng Tinh hoa', value: 'obsidian' },
            ]"
            style="width: 150px"
            @change="handleRankChange"
          />
          <a-select
            v-model:value="selectedLimit"
            :options="[
              { label: '10 / trang', value: 10 },
              { label: '20 / trang', value: 20 },
              { label: '50 / trang', value: 50 },
              { label: '100 / trang', value: 100 },
            ]"
            style="width: 120px"
            @change="handleLimitChange"
          />
          <a-input-search
            v-model:value="searchQuery"
            placeholder="Tìm tên, email..."
            enter-button
            style="width: 240px"
            @search="handleSearch"
          />
        </div>

        <div class="flex items-center gap-3">
          <a-button
            type="primary"
            ghost
            @click="handleSearch"
            :loading="isLoading"
            class="font-medium px-4 flex items-center gap-1.5"
          >
            <template #icon><ReloadOutlined /></template>
            Làm mới
          </a-button>
        </div>
      </div>
      <a-table
        :columns="columns"
        :data-source="users"
        :row-key="(r) => r.id"
        :pagination="false"
        :loading="isLoading"
        :scroll="{ x: 'max-content' }"
        :custom-row="(record) => ({
          onClick: () => openDetails(record),
          class: 'cursor-pointer',
        })"
      >
        <template #bodyCell="{ column, record }">
          <!-- Member Info -->
          <template v-if="column.key === 'name'">
            <div class="flex items-center gap-3 py-1">
              <div class="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                <img v-if="record.image" :src="record.image" class="h-full w-full object-cover" referrerpolicy="no-referrer" loading="lazy" />
                <span v-else class="text-slate-500 font-bold text-xs uppercase">{{ record.name?.charAt(0) || 'U' }}</span>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-slate-800 dark:text-slate-200 text-xs">{{ record.name || 'User' }}</span>
                  <a-tag v-if="isNewUser(record.createdAt)" color="green" style="font-size:8px;padding:0 4px;line-height:16px">Mới</a-tag>
                </div>
                <span class="text-[10px] text-slate-400 block mt-0.5 truncate max-w-[200px] select-all">{{ record.email }}</span>
              </div>
            </div>
          </template>

          <!-- Role -->
          <template v-else-if="column.key === 'role'">
            <div class="flex items-center justify-center">
              <a-tag :color="record.role === 'admin' ? 'orange' : 'default'">
                {{ record.role === 'admin' ? 'Admin' : 'Member' }}
              </a-tag>
            </div>
          </template>

          <!-- Rank -->
          <template v-else-if="column.key === 'rank'">
            <div class="flex items-center justify-center gap-1.5">
              <img :src="getRankStyles(record.rank).image" class="h-4 w-4 object-contain" :alt="record.rank" />
              <a-tag :color="getRankTagColor(record.rank)">{{ getRankStyles(record.rank).name }}</a-tag>
            </div>
          </template>

          <!-- Balance -->
          <template v-else-if="column.key === 'availableBalance'">
            <div class="text-right">
              <span class="font-black text-emerald-600 dark:text-emerald-400 text-xs">{{ formatCurrency(record.availableBalance) }}</span>
            </div>
          </template>

          <!-- Completed Orders -->
          <template v-else-if="column.key === 'completedOrdersCount'">
            <div class="text-center">
              <span class="font-bold text-slate-700 dark:text-slate-300 text-xs">{{ record.completedOrdersCount }}</span>
            </div>
          </template>

          <!-- Join Date -->
          <template v-else-if="column.key === 'createdAt'">
            <div class="text-right">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ formatDate(record.createdAt) }}</span>
            </div>
          </template>
        </template>
      </a-table>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-4 py-3 flex justify-end border-t border-slate-100 dark:border-slate-800">
        <a-pagination
          :current="pagination.page"
          :total="pagination.total"
          :page-size="selectedLimit"
          show-less-items
          @change="changePage"
        />
      </div>
    </a-card>

    <!-- User Details Drawer -->
    <a-drawer
      v-model:open="isDrawerOpen"
      title="Hồ sơ người dùng"
      placement="right"
      width="400px"
    >
      <div v-if="selectedUser" class="flex flex-col gap-6">
        <p class="text-[11px] text-slate-500 font-medium select-all -mt-4 mb-0">UID: {{ selectedUser.id }}</p>

        <!-- Avatar + Name -->
        <div class="flex flex-col items-center text-center gap-3">
          <div class="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img v-if="selectedUser.image" :src="selectedUser.image" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
            <span v-else class="text-slate-500 font-bold text-2xl uppercase">{{ selectedUser.name?.charAt(0) || 'U' }}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ selectedUser.name || 'User' }}</h3>
            <p class="text-sm text-slate-500 select-all">{{ selectedUser.email }}</p>
            <a-tag v-if="isNewUser(selectedUser.createdAt)" color="green" class="mt-2">Người dùng mới</a-tag>
          </div>
        </div>

        <!-- Detail metrics -->
        <a-descriptions :column="1" bordered size="small">
          <a-descriptions-item label="Cấp bậc">
            <div class="flex items-center gap-1.5">
              <img :src="getRankStyles(selectedUser.rank).image" class="h-5 w-5 object-contain" />
              <span class="font-bold text-xs">{{ getRankStyles(selectedUser.rank).fullName }}</span>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="Số dư">
            <span class="font-bold text-emerald-600 dark:text-emerald-400">{{ formatCurrency(selectedUser.availableBalance) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Tham gia">
            <span class="font-bold text-xs">{{ formatDate(selectedUser.createdAt) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Đơn thành công">
            <span class="font-bold text-xs">{{ selectedUser.completedOrdersCount }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Thăng hạng">
            <span class="text-xs">
              {{ selectedUser.ordersToNextRank > 0 ? `Cần thêm ${selectedUser.ordersToNextRank} đơn` : 'Đã đạt cấp tối đa' }}
            </span>
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <template #footer>
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Vai trò: <span class="font-bold uppercase">{{ selectedUser?.role === 'admin' ? 'ADMIN' : 'MEMBER' }}</span></span>
        </div>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAdminUsers } from "@/composables/useAdminUsers";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { TeamOutlined, ReloadOutlined } from "@ant-design/icons-vue";

const columns = [
  { title: "Thành viên", dataIndex: "name", key: "name", width: 260 },
  { title: "Vai trò", dataIndex: "role", key: "role", align: "center", width: 110 },
  { title: "Cấp bậc", dataIndex: "rank", key: "rank", align: "center", width: 140 },
  { title: "Số dư", dataIndex: "availableBalance", key: "availableBalance", align: "right", width: 140 },
  { title: "Đơn hàng", dataIndex: "completedOrdersCount", key: "completedOrdersCount", align: "center", width: 110 },
  { title: "Tham gia", dataIndex: "createdAt", key: "createdAt", align: "right", width: 120 },
];

const authStore = useAuthStore();
const router = useRouter();

onMounted(() => {
  if (authStore.user?.role !== 'admin') router.replace("/");
});

const { users, pagination, isLoading, error, fetchUsers } = useAdminUsers();

const searchQuery = ref("");
const selectedUser = ref(null);
const selectedLimit = ref(10);
const selectedRank = ref("all");

const isDrawerOpen = computed({
  get: () => !!selectedUser.value,
  set: (val) => { if (!val) selectedUser.value = null; },
});

const handleLimitChange = () => fetchUsers(1, searchQuery.value.trim(), selectedLimit.value, selectedRank.value);
const handleRankChange = () => fetchUsers(1, searchQuery.value.trim(), selectedLimit.value, selectedRank.value);
const handleSearch = () => fetchUsers(1, searchQuery.value.trim(), selectedLimit.value, selectedRank.value);
const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return;
  fetchUsers(page, searchQuery.value.trim(), selectedLimit.value, selectedRank.value);
};
const openDetails = (user) => { selectedUser.value = user; };

const getRankTagColor = (rank) => {
  if (rank === 'obsidian') return 'default';
  if (rank === 'gold') return 'gold';
  return 'default';
};

const getRankStyles = (rank) => {
  if (rank === 'obsidian') return { name: 'TINH HOA', fullName: 'Thành viên Tinh Hoa', image: '/saffi_obsidian.webp' };
  if (rank === 'gold') return { name: 'VÀNG', fullName: 'Thành viên Vàng', image: '/saffi_gold.webp' };
  return { name: 'BẠC', fullName: 'Thành viên Bạc', image: '/saffi_silver.webp' };
};

const formatDate = (dateVal) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return '0đ';
  return val.toLocaleString('vi-VN') + 'đ';
};

const isNewUser = (createdAt) => {
  if (!createdAt) return false;
  const d = new Date(createdAt);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

onMounted(async () => {
  await fetchUsers(1, '', selectedLimit.value, selectedRank.value);
});
</script>

<style scoped>
.admin-card { border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
:deep(.ant-table-row:hover > td) { background: rgba(248,250,252,0.8) !important; }
</style>
