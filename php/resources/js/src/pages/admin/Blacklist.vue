<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          Danh Sách Ghim (Blacklist)
        </h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Người dùng bị Shopee ghim huỷ hoa hồng, phải sử dụng Affiliate ID khác.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <a-button
          type="primary"
          @click="showUserModal = true"
          class="font-semibold flex items-center gap-1.5"
        >
          <template #icon><PlusOutlined /></template>
          Thêm người dùng
        </a-button>
      </div>
    </div>

    <!-- Data Table -->
    <a-card :bordered="false" class="admin-card" :body-style="{ padding: 0 }">
      <!-- Toolbar -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="text-xs font-semibold text-slate-500">
          Danh sách người dùng bị ghim hoa hồng
        </div>
        <div class="flex items-center gap-3 self-start sm:self-auto">
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
          <a-button
            type="primary"
            ghost
            @click="refresh"
            :loading="pending"
            class="font-medium px-4 flex items-center gap-1.5"
          >
            <template #icon><ReloadOutlined /></template>
            Làm mới
          </a-button>
        </div>
      </div>

      <!-- Table -->
      <a-table
        :columns="columns"
        :data-source="blacklistUsers"
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
                  <a-tag v-if="isNewUser(record.created_at)" color="green" style="font-size:8px;padding:0 4px;line-height:16px">Mới</a-tag>
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

          <!-- Blacklisted Date -->
          <template v-else-if="column.key === 'blacklisted_at'">
            <div class="text-right">
              <span class="text-xs text-slate-400 dark:text-slate-500 font-medium">
                {{ formatDate(record.blacklisted_at || record.created_at) }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-else-if="column.key === 'action'">
            <div class="flex items-center justify-center" @click.stop>
              <a-popconfirm
                title="Bạn có chắc chắn muốn xoá người dùng này khỏi Blacklist?"
                ok-text="Xoá"
                cancel-text="Huỷ"
                ok-type="danger"
                @confirm="removeFromBlacklist(record.id)"
              >
                <a-button type="text" danger size="small" class="flex items-center gap-1">
                  <template #icon><DeleteOutlined /></template>
                  Xoá
                </a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>

      <!-- Pagination -->
      <div
        class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3"
      >
        <span class="text-xs text-slate-500 font-medium"
          >Tổng {{ blacklistUsers.length }} người dùng trên trang này</span
        >
        <a-pagination
          v-if="totalPages > 1"
          :current="currentPage"
          :total="totalPages * limit"
          :page-size="limit"
          show-less-items
          @change="(page) => (currentPage = page)"
        />
      </div>
    </a-card>

    <!-- User Details Drawer -->
    <a-drawer
      v-model:open="isDrawerOpen"
      title="Hồ sơ người dùng bị ghim"
      placement="right"
      width="400px"
    >
      <div v-if="selectedUser" class="flex flex-col gap-6">
        <p class="text-[11px] text-slate-500 font-medium select-all -mt-4 mb-0">UID: {{ selectedUser.user_id || selectedUser.id }}</p>

        <!-- Avatar + Name -->
        <div class="flex flex-col items-center text-center gap-3">
          <div class="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img v-if="selectedUser.image" :src="selectedUser.image" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
            <span v-else class="text-slate-500 font-bold text-2xl uppercase">{{ selectedUser.name?.charAt(0) || 'U' }}</span>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ selectedUser.name || 'User' }}</h3>
            <p class="text-sm text-slate-500 select-all">{{ selectedUser.email }}</p>
            <a-tag color="red" class="mt-2">Đang bị ghim Blacklist</a-tag>
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
          <a-descriptions-item label="Thời gian ghim">
            <span class="font-bold text-xs">{{ formatDate(selectedUser.blacklisted_at || selectedUser.created_at) }}</span>
          </a-descriptions-item>
          <a-descriptions-item label="Ngày đăng ký">
            <span class="font-bold text-xs">{{ formatDate(selectedUser.created_at) }}</span>
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <template #footer>
        <div class="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Vai trò: <span class="font-bold uppercase">{{ selectedUser?.role === 'admin' ? 'ADMIN' : 'MEMBER' }}</span></span>
        </div>
      </template>
    </a-drawer>

    <!-- User Selection Modal for Adding -->
    <a-modal
      v-model:open="showUserModal"
      title="Thêm người dùng vào Blacklist"
      :footer="null"
    >
      <a-input-search
        v-model:value="userSearchQuery"
        placeholder="Tìm kiếm theo tên hoặc email..."
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
            @click="addToBlacklist(u)"
            :disabled="isAdding"
            class="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  >{{ u.name || "N/A" }}</span
                >
                <span
                  class="text-[11px] font-medium text-slate-500 truncate mt-0.5"
                  >{{ u.email }}</span
                >
              </div>
            </div>
            <a-tag color="red">THÊM</a-tag>
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
              @click="changeUserPage(userPagination.page - 1)"
            >
              <template #icon><LeftOutlined /></template>
            </a-button>
            <a-button
              :disabled="userPagination.page === userPagination.totalPages"
              size="small"
              @click="changeUserPage(userPagination.page + 1)"
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
import { ref, computed, watch } from "vue";
import { useAdminUsers } from "@/composables/useAdminUsers";
import {
  PlusOutlined,
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import axios from "@/api/axios";

const currentPage = ref(1);
const limit = ref(20);
const selectedUser = ref(null);

const columns = [
  { title: "Thành viên", dataIndex: "name", key: "name", width: 260 },
  { title: "Vai trò", dataIndex: "role", key: "role", align: "center", width: 110 },
  { title: "Cấp bậc", dataIndex: "rank", key: "rank", align: "center", width: 140 },
  { title: "Thời gian ghim", dataIndex: "blacklisted_at", key: "blacklisted_at", align: "right", width: 140 },
  { title: "Thao tác", key: "action", align: "center", width: 100 },
];

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

const isNewUser = (dateStr) => {
  if (!dateStr) return false;
  const created = new Date(dateStr).getTime();
  const now = new Date().getTime();
  return (now - created) < 7 * 24 * 60 * 60 * 1000;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

const isDrawerOpen = computed({
  get: () => !!selectedUser.value,
  set: (val) => { if (!val) selectedUser.value = null; },
});

const openDetails = (record) => {
  selectedUser.value = record;
};

const queryParams = computed(() => ({
  page: currentPage.value,
  limit: limit.value,
  per_page: limit.value,
}));

const response = ref(null);
const pending = ref(false);

const refresh = async () => {
  pending.value = true;
  try {
    const res = await axios.get("/admin/blacklist-commission", { params: queryParams.value });
    response.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    pending.value = false;
  }
};

watch(queryParams, refresh, { immediate: true });

const totalPages = computed(() => {
  const res = response.value;
  if (!res) return 1;
  if (res.last_page !== undefined) return res.last_page;
  if (res.data?.totalPages !== undefined) return res.data.totalPages;
  const total = res.total !== undefined ? res.total : res.data?.total || 0;
  return Math.ceil(total / limit.value) || 1;
});

const blacklistUsers = computed(() => {
  const res = response.value;
  if (!res) return [];
  if (res.data && Array.isArray(res.data) && !Object.prototype.hasOwnProperty.call(res.data, "data"))
    return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
});

watch(limit, () => {
  currentPage.value = 1;
});

// User Search & Add Modal
const showUserModal = ref(false);
const userSearchQuery = ref("");
const isAdding = ref(false);

const {
  users: usersList,
  pagination: userPagination,
  isLoading: usersLoading,
  fetchUsers,
} = useAdminUsers();

const handleUserSearch = () => fetchUsers(1, userSearchQuery.value.trim(), 20);
const changeUserPage = (targetPage) => fetchUsers(targetPage, userSearchQuery.value.trim(), 20);

watch(showUserModal, (newVal) => {
  if (newVal && usersList.value.length === 0) fetchUsers(1, "", 20);
});

const addToBlacklist = async (u) => {
  if (isAdding.value) return;
  isAdding.value = true;
  try {
    const res = await axios.post("/admin/blacklist-commission", {
      user_id: u.id,
    });
    message.success(
      res?.data?.message || res?.message || "Đã thêm vào Blacklist!"
    );
    showUserModal.value = false;
    await refresh();
  } catch (err) {
    message.error(err?.response?.data?.message || err?.message || "Thêm thất bại!");
  } finally {
    isAdding.value = false;
  }
};

const removeFromBlacklist = async (id) => {
  try {
    const res = await axios.delete(`/admin/blacklist-commission/${id}`);
    message.success(
      res?.data?.message || res?.message || "Đã xoá khỏi Blacklist!"
    );
    await refresh();
  } catch (err) {
    message.error(err?.response?.data?.message || err?.message || "Xoá thất bại!");
  }
};
</script>

<style scoped>
.admin-card {
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
:deep(.ant-table-row:hover > td) {
  background: rgba(248, 250, 252, 0.8) !important;
}
</style>
