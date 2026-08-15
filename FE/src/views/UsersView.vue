<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { message } from "ant-design-vue";
import {
  CloseOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  WalletOutlined,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

interface AdminUser {
  id: string;
  name: string | null;
  image: string | null;
  available_balance: number;
  pending_balance: number;
  total_paid: number;
  completed_orders: number;
  created_at: string;
}

const windowWidth = ref(
  typeof window !== "undefined" ? window.innerWidth : 1024
);
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
const drawerWidth = computed(() =>
  windowWidth.value < 640 ? "100%" : "430px"
);

const users = ref<AdminUser[]>([]);
const selectedUser = ref<AdminUser | null>(null);
const loading = ref(false);
const page = ref(1);
const limit = ref(20);
const total = ref(0);
const searchInput = ref("");
const search = ref("");
const totalPages = computed(() =>
  Math.max(1, Math.ceil(total.value / limit.value))
);
const columns = [
  { title: "Người dùng", key: "user", width: 280 },
  { title: "Số dư khả dụng", key: "balance", align: "right", width: 160 },
  { title: "Đang chờ rút", key: "pending", align: "right", width: 150 },
  { title: "Đơn hoàn thành", key: "orders", align: "center", width: 140 },
  { title: "Ngày tham gia", key: "created", align: "right", width: 150 },
  { title: "", key: "action", width: 100, align: "center" },
];

const money = (value: number) =>
  `${new Intl.NumberFormat("vi-VN").format(Number(value) || 0)}đ`;
const date = (value?: string | null) => {
  if (!value) return "—";
  const str = String(value).trim();
  const match = str.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (match) {
    const [, y, m, d, hh, mm, ss] = match;
    const dateFormatted = `${d}/${m}/${y}`;
    const timeFormatted = hh ? (ss ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`) : "";
    return timeFormatted ? `${dateFormatted} ${timeFormatted}` : dateFormatted;
  }
  try {
    const dateObj = new Date(str);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString("vi-VN");
    }
  } catch {}
  return str;
};
const isNew = (value: string) => {
  if (!value) return false;
  try {
    let str = String(value).trim();
    if (str.includes(" ") && !str.includes("T")) str = str.replace(" ", "T");
    return Date.now() - new Date(str).getTime() <= 30 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await api.get<
      ApiResponse<{ users: AdminUser[]; total: number }>
    >("/api/admin/users/list", {
      params: {
        page: page.value,
        limit: limit.value,
        search: search.value || undefined,
      },
    });
    users.value = response.data.data?.users || [];
    total.value = response.data.data?.total || 0;
  } catch {
    message.error("Không thể tải danh sách người dùng.");
  } finally {
    loading.value = false;
  }
};

const applySearch = () => {
  search.value = searchInput.value.trim();
  page.value = 1;
  fetchUsers();
};
const clearSearch = () => {
  searchInput.value = "";
  search.value = "";
  page.value = 1;
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
watch(limit, () => {
  page.value = 1;
  fetchUsers();
});
watch(searchInput, (newVal) => {
  if (!newVal && search.value) {
    clearSearch();
  }
});
</script>

<template>
  <div class="flex flex-col gap-6 pb-12">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs"
    >
      <div class="space-y-1 text-left">
        <div
          class="flex items-center gap-2 text-slate-800 font-extrabold text-base sm:text-xl tracking-tight"
        >
          <TeamOutlined class="text-[#ee4d2d]" />
          <h2
            class="text-base sm:text-xl font-bold text-slate-800 tracking-tight"
          >
            Quản lý Người dùng
          </h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Danh sách người dùng đã tạo link Shopee qua Bot Zalo.
        </p>
      </div>
    </div>

    <a-card
      :bordered="false"
      :body-style="{ padding: 0 }"
      class="overflow-hidden !rounded-2xl"
    >
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-3 sm:p-4"
      >
        <div
          class="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto"
        >
          <a-select
            v-model:value="limit"
            :options="[
              { label: '10 / trang', value: 10 },
              { label: '20 / trang', value: 20 },
              { label: '50 / trang', value: 50 },
              { label: '100 / trang', value: 100 },
            ]"
            class="w-full sm:w-[120px]"
          />

          <!-- Unified Search Pill -->
          <div
            class="flex items-center rounded-xl border border-slate-200 bg-white p-1 focus-within:border-[#ee4d2d] focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-sm w-full sm:w-auto"
          >
            <SearchOutlined class="text-slate-400 ml-2.5 text-xs" />
            <input
              v-model="searchInput"
              placeholder="Tìm theo tên hoặc Zalo UID..."
              class="w-full sm:w-64 h-7 pl-2 pr-2 text-xs text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
              @keyup.enter="applySearch"
            />
            <button
              v-if="searchInput"
              type="button"
              class="text-slate-300 hover:text-slate-500 mr-3.5 text-xs cursor-pointer flex items-center justify-center p-0.5"
              @click="clearSearch"
            >
              <CloseOutlined class="text-[10px]" />
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center gap-1.5 h-7 px-3.5 rounded-lg bg-[#ee4d2d] hover:bg-[#d63d1e] active:bg-[#bd3617] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
              @click="applySearch"
            >
              <SearchOutlined class="text-[11px]" />
              <span>Tìm</span>
            </button>
          </div>

          <button
            v-if="search"
            type="button"
            class="btn-action-danger"
            @click="clearSearch"
          >
            <DeleteOutlined />
            <span>Xóa bộ lọc</span>
          </button>
        </div>

        <button
          type="button"
          class="btn-action-primary shrink-0 w-full sm:w-auto"
          :disabled="loading"
          @click="fetchUsers"
        >
          <ReloadOutlined />
          <span>Làm mới</span>
        </button>
      </div>

      <!-- ============================================== -->
      <!-- MOBILE CARD LIST (< md)                        -->
      <!-- ============================================== -->
      <div class="md:hidden p-3 space-y-3 bg-slate-50/50">
        <!-- Skeleton loading -->
        <div v-if="loading && !users.length" class="space-y-3">
          <div
            v-for="n in 3"
            :key="n"
            class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 animate-pulse"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-slate-100 shrink-0"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-slate-100 rounded-md w-1/3"></div>
                <div class="h-3 bg-slate-100 rounded-md w-1/4"></div>
              </div>
            </div>
            <div class="h-12 bg-slate-50 rounded-xl w-full"></div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-else-if="!users.length"
          class="p-8 text-center bg-white rounded-2xl border border-slate-100"
        >
          <p class="text-xs font-bold text-slate-400">
            Không tìm thấy người dùng nào
          </p>
        </div>

        <!-- Card Item -->
        <div
          v-else
          v-for="record in users"
          :key="record.id"
          @click="selectedUser = record"
          class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-3 cursor-pointer active:scale-[0.99] transition-all"
        >
          <!-- Top Row: User Avatar & Name -->
          <div
            class="flex items-center justify-between gap-3 pb-2 border-b border-slate-100/80"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div
                class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50"
              >
                <img
                  v-if="record.image"
                  :src="record.image"
                  referrerpolicy="no-referrer"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="flex h-full w-full items-center justify-center font-black text-[#ee4d2d]"
                >
                  {{ record.name?.charAt(0)?.toUpperCase() || "U" }}
                </div>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5">
                  <b class="truncate text-xs font-bold text-slate-800">{{
                    record.name || "Người dùng Zalo"
                  }}</b>
                </div>
                <div
                  class="mt-0.5 truncate font-mono text-[10px] text-slate-400"
                >
                  UID: {{ record.id }}
                </div>
              </div>
            </div>
            <button
              type="button"
              class="btn-action-primary !h-7 !px-3 text-[11px] !rounded-lg shrink-0"
              @click.stop="selectedUser = record"
            >
              <span>Chi tiết</span>
              <RightOutlined class="text-[10px]" />
            </button>
          </div>

          <!-- Middle Info Box: Balances & Stats -->
          <div
            class="bg-slate-50/80 rounded-xl p-2.5 grid grid-cols-2 gap-2 text-xs border border-slate-100"
          >
            <div>
              <span class="text-slate-400 text-[10px] block font-medium"
                >Số dư khả dụng</span
              >
              <span class="font-extrabold text-emerald-600 text-xs">{{
                money(record.available_balance)
              }}</span>
            </div>
            <div>
              <span class="text-slate-400 text-[10px] block font-medium"
                >Đang chờ rút</span
              >
              <span class="font-extrabold text-amber-600 text-xs">{{
                money(record.pending_balance)
              }}</span>
            </div>
            <div class="pt-1.5 border-t border-slate-200/60">
              <span class="text-slate-400 text-[10px] block font-medium"
                >Đơn hoàn thành</span
              >
              <span class="font-bold text-slate-800 text-xs"
                >{{ record.completed_orders }} đơn</span
              >
            </div>
            <div class="pt-1.5 border-t border-slate-200/60">
              <span class="text-slate-400 text-[10px] block font-medium"
                >Ngày tham gia</span
              >
              <span class="font-semibold text-slate-700 text-xs">{{
                date(record.created_at)
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- DESKTOP TABLE VIEW (>= md)                     -->
      <!-- ============================================== -->
      <div class="hidden md:block">
        <a-table
          :columns="columns"
          :data-source="users"
          row-key="id"
          :loading="loading"
          :pagination="false"
          :scroll="{ x: 1000 }"
          :custom-row="(record: AdminUser) => ({onClick:()=>selectedUser=record,class:'cursor-pointer'})"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'user'">
              <div class="flex items-center gap-3 py-1">
                <div
                  class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50"
                >
                  <img
                    v-if="record.image"
                    :src="record.image"
                    referrerpolicy="no-referrer"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center font-black text-[#ee4d2d]"
                  >
                    {{ record.name?.charAt(0)?.toUpperCase() || "U" }}
                  </div>
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <b class="truncate text-xs text-slate-800">{{
                      record.name || "Người dùng Zalo"
                    }}</b
                    ><a-tag
                      v-if="isNew(record.created_at)"
                      color="green"
                      class="!m-0 !text-[9px]"
                      >Mới</a-tag
                    >
                  </div>
                  <div
                    class="mt-1 max-w-[210px] truncate font-mono text-[10px] text-slate-400"
                  >
                    UID: {{ record.id }}
                  </div>
                </div>
              </div>
            </template>
            <template v-else-if="column.key === 'balance'"
              ><b class="text-xs text-emerald-600">{{
                money(record.available_balance)
              }}</b></template
            >
            <template v-else-if="column.key === 'pending'"
              ><span class="text-xs font-semibold text-amber-600">{{
                money(record.pending_balance)
              }}</span></template
            >
            <template v-else-if="column.key === 'orders'"
              ><b class="text-xs text-slate-700">{{
                record.completed_orders
              }}</b></template
            >
            <template v-else-if="column.key === 'created'"
              ><span class="text-xs text-slate-500">{{
                date(record.created_at)
              }}</span></template
            >
            <template v-else-if="column.key === 'action'">
              <button
                type="button"
                class="btn-action-primary !h-7 !px-2.5 text-[11px] whitespace-nowrap shrink-0"
                @click.stop="selectedUser = record"
              >
                <span>Chi tiết</span>
                <RightOutlined class="text-[10px]" />
              </button>
            </template>
          </template>
        </a-table>
      </div>

      <div
        class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row"
      >
        <span class="text-xs text-slate-500 text-center sm:text-left"
          >Hiển thị {{ users.length }} / Tổng {{ total }} người dùng</span
        ><a-pagination
          v-if="totalPages > 1"
          :current="page"
          :total="total"
          :page-size="limit"
          show-less-items
          @change="(value:number)=>{page=value;fetchUsers()}"
        />
      </div>
    </a-card>

    <a-drawer
      :open="!!selectedUser"
      title="Hồ sơ người dùng"
      :width="drawerWidth"
      @close="selectedUser = null"
      :root-style="{ maxWidth: '100vw' }"
      :body-style="{ padding: windowWidth < 640 ? '16px 12px' : '20px' }"
    >
      <div v-if="selectedUser" class="flex flex-col gap-5">
        <div class="flex flex-col items-center text-center">
          <div
            class="h-24 w-24 overflow-hidden rounded-full border-4 border-orange-50 bg-orange-50 shadow-sm"
          >
            <img
              v-if="selectedUser.image"
              :src="selectedUser.image"
              referrerpolicy="no-referrer"
              class="h-full w-full object-cover"
            />
            <div
              v-else
              class="flex h-full w-full items-center justify-center text-3xl font-black text-[#ee4d2d]"
            >
              <UserOutlined />
            </div>
          </div>
          <h3 class="mb-0 mt-3 text-lg font-black text-slate-800">
            {{ selectedUser.name || "Người dùng Zalo" }}
          </h3>
          <p class="mt-1 font-mono text-[11px] text-slate-400">
            UID: {{ selectedUser.id }}
          </p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="item in [
              { l: 'Số dư khả dụng', v: money(selectedUser.available_balance) },
              { l: 'Đang chờ rút', v: money(selectedUser.pending_balance) },
              { l: 'Tổng đã rút', v: money(selectedUser.total_paid) },
              { l: 'Đơn hoàn thành', v: String(selectedUser.completed_orders) },
            ]"
            :key="item.l"
            class="rounded-xl border border-slate-200 p-4"
          >
            <WalletOutlined class="mb-2 !text-[#ee4d2d]" />
            <div class="text-[10px] font-bold uppercase text-slate-400">
              {{ item.l }}
            </div>
            <div class="mt-1 text-sm font-black text-slate-800">
              {{ item.v }}
            </div>
          </div>
        </div>
        <div class="rounded-xl border border-slate-200 p-4">
          <div class="text-[10px] font-bold uppercase text-slate-400">
            Ngày tham gia
          </div>
          <div class="mt-1 text-sm font-bold text-slate-700">
            {{ date(selectedUser.created_at) }}
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<style scoped>
</style>
