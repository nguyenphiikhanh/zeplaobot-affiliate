<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { message, Modal } from "ant-design-vue";
import {
  CheckOutlined,
  CloseOutlined,
  ReloadOutlined,
  SearchOutlined,
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
onMounted(fetchData);
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
];
</script>
<template>
  <div class="flex flex-col gap-6 pb-12">
    <div>
      <h2 class="text-lg font-bold text-slate-800">Rút tiền</h2>
      <p class="mt-1 text-[13px] text-slate-500">
        Kiểm tra và xử lý yêu cầu rút tiền của người dùng.
      </p>
    </div>
    <div class="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
      <div
        v-for="x in [
          { l: 'Tổng yêu cầu', v: stats.total },
          { l: 'Đang chờ xử lý', v: stats.pending_count },
          { l: 'Tổng tiền đang chờ', v: money(stats.pending_amount) },
        ]"
        :key="x.l"
        class="rounded-2xl bg-white p-4 sm:p-5 shadow-sm"
      >
        <a-skeleton-button
          v-if="loading && !rows.length"
          active
          block
        /><template v-else
          ><div class="text-xs font-bold text-slate-500">{{ x.l }}</div>
          <div class="mt-2 text-xl sm:text-2xl font-black text-slate-800">
            {{ x.v }}
          </div></template
        >
      </div>
    </div>
    <a-card
      :bordered="false"
      :body-style="{ padding: 0 }"
      class="overflow-hidden !rounded-2xl"
      ><div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-3 sm:p-4"
      >
        <div class="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <a-input
            v-model:value="search"
            allow-clear
            placeholder="Tìm theo mã giao dịch..."
            class="w-full sm:w-64"
            @press-enter="
              page = 1;
              fetchData();
            "
            ><template #prefix><SearchOutlined /></template></a-input
          ><a-select
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
      <a-table
        :columns="columns"
        :data-source="rows"
        :loading="loading"
        :pagination="false"
        row-key="id"
        :scroll="{ x: 1000 }"
        :custom-row="(r:Item)=>({onClick:()=>selected=r,class:'cursor-pointer'})"
        ><template #bodyCell="{ column, record }"
          ><template v-if="column.key === 'ref'"
            ><b class="text-xs text-[#ee4d2d]">{{
              record.reference_id || "#" + record.id
            }}</b></template
          ><template v-else-if="column.key === 'user'"
            ><div class="text-xs font-bold">
              {{ record.user?.name || "Người dùng" }}
            </div>
            <div class="text-[10px] font-mono text-slate-400">
              {{ record.user?.tracking_code }}
            </div></template
          ><template v-else-if="column.key === 'time'"
            ><div class="text-xs">
              {{ new Date(record.created_at).toLocaleString("vi-VN") }}
            </div></template
          ><template v-else-if="column.key === 'amount'"
            ><b>{{ money(record.amount) }}</b></template
          ><template v-else-if="column.key === 'status'"
            ><span
              class="rounded-full px-2.5 py-1 text-xs font-bold"
              :class="
                record.status === 'pending'
                  ? 'bg-amber-50 text-amber-600'
                  : record.status === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              "
              >{{ labels[record.status] }}</span
            ></template
          ></template
        ></a-table
      >
      <div class="flex justify-center sm:justify-end border-t border-slate-100 p-4">
        <a-pagination
          :current="page"
          :total="total"
          :page-size="limit"
          @change="(p:number)=>{page=p;fetchData()}"
        /></div
    ></a-card>
    <a-drawer
      :open="!!selected"
      title="Chi tiết yêu cầu rút tiền"
      root-class-name="max-w-full"
      width="440"
      @close="selected = null"
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
