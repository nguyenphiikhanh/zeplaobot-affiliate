<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { message, Modal } from "ant-design-vue";
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
  RightOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  WalletOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";
type Item = {
  id: number;
  amount: number;
  status: string;
  reference_id: string | null;
  description: string | null;
  qr_code_url: string | null;
  reject_reason: string | null;
  created_at: string;
  user: { id: string; name: string | null; tracking_code: string } | null;
};
const rows = ref<Item[]>([]),
  selected = ref<Item | null>(null),
  loading = ref(false),
  updating = ref(false),
  page = ref(1),
  limit = ref(20),
  total = ref(0),
  search = ref(""),
  status = ref("");
const stats = ref({ total: 0, pending_count: 0, pending_amount: 0 });
const money = (v: number) =>
  new Intl.NumberFormat("vi-VN").format(Math.abs(v || 0)) + "đ";
const labels: Record<string, string> = {
  pending: "Chờ xử lý",
  success: "Đã duyệt",
  rejected: "Đã từ chối",
};
const fetchData = async () => {
  loading.value = true;
  try {
    const r = await api.get<
      ApiResponse<{
        withdrawals: Item[];
        stats: typeof stats.value;
        total: number;
      }>
    >("/api/admin/withdrawals", {
      params: {
        page: page.value,
        limit: limit.value,
        search: search.value || undefined,
        status: status.value || undefined,
      },
    });
    rows.value = r.data.data?.withdrawals || [];
    stats.value = r.data.data?.stats || stats.value;
    total.value = r.data.data?.total || 0;
  } catch {
    message.error("Không thể tải danh sách rút tiền.");
  } finally {
    loading.value = false;
  }
};
const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1024);
const handleResize = () => {
  windowWidth.value = window.innerWidth;
};
const drawerWidth = computed(() => (windowWidth.value < 640 ? "100%" : "440px"));

onMounted(() => {
  fetchData();
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
watch([status, limit], () => {
  page.value = 1;
  fetchData();
});
const update = async (
  item: Item,
  next: "success" | "rejected",
  reason?: string
) => {
  updating.value = true;
  try {
    await api.put(`/api/admin/withdrawals/${item.id}/status`, {
      status: next,
      rejectReason: reason,
    });
    message.success(
      next === "success" ? "Đã duyệt yêu cầu rút tiền." : "Đã từ chối yêu cầu."
    );
    selected.value = null;
    fetchData();
  } catch (e: any) {
    message.error(e.response?.data?.message || "Không thể cập nhật yêu cầu.");
  } finally {
    updating.value = false;
  }
};
const approve = (i: Item) =>
  Modal.confirm({
    title: "Duyệt yêu cầu rút tiền?",
    content: `Xác nhận đã chuyển ${money(i.amount)} cho ${
      i.user?.name || "người dùng"
    }?`,
    okText: "Duyệt",
    cancelText: "Hủy",
    onOk: () => update(i, "success"),
  });
const reject = (i: Item) => {
  let reason = "";
  Modal.confirm({
    title: "Từ chối yêu cầu",
    content: () =>
      h("textarea", {
        class: "w-full min-h-24 rounded-lg border border-slate-300 p-3 mt-3",
        placeholder: "Nhập lý do từ chối...",
        onInput: (e: Event) =>
          (reason = (e.target as HTMLTextAreaElement).value),
      }),
    okText: "Từ chối",
    okType: "danger",
    cancelText: "Hủy",
    onOk: () => {
      if (!reason.trim()) {
        message.warning("Vui lòng nhập lý do từ chối.");
        return Promise.reject();
      }
      return update(i, "rejected", reason);
    },
  });
};
import { h } from "vue";
const columns = [
  { title: "Mã giao dịch", key: "ref", width: 160 },
  { title: "Người dùng", key: "user", width: 220 },
  { title: "Thời gian", key: "time", width: 160 },
  { title: "Số tiền", key: "amount", width: 150 },
  { title: "Trạng thái", key: "status", width: 130 },
  { title: "", key: "action", width: 100, align: "center" },
];

const formatDateTime = (value?: string | null) => {
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
      return dateObj.toLocaleString("vi-VN");
    }
  } catch {}
  return str;
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
          <WalletOutlined class="text-[#ee4d2d]" />
          <h2 class="text-base sm:text-xl font-bold text-slate-800 tracking-tight">Rút tiền</h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-500">
          Kiểm tra và xử lý yêu cầu rút tiền của người dùng.
        </p>
      </div>
    </div>
    <!-- Top Stats Cards -->
    <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
      <!-- Card 1: Tổng yêu cầu -->
      <div
        class="rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 p-4 sm:p-5 border border-blue-100/90 shadow-2xs relative overflow-hidden space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-blue-600/90 uppercase tracking-wider"
            >Tổng yêu cầu</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0"
          >
            <HistoryOutlined class="text-base" />
          </div>
        </div>
        <a-skeleton-button v-if="loading && !rows.length" active block />
        <div v-else class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {{ stats.total }}
        </div>
      </div>

      <!-- Card 2: Đang chờ xử lý -->
      <div
        class="rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 p-4 sm:p-5 border border-amber-100/90 shadow-2xs relative overflow-hidden space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-amber-600/90 uppercase tracking-wider"
            >Đang chờ xử lý</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0"
          >
            <ClockCircleOutlined class="text-base" />
          </div>
        </div>
        <a-skeleton-button v-if="loading && !rows.length" active block />
        <div v-else class="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
          {{ stats.pending_count }}
        </div>
      </div>

      <!-- Card 3: Tổng tiền đang chờ -->
      <div
        class="rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 p-4 sm:p-5 border border-emerald-100/90 shadow-2xs relative overflow-hidden space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-emerald-600/90 uppercase tracking-wider"
            >Tổng tiền đang chờ</span
          >
          <div
            class="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0"
          >
            <DollarOutlined class="text-base" />
          </div>
        </div>
        <a-skeleton-button v-if="loading && !rows.length" active block />
        <div v-else class="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
          {{ money(stats.pending_amount) }}
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
        <div class="grid grid-cols-1 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <a-input
            v-model:value="search"
            allow-clear
            placeholder="Tìm theo mã giao dịch..."
            class="w-full sm:w-64"
            @press-enter="
              page = 1;
              fetchData();
            "
          >
            <template #prefix><SearchOutlined /></template>
          </a-input>
          <a-select
            v-model:value="status"
            class="w-full sm:w-44"
            :options="[
              { label: 'Tất cả trạng thái', value: '' },
              { label: 'Chờ xử lý', value: 'pending' },
              { label: 'Đã duyệt', value: 'success' },
              { label: 'Đã từ chối', value: 'rejected' },
            ]"
          />
        </div>
        <button
          type="button"
          class="btn-action-primary shrink-0 w-full sm:w-auto"
          @click="fetchData"
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
          <p class="text-xs font-bold text-slate-400">Không tìm thấy yêu cầu rút tiền nào</p>
        </div>

        <!-- Card Item -->
        <div
          v-else
          v-for="record in rows"
          :key="record.id"
          @click="selected = record"
          :class="[
            'rounded-2xl border p-3.5 space-y-3 cursor-pointer active:scale-[0.99] transition-all shadow-2xs',
            record.status === 'pending'
              ? 'bg-gradient-to-br from-amber-50/40 via-white to-white border-amber-200/90 border-l-4 border-l-amber-500'
              : record.status === 'success'
              ? 'bg-gradient-to-br from-emerald-50/40 via-white to-white border-emerald-200/90 border-l-4 border-l-emerald-500'
              : 'bg-gradient-to-br from-rose-50/40 via-white to-white border-rose-200/90 border-l-4 border-l-rose-400',
          ]"
        >
          <!-- Top Card Bar: Ref ID (Left) & Status (Right) -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-100/80">
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="text-xs font-mono font-bold text-[#ee4d2d] truncate">
                {{ record.reference_id || "#" + record.id }}
              </span>
            </div>
            <span
              :class="[
                'px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shrink-0',
                record.status === 'pending'
                  ? 'bg-amber-50 text-amber-600 border border-amber-200/80'
                  : record.status === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80'
                  : 'bg-rose-50 text-rose-600 border border-rose-200/80',
              ]"
            >
              {{ labels[record.status] }}
            </span>
          </div>

          <!-- Middle Info Box: User Name & Amount -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-9 h-9 rounded-full bg-orange-100 text-[#ee4d2d] font-black text-xs flex items-center justify-center shrink-0 border border-orange-200"
              >
                {{ (record.user?.name || "U").charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <div class="text-xs font-bold text-slate-800 truncate">
                  {{ record.user?.name || "Người dùng" }}
                </div>
                <div class="text-[10px] font-mono text-slate-400 truncate">
                  {{ record.user?.tracking_code || `ID: ${record.user?.id || record.id}` }}
                </div>
              </div>
            </div>

            <!-- Money Amount -->
            <div class="text-right shrink-0">
              <span class="text-xs text-slate-400 block font-medium">Số tiền rút</span>
              <span class="text-base font-black text-slate-900 tracking-tight">
                {{ money(record.amount) }}
              </span>
            </div>
          </div>

          <!-- Bottom Row: Date & Action Button -->
          <div class="flex items-center justify-between pt-1 border-t border-slate-100/80 text-xs">
            <span class="text-[11px] text-slate-400 font-medium">
              {{ formatDateTime(record.created_at) }}
            </span>
            <button
              type="button"
              class="btn-action-primary !h-7 !px-3 text-[11px] !rounded-lg"
              @click.stop="selected = record"
            >
              <span>Chi tiết</span>
              <RightOutlined class="text-[10px]" />
            </button>
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
          :scroll="{ x: 1000 }"
          :custom-row="(r:Item)=>({onClick:()=>selected=r,class:'cursor-pointer'})"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'ref'">
              <b class="text-[#ee4d2d] text-xs">{{
                record.reference_id || "#" + record.id
              }}</b>
            </template>
            <template v-else-if="column.key === 'user'">
              <div class="text-xs font-bold">
                {{ record.user?.name || "Người dùng" }}
              </div>
              <div class="text-[10px] font-mono text-slate-400">
                {{ record.user?.tracking_code }}
              </div>
            </template>
            <template v-else-if="column.key === 'time'">
              <div class="text-xs">
                {{ formatDateTime(record.created_at) }}
              </div>
            </template>
            <template v-else-if="column.key === 'amount'">
              <b>{{ money(record.amount) }}</b>
            </template>
            <template v-else-if="column.key === 'status'">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-bold"
                :class="
                  record.status === 'pending'
                    ? 'bg-amber-50 text-amber-600'
                    : record.status === 'success'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-rose-50 text-rose-600'
                "
              >
                {{ labels[record.status] }}
              </span>
            </template>
            <template v-else-if="column.key === 'action'">
              <button
                type="button"
                class="btn-action-primary !h-7 !px-2.5 text-[11px] whitespace-nowrap shrink-0"
                @click.stop="selected = record"
              >
                <span>Chi tiết</span>
                <RightOutlined class="text-[10px]" />
              </button>
            </template>
          </template>
        </a-table>
      </div>
      <div class="flex justify-center sm:justify-end border-t border-slate-100 p-4">
        <a-pagination
          :current="page"
          :total="total"
          :page-size="limit"
          @change="(p:number)=>{page=p;fetchData()}"
        />
      </div>
    </a-card>
    <a-drawer
      :open="!!selected"
      title="Chi tiết yêu cầu rút tiền"
      :width="drawerWidth"
      @close="selected = null"
      :root-style="{ maxWidth: '100vw' }"
      :body-style="{ padding: windowWidth < 640 ? '16px 12px' : '20px' }"
      ><div v-if="selected" class="space-y-4">
        <div
          v-for="x in [
            { l: 'Số tiền', v: money(selected.amount) },
            { l: 'Nội dung', v: selected.description || 'Không có' },
            { l: 'Trạng thái', v: labels[selected.status] },
            { l: 'Lý do từ chối', v: selected.reject_reason || 'Không có' },
          ]"
          :key="x.l"
          class="rounded-xl border border-slate-200 p-4"
        >
          <div class="text-[10px] font-bold uppercase text-slate-400">
            {{ x.l }}
          </div>
          <div class="mt-1 text-sm font-semibold">{{ x.v }}</div>
        </div>
        <img
          v-if="selected.qr_code_url"
          :src="selected.qr_code_url"
          class="mx-auto max-w-full rounded-xl border"
        />
        <div v-if="selected.status === 'pending'" class="flex gap-3">
          <button
            type="button"
            class="btn-action-success flex-1 !h-10 text-sm"
            :disabled="updating"
            @click="approve(selected)"
          >
            <CheckOutlined />
            <span>Duyệt</span>
          </button>
          <button
            type="button"
            class="btn-action-danger flex-1 !h-10 text-sm"
            :disabled="updating"
            @click="reject(selected)"
          >
            <CloseOutlined />
            <span>Từ chối</span>
          </button>
        </div>
      </div></a-drawer
    >
  </div>
</template>
<style>
.ant-modal-confirm .ant-btn-primary {
  background: #ee4d2d !important;
  border-color: #ee4d2d !important;
}
.ant-modal-confirm .ant-btn-primary:hover {
  background: #d63d1e !important;
  border-color: #d63d1e !important;
}
</style>
