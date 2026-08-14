<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { message } from "ant-design-vue";
import {
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  BankOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";
type User = { id: string; name: string | null; image: string | null };
type Tx = {
  id: number;
  amount: number;
  type: string;
  status: string;
  reference_id: string | null;
  description: string | null;
  created_at: string;
  user: User | null;
};
const users = ref<User[]>([]),
  userId = ref(""),
  rows = ref<Tx[]>([]),
  loading = ref(false),
  page = ref(1),
  limit = ref(20),
  total = ref(0);
const type = ref(""),
  status = ref("");
const showUserModal = ref(false),
  userSearch = ref(""),
  loadingUsers = ref(false);
const overview = ref<{
  available_balance: number;
  pending_balance: number;
  total_paid: number;
  completed_orders: number;
} | null>(null);
const money = (v: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.abs(v || 0)) + "đ";
const statusMap: Record<string, string> = {
  pending: "Chờ xử lý",
  success: "Thành công",
  rejected: "Từ chối",
};
const fetchUsers = async () => {
  loadingUsers.value = true;
  try {
    const r = await api.get<ApiResponse<{ users: User[] }>>(
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
const fetchData = async () => {
  loading.value = true;
  try {
    const params: Record<string, string | number> = {
      page: page.value,
      limit: limit.value,
    };
    if (userId.value) params.userId = userId.value;
    if (type.value) params.type = type.value;
    if (status.value) params.status = status.value;
    const [list, info] = await Promise.all([
      api.get<ApiResponse<{ transactions: Tx[]; total: number }>>(
        "/api/admin/transactions",
        { params }
      ),
      userId.value
        ? api.get<ApiResponse<typeof overview.value>>(
            `/api/admin/transactions/overview/${userId.value}`
          )
        : Promise.resolve(null),
    ]);
    rows.value = list.data.data?.transactions || [];
    total.value = list.data.data?.total || 0;
    overview.value = info?.data.data || null;
  } catch {
    message.error("Không thể tải lịch sử giao dịch.");
  } finally {
    loading.value = false;
  }
};
onMounted(() => undefined);
watch([userId, type, status, limit], () => {
  if (!userId.value) return;
  page.value = 1;
  fetchData();
});
const columns = [
  { title: "Thời gian", key: "time", width: 155 },
  { title: "Mã / Nội dung", key: "content", width: 300 },
  { title: "Loại giao dịch", key: "type", width: 150 },
  { title: "Số tiền", key: "amount", width: 150 },
  { title: "Trạng thái", key: "status", width: 130 },
];
const selectedUser = computed(() =>
  users.value.find((x) => x.id === userId.value)
);
const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase();
  return keyword
    ? users.value.filter(
        (user) =>
          (user.name || "").toLowerCase().includes(keyword) ||
          user.id.toLowerCase().includes(keyword)
      )
    : users.value;
});
const selectUser = (user: User) => {
  userId.value = user.id;
  showUserModal.value = false;
  userSearch.value = "";
};
const openUserModal = async () => {
  showUserModal.value = true;
  userSearch.value = "";
  await fetchUsers();
};
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
          <HistoryOutlined class="text-[#ee4d2d]" />
          <h2 class="text-base sm:text-xl font-bold text-slate-800 tracking-tight">Lịch sử giao dịch</h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Theo dõi giao dịch hoa hồng và rút tiền của người dùng.
        </p>
      </div>
    </div>
    <a-card :bordered="false" class="!rounded-2xl"
      ><div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div class="text-[11px] font-bold uppercase text-slate-500">
            Người dùng
          </div>
          <div v-if="selectedUser" class="mt-2 flex items-center gap-3">
            <div
              class="h-10 w-10 overflow-hidden rounded-full border border-orange-100 bg-orange-50"
            >
              <img
                v-if="selectedUser.image"
                :src="selectedUser.image"
                referrerpolicy="no-referrer"
                class="h-full w-full object-cover"
              />
              <div
                v-else
                class="flex h-full w-full items-center justify-center font-black text-[#ee4d2d]"
              >
                {{ selectedUser.name?.charAt(0)?.toUpperCase() || "U" }}
              </div>
            </div>
            <div>
              <b class="text-sm text-slate-800">{{
                selectedUser.name || "Người dùng Zalo"
              }}</b>
              <div class="mt-0.5 font-mono text-[10px] text-slate-400">
                UID: {{ selectedUser.id }}
              </div>
            </div>
          </div>
          <div v-else class="mt-2 text-xs font-semibold text-slate-500">
            Vui lòng chọn người dùng để xem lịch sử giao dịch
          </div>
        </div>
        <button
          type="button"
          class="btn-action-primary !h-9 !px-4 text-xs font-bold"
          @click="openUserModal"
        >
          <UserOutlined /><span>Chọn người dùng</span>
        </button>
      </div></a-card
    >
    <template v-if="userId">
      <!-- Top Stats Cards -->
      <div
        class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        <!-- Card 1: Số dư khả dụng -->
        <div
          class="rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-4 sm:p-5 border border-emerald-100/90 shadow-2xs relative overflow-hidden space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-emerald-600/90 uppercase tracking-wider"
              >Số dư khả dụng</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0"
            >
              <WalletOutlined class="text-base" />
            </div>
          </div>
          <a-skeleton-button v-if="loading && !overview" active block />
          <div v-else class="text-2xl font-black text-emerald-600 tracking-tight">
            {{ money(overview?.available_balance || 0) }}
          </div>
        </div>

        <!-- Card 2: Đang chờ rút -->
        <div
          class="rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-4 sm:p-5 border border-amber-100/90 shadow-2xs relative overflow-hidden space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-amber-600/90 uppercase tracking-wider"
              >Đang chờ rút</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0"
            >
              <ClockCircleOutlined class="text-base" />
            </div>
          </div>
          <a-skeleton-button v-if="loading && !overview" active block />
          <div v-else class="text-2xl font-black text-amber-600 tracking-tight">
            {{ money(overview?.pending_balance || 0) }}
          </div>
        </div>

        <!-- Card 3: Đã rút -->
        <div
          class="rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 p-4 sm:p-5 border border-blue-100/90 shadow-2xs relative overflow-hidden space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-blue-600/90 uppercase tracking-wider"
              >Đã rút</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0"
            >
              <BankOutlined class="text-base" />
            </div>
          </div>
          <a-skeleton-button v-if="loading && !overview" active block />
          <div v-else class="text-2xl font-black text-blue-600 tracking-tight">
            {{ money(overview?.total_paid || 0) }}
          </div>
        </div>

        <!-- Card 4: Đơn hoàn thành -->
        <div
          class="rounded-2xl bg-gradient-to-br from-purple-50/90 via-white to-purple-50/40 p-4 sm:p-5 border border-purple-100/90 shadow-2xs relative overflow-hidden space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-extrabold text-purple-600/90 uppercase tracking-wider"
              >Đơn hoàn thành</span
            >
            <div
              class="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs shrink-0"
            >
              <CheckCircleOutlined class="text-base" />
            </div>
          </div>
          <a-skeleton-button v-if="loading && !overview" active block />
          <div v-else class="text-2xl font-black text-purple-600 tracking-tight">
            {{ overview?.completed_orders || 0 }} đơn
          </div>
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
            class="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto"
          >
            <a-select
              v-model:value="type"
              class="w-full sm:w-40"
              :options="[
                { label: 'Tất cả loại', value: '' },
                { label: 'Hoa hồng', value: 'commission' },
                { label: 'Rút tiền', value: 'withdrawal' },
              ]"
            />
            <a-select
              v-model:value="status"
              class="w-full sm:w-40"
              :options="[
                { label: 'Tất cả trạng thái', value: '' },
                { label: 'Chờ xử lý', value: 'pending' },
                { label: 'Thành công', value: 'success' },
                { label: 'Từ chối', value: 'rejected' },
              ]"
            />
          </div>
        </div>

        <!-- ============================================== -->
        <!-- MOBILE CARD LIST (< md)                        -->
        <!-- ============================================== -->
        <div class="md:hidden p-3 space-y-3 bg-slate-50/50">
          <!-- Skeleton loading -->
          <div v-if="loading && !rows.length" class="space-y-3">
            <div
              v-for="n in 3"
              :key="n"
              class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3 animate-pulse"
            >
              <div class="flex items-center justify-between">
                <div class="h-4 bg-slate-100 rounded-md w-1/3"></div>
                <div class="h-4 bg-slate-100 rounded-md w-1/4"></div>
              </div>
              <div class="h-10 bg-slate-50 rounded-xl w-full"></div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-else-if="!rows.length"
            class="p-8 text-center bg-white rounded-2xl border border-slate-100"
          >
            <p class="text-xs font-bold text-slate-400">Không tìm thấy giao dịch nào</p>
          </div>

          <!-- Card Item -->
          <div
            v-else
            v-for="record in rows"
            :key="record.id"
            class="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3.5 space-y-2.5"
          >
            <!-- Top Bar: Ref ID (Left) & Type Badge (Right) -->
            <div class="flex items-center justify-between pb-2 border-b border-slate-100/80">
              <span class="text-xs font-mono font-bold text-slate-800 truncate">
                {{ record.reference_id || "#" + record.id }}
              </span>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold shrink-0',
                  record.type === 'commission'
                    ? 'bg-orange-50 text-[#ee4d2d] border border-orange-200/80'
                    : 'bg-blue-50 text-blue-600 border border-blue-200/80',
                ]"
              >
                {{ record.type === "commission" ? "Hoa hồng" : "Rút tiền" }}
              </span>
            </div>

            <!-- Middle Box: Description & Amount -->
            <div class="flex items-center justify-between gap-3">
              <div class="text-xs text-slate-500 line-clamp-2 leading-relaxed min-w-0 flex-1">
                {{ record.description || "Không có mô tả" }}
              </div>
              <div class="text-right shrink-0">
                <span
                  :class="[
                    'text-base font-black tracking-tight',
                    record.amount >= 0 ? 'text-emerald-600' : 'text-rose-600',
                  ]"
                >
                  {{ record.amount >= 0 ? "+" : "-" }}{{ money(record.amount) }}
                </span>
              </div>
            </div>

            <!-- Bottom Row: Date & Status -->
            <div class="flex items-center justify-between pt-1.5 border-t border-slate-100/80 text-[11px]">
              <span class="text-slate-400 font-medium">
                {{ new Date(record.created_at).toLocaleDateString("vi-VN") }} {{ new Date(record.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) }}
              </span>
              <span
                :class="[
                  'font-bold',
                  record.status === 'pending'
                    ? 'text-amber-600'
                    : record.status === 'success'
                    ? 'text-emerald-600'
                    : 'text-rose-600',
                ]"
              >
                {{ statusMap[record.status] || record.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- DESKTOP TABLE VIEW (>= md)                     -->
        <!-- ============================================== -->
        <div class="hidden md:block">
          <a-table
            :columns="columns"
            :data-source="rows"
            :loading="loading"
            :pagination="false"
            row-key="id"
            :scroll="{ x: 900 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'time'">
                <b class="text-xs">{{
                  new Date(record.created_at).toLocaleDateString("vi-VN")
                }}</b>
                <div class="text-[10px] text-slate-400">
                  {{ new Date(record.created_at).toLocaleTimeString("vi-VN") }}
                </div>
              </template>
              <template v-else-if="column.key === 'content'">
                <div class="text-xs font-bold">
                  {{ record.reference_id || "#" + record.id }}
                </div>
                <div class="mt-1 text-[11px] text-slate-500">
                  {{ record.description || "Không có mô tả" }}
                </div>
              </template>
              <template v-else-if="column.key === 'type'">
                <span
                  class="rounded-full px-2.5 py-1 text-xs font-bold"
                  :class="
                    record.type === 'commission'
                      ? 'bg-orange-50 text-[#ee4d2d]'
                      : 'bg-blue-50 text-blue-600'
                  "
                >
                  {{ record.type === "commission" ? "Hoa hồng" : "Rút tiền" }}
                </span>
              </template>
              <template v-else-if="column.key === 'amount'">
                <b
                  :class="
                    record.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  "
                >
                  {{ record.amount >= 0 ? "+" : "-" }}{{ money(record.amount) }}
                </b>
              </template>
              <template v-else-if="column.key === 'status'">
                <span class="text-xs font-bold">{{
                  statusMap[record.status] || record.status
                }}</span>
              </template>
            </template>
          </a-table>
        </div>

        <div
          class="flex justify-center sm:justify-end border-t border-slate-100 p-4"
        >
          <a-pagination
            :current="page"
            :total="total"
            :page-size="limit"
            @change="(p:number)=>{page=p;fetchData()}"
          />
        </div>
      </a-card>
    </template>
    <a-modal
      v-model:open="showUserModal"
      title="Chọn người dùng"
      :footer="null"
      class="max-w-[95vw] sm:max-w-[560px]"
      @after-close="userSearch = ''"
    >
      <a-input
        v-model:value="userSearch"
        allow-clear
        placeholder="Tìm theo tên hoặc Zalo UID..."
        class="mb-4"
        autofocus
        ><template #prefix><SearchOutlined class="text-slate-400" /></template
      ></a-input>
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
            user.id === userId
              ? 'border-[#ee4d2d] bg-orange-50'
              : 'border-slate-200 bg-white',
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
            v-if="user.id === userId"
            class="rounded-full bg-[#ee4d2d] px-2 py-1 text-[10px] font-bold text-white"
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
