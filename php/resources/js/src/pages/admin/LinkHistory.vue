<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight">Lịch sử chuyển đổi Link</h2>
        <p class="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Lưu vết và đối soát lịch sử tạo link affiliate của người dùng.</p>
      </div>
    </div>

    <!-- Data Table -->
    <a-card :bordered="false" class="admin-card" :body-style="{ padding: 0 }">
      <!-- Filter Toolbar -->
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Filter by user -->
            <a-button
              @click="showUserModal = true"
              :type="selectedUserFilter ? 'primary' : 'default'"
              :ghost="!!selectedUserFilter"
              class="font-medium text-xs flex items-center justify-center gap-1.5"
            >
              <UserOutlined />
              <span class="max-w-[160px] truncate">{{ selectedUserFilter ? (selectedUserFilter.name || selectedUserFilter.email) : 'Tìm theo người dùng' }}</span>
              <CloseOutlined v-if="selectedUserFilter" class="hover:text-rose-500" @click.stop="clearUserFilter" />
            </a-button>

            <!-- Limit -->
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

            <!-- Sub ID -->
            <a-input-search
              v-model:value="subIdInput"
              placeholder="Tìm theo SubID..."
              enter-button
              @search="handleSubIdSearch"
              style="width: 250px"
              allow-clear
              class="font-medium"
            />

            <!-- Toggle Expand -->
            <a-button type="default" @click="toggleCollapse" class="font-medium text-xs flex items-center gap-1.5" :class="{ 'bg-slate-100 dark:bg-slate-800': activeKey.includes('1') }">
              <template #icon><FilterOutlined /></template>
              {{ activeKey.includes('1') ? 'Thu gọn' : 'Mở rộng' }}
            </a-button>

            <!-- Clear filters -->
            <a-button v-if="dateRange || selectedUserFilter || subIdFilter || selectedType !== 'all'" @click="clearAllFilters" type="text" danger class="flex items-center gap-1">
              <template #icon><DeleteOutlined /></template>
              Xóa bộ lọc
            </a-button>
          </div>

          <!-- Refresh Button at Right -->
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

        <!-- Expanded Filters using a-collapse -->
        <a-collapse v-model:activeKey="activeKey" ghost :bordered="false" class="admin-filter-collapse">
          <a-collapse-panel key="1" :show-arrow="false">
            <div class="flex flex-wrap items-center gap-3 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 border-dashed">
              <span class="text-xs font-semibold text-slate-500 uppercase">Nền tảng:</span>
              <a-select
                v-model:value="selectedType"
                :options="[
                  { label: 'Tất cả', value: 'all' },
                  { label: 'Shopee', value: AFFILIATE_TYPES.SHOPEE },
                  { label: 'TikTok', value: AFFILIATE_TYPES.TIKTOK },
                  { label: 'Lazada', value: AFFILIATE_TYPES.LAZADA },
                  { label: 'ShopeeFood', value: AFFILIATE_TYPES.SHOPEEFOOD },
                ]"
                style="width: 140px"
                size="small"
              />
              
              <div class="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>

              <span class="text-xs font-semibold text-slate-500 uppercase">Lọc theo ngày:</span>
              <a-range-picker v-model:value="dateRange" size="small" style="width: 250px" />
            </div>
          </a-collapse-panel>
        </a-collapse>
      </div>

      <!-- Table -->
      <a-table
        :columns="columns"
        :data-source="links"
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
          <template v-if="column.key === 'created_at'">
            <div class="text-xs text-slate-700 dark:text-slate-300 font-bold">{{ new Date(record.created_at).toLocaleDateString('vi-VN') }}</div>
            <div class="text-[10px] text-slate-400 font-medium">{{ new Date(record.created_at).toLocaleTimeString('vi-VN') }}</div>
          </template>

          <template v-else-if="column.key === 'user'">
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden">
                <img v-if="record.user?.image" :src="record.user.image" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                <span v-else class="text-xs font-bold text-slate-500 uppercase">{{ record.user?.name?.charAt(0) || 'U' }}</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[140px]">{{ record.user?.name || 'Ẩn danh' }}</span>
                <span class="text-[11px] text-slate-500 font-medium mt-0.5 truncate max-w-[140px]">{{ record.user?.email || record.user_id }}</span>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'platform'">
            <div class="flex items-center justify-center">
              <a-tag :color="getPlatformInfo(record.type).color">
                {{ getPlatformInfo(record.type).label }}
              </a-tag>
            </div>
          </template>

          <template v-else-if="column.key === 'product'">
            <div class="max-w-[280px]">
              <div class="bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800 px-2 py-1.5 rounded-md text-[11px] font-mono text-emerald-600 dark:text-emerald-400 truncate">
                {{ formatMiniJson(record.product_info) }}
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'affiliate_link'">
            <div class="text-[13px] text-slate-700 dark:text-slate-300">
              <span v-if="record.affiliate_link">
                {{ record.affiliate_link.length > 30 ? record.affiliate_link.slice(0, 30) + '...' : record.affiliate_link }}
              </span>
              <span v-else class="text-slate-400 italic">Không có</span>
            </div>
          </template>

          <template v-else-if="column.key === 'details'">
            <RightOutlined class="text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
          </template>
        </template>
      </a-table>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-slate-500 font-medium">Trang {{ page }} / {{ totalPages }}</span>
        <a-pagination
          v-if="totalPages > 1"
          :current="page"
          :total="totalPages * limit"
          :page-size="limit"
          show-less-items
          @change="(p) => page = p"
        />
      </div>
    </a-card>

    <!-- Detail Drawer -->
    <a-drawer v-model:open="isDrawerOpen" placement="right" width="450px" :closable="false">
      <template #title>
        <div v-if="selectedItem">
          <a-tag :color="getPlatformInfo(selectedItem.type).color" class="mb-2">
            {{ getPlatformInfo(selectedItem.type).label }} Link
          </a-tag>
          <h3 class="text-base font-bold text-slate-800 dark:text-slate-100">Thông tin sản phẩm</h3>
          <p class="text-xs text-slate-500 mt-1 font-medium">Lưu lúc: {{ new Date(selectedItem.created_at).toLocaleString('vi-VN') }}</p>
        </div>
      </template>
      <template #extra>
        <a-button type="text" @click="closeDetails"><CloseOutlined /></a-button>
      </template>

      <div v-if="selectedItem" class="flex flex-col gap-4">
        <!-- Sub ID -->
        <div v-if="selectedItem.sub_id" class="bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col gap-2">
          <div class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Sub ID</span>
            <a-button @click="copyText(selectedItem.sub_id)" type="text" size="small" class="font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <template #icon><CopyOutlined /></template>
              Copy
            </a-button>
          </div>
          <div class="text-[13px] font-mono text-slate-800 dark:text-slate-200 break-all bg-white dark:bg-[#161B22] p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
            {{ selectedItem.sub_id }}
          </div>
        </div>

        <!-- JSON viewer -->
        <div class="bg-[#0D1117] rounded-xl overflow-hidden border border-slate-700">
          <div class="flex items-center justify-between px-4 py-2 bg-[#161B22] border-b border-slate-700">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">JSON Response</span>
            <a-button @click="copyJson(selectedItem.product_info)" type="text" size="small" class="font-semibold text-slate-400 hover:text-white">
              <template #icon><CopyOutlined /></template>
              Copy
            </a-button>
          </div>
          <div class="p-4 overflow-x-auto">
            <pre class="text-[13px] leading-relaxed text-emerald-400 font-mono">{{ formatJson(selectedItem.product_info) }}</pre>
          </div>
        </div>
      </div>
    </a-drawer>

    <!-- User Selection Modal -->
    <a-modal v-model:open="showUserModal" title="Tìm kiếm thành viên" :footer="null">
      <a-input-search
        v-model:value="userSearchQuery"
        placeholder="Tìm kiếm thành viên..."
        enter-button="Tìm"
        @search="handleUserSearch"
        class="mb-4"
      />
      <div class="min-h-[150px] max-h-[400px] overflow-y-auto">
        <div v-if="usersLoading" class="flex flex-col items-center justify-center py-8 gap-3">
          <a-spin /><span class="text-xs font-semibold text-slate-400">Đang tải...</span>
        </div>
        <a-empty v-else-if="usersList.length === 0" description="Không tìm thấy người dùng" />
        <div v-else class="flex flex-col gap-1">
          <button
            v-for="u in usersList"
            :key="u.id"
            @click="applyUserFilter(u)"
            class="w-full flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
            type="button"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 border border-indigo-100 overflow-hidden">
                <img v-if="u.image" :src="u.image" class="h-full w-full object-cover" />
                <span v-else class="text-sm font-bold text-indigo-600 uppercase">{{ u.name?.charAt(0) || 'U' }}</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{{ u.name || 'Người dùng Saffi' }}</span>
                <span class="text-[11px] font-medium text-slate-500 truncate mt-0.5">{{ u.email }}</span>
              </div>
            </div>
            <a-tag color="green">CHỌN</a-tag>
          </button>
        </div>

        <div v-if="userPagination.totalPages > 1" class="flex justify-between items-center mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <span class="text-[11px] font-bold text-slate-400 uppercase">Trang {{ userPagination.page }} / {{ userPagination.totalPages }}</span>
          <a-pagination :current="userPagination.page" :total="userPagination.totalPages * 20" :page-size="20" show-less-items size="small" @change="changeUserPage" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { SyncOutlined, CloseOutlined, DeleteOutlined, UserOutlined, RightOutlined, CopyOutlined, TeamOutlined, SearchOutlined, FilterOutlined, ReloadOutlined } from "@ant-design/icons-vue";
import axios from "@/api/axios";
import { useAdminUsers } from "@/composables/useAdminUsers";
import { AFFILIATE_TYPES } from "@/utils/constants";

const getPlatformInfo = (type) => {
  const t = Number(type);
  if (t === AFFILIATE_TYPES.SHOPEE) return { label: 'Shopee', color: 'orange' };
  if (t === AFFILIATE_TYPES.TIKTOK) return { label: 'TikTok', color: 'default' };
  if (t === AFFILIATE_TYPES.LAZADA) return { label: 'Lazada', color: 'blue' };
  if (t === AFFILIATE_TYPES.SHOPEEFOOD) return { label: 'ShopeeFood', color: 'red' };
  return { label: 'Khác', color: 'purple' };
};

const columns = [
  { title: 'Thời Gian', dataIndex: 'created_at', key: 'created_at', width: 150 },
  { title: 'Tạo Bởi', dataIndex: 'user', key: 'user', width: 220 },
  { title: 'Nền Tảng', dataIndex: 'platform', key: 'platform', align: 'center', width: 120 },
  { title: 'Affiliate Link', dataIndex: 'affiliate_link', key: 'affiliate_link', width: 220 },
  { title: 'Sản Phẩm', dataIndex: 'product', key: 'product', width: 300 },
  { title: '', key: 'details', align: 'center', width: 50 },
];

const activeKey = ref([]);
const toggleCollapse = () => {
  if (activeKey.value.includes("1")) {
    activeKey.value = [];
  } else {
    activeKey.value = ["1"];
  }
};

const page = ref(1);
const limit = ref(20);
const dateRange = ref(null);
const selectedUserFilter = ref(null);
const subIdFilter = ref("");
const subIdInput = ref("");
const selectedType = ref("all");

const queryParams = computed(() => {
  const params = { page: page.value, limit: limit.value };
  if (dateRange.value && dateRange.value.length === 2) {
    params.startDate = dateRange.value[0].format("YYYY-MM-DD");
    params.endDate = dateRange.value[1].format("YYYY-MM-DD");
  }
  if (selectedUserFilter.value) params.userId = selectedUserFilter.value.id;
  if (subIdFilter.value) params.subId = subIdFilter.value.trim();
  if (selectedType.value !== "all") params.type = selectedType.value;
  return params;
});

const response = ref(null);
const pending = ref(false);

const refresh = async () => {
  pending.value = true;
  try {
    const res = await axios.get("/admin/link-history", { params: queryParams.value });
    response.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    pending.value = false;
  }
};

watch(queryParams, refresh, { deep: true, immediate: true });

const links = computed(() => {
  const res = response.value?.data || response.value;
  if (!res) return [];
  if (res.data) return res.data;
  if (Array.isArray(res)) return res;
  return [];
});

const totalPages = computed(() => {
  const res = response.value;
  if (!res) return 1;
  if (res.last_page !== undefined) return res.last_page;
  if (res.data?.totalPages !== undefined) return res.data.totalPages;
  if (res.data?.meta?.total !== undefined) return Math.ceil(res.data.meta.total / limit.value);
  
  const total = res.total !== undefined ? res.total : res.data?.total || 0;
  return Math.ceil(total / limit.value) || 1;
});

watch([limit, dateRange, selectedUserFilter, subIdFilter, selectedType], () => { page.value = 1; });

const selectedItem = ref(null);
const isDrawerOpen = computed({
  get: () => !!selectedItem.value,
  set: (val) => { if (!val) selectedItem.value = null; },
});
const openDetails = (item) => { selectedItem.value = item; };
const closeDetails = () => { selectedItem.value = null; };

const formatJson = (obj) => {
  if (!obj) return "{}";
  try { return JSON.stringify(obj, null, 2); } catch (e) { return String(obj); }
};

const copyJson = (obj) => {
  if (!obj) return;
  navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
    .then(() => alert("Đã copy JSON!"))
    .catch(err => console.error(err));
};

const copyText = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => alert("Đã copy!"))
    .catch(err => console.error(err));
};

const formatMiniJson = (obj) => {
  if (!obj) return "{}";
  let name = obj.productName || obj.title || obj.name || "Unknown Product";
  if (name.length > 50) name = name.slice(0, 50) + "...";
  return `{ "productName": "${name}" }`;
};

const showUserModal = ref(false);
const userSearchQuery = ref("");
const { users: usersList, pagination: userPagination, isLoading: usersLoading, fetchUsers } = useAdminUsers();

const changeUserPage = (targetPage) => fetchUsers(targetPage, userSearchQuery.value.trim(), 20);
const handleUserSearch = () => fetchUsers(1, userSearchQuery.value.trim(), 20);
const clearUserFilter = () => { selectedUserFilter.value = null; };
const clearAllFilters = () => { dateRange.value = null; selectedUserFilter.value = null; subIdFilter.value = ""; subIdInput.value = ""; selectedType.value = "all"; };
const handleSubIdSearch = (value) => { subIdFilter.value = value; };
const applyUserFilter = (user) => { selectedUserFilter.value = user; showUserModal.value = false; };

watch(showUserModal, (newVal) => {
  if (newVal && usersList.value.length === 0) fetchUsers(1, "", 20);
});
</script>

<style scoped>
.admin-card { border-radius: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
:deep(.ant-table-row:hover > td) { background: rgba(248,250,252,0.8) !important; }

/* Hide collapse header and remove padding for custom toggle */
:deep(.admin-filter-collapse > .ant-collapse-item > .ant-collapse-header) { display: none !important; }
:deep(.admin-filter-collapse > .ant-collapse-item > .ant-collapse-content > .ant-collapse-content-box) { padding: 0 !important; }
</style>
