<template>
  <section>
    <div
      class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <h3 class="m-0 text-base font-black text-slate-900 dark:text-white">
          Quản lý Quà điểm danh & S-Point
        </h3>
        <p class="mt-1 mb-0 text-xs text-slate-500">
          Cấu hình cài đặt điểm danh, mốc quy đổi và xem lịch sử tích lũy/quy
          đổi điểm của thành viên.
        </p>
      </div>
      <a-button
        v-if="activeTab === 'config'"
        type="primary"
        :loading="saving"
        class="font-bold"
        @click="save"
      >
        Lưu cấu hình
      </a-button>
    </div>

    <a-tabs
      v-model:activeKey="activeTab"
      class="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm"
    >
      <!-- TAB 1: CẤU HÌNH -->
      <a-tab-pane key="config" tab="⚙️ Cấu hình chung">
        <a-spin :spinning="loading">
          <div class="flex flex-col gap-5 pt-2">
            <!-- Chức năng bật/tắt -->
            <div
              class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div class="flex items-center justify-between gap-4">
                <div>
                  <h4
                    class="m-0 text-sm font-black text-slate-900 dark:text-white"
                  >
                    Chức năng Quà điểm danh
                  </h4>
                  <p class="mt-1 mb-0 text-xs leading-5 text-slate-500">
                    Khi tắt, người dùng không thể truy cập trang điểm danh hoặc
                    gọi API điểm danh.
                  </p>
                </div>
                <a-switch v-model:checked="settings.enabled" />
              </div>
            </div>

            <!-- Thưởng điểm danh sớm -->
            <div
              class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">
                Thưởng điểm danh sớm nhất
              </h4>
              <p class="mt-1 mb-4 text-xs text-slate-500">
                Chỉ người điểm danh đầu tiên trong ngày nhận thêm phần thưởng
                này.
              </p>
              <a-form-item label="Số S-Point thưởng thêm" class="mb-0">
                <a-input-number
                  v-model:value="settings.first_checkin_points"
                  :min="0"
                  :max="100000"
                  :precision="0"
                  class="w-full sm:max-w-xs"
                />
              </a-form-item>
            </div>

            <!-- Cấu hình các mức quy đổi S-Point -->
            <div
              class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div
                class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4
                    class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
                  >
                    <span>💰 Các Mức Quy Đổi S-Point Sang VNĐ</span>
                  </h4>
                  <p class="mt-1 mb-0 text-xs text-slate-500">
                    Thiết lập các mốc chọn nhanh và giá trị tiền thưởng quy đổi
                    tương ứng vào Ví người dùng.
                  </p>
                </div>
                <a-button
                  type="dashed"
                  class="font-bold border-orange-400 text-orange-600 hover:text-orange-500 hover:border-orange-500"
                  @click="addExchangeOption"
                >
                  + Thêm mốc quy đổi
                </a-button>
              </div>

              <div
                v-if="settings.exchange_options.length === 0"
                class="py-8 text-center text-xs text-slate-400"
              >
                Chưa có mốc quy đổi nào. Bấm nút "+ Thêm mốc quy đổi" để tạo
                mới.
              </div>

              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="(option, index) in settings.exchange_options"
                  :key="index"
                  class="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40 sm:grid-cols-12 sm:items-center"
                >
                  <!-- Số Point -->
                  <div class="sm:col-span-4">
                    <label
                      class="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-400"
                      >Số S-Point (Mốc):</label
                    >
                    <a-input-number
                      v-model:value="option.points"
                      :min="1"
                      :max="1000000"
                      :precision="0"
                      placeholder="Ví dụ: 6"
                      class="w-full"
                      addon-after="S-Point"
                    />
                  </div>

                  <!-- Số tiền VNĐ -->
                  <div class="sm:col-span-4">
                    <label
                      class="mb-1 block text-[11px] font-bold text-slate-600 dark:text-slate-400"
                      >Số tiền quy đổi (VNĐ):</label
                    >
                    <a-input-number
                      v-model:value="option.amount_vnd"
                      :min="0"
                      :max="1000000000"
                      :step="500"
                      :formatter="(val: any) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(val: string) => val.replace(/\$\s?|(,*)/g, '')"
                      placeholder="Ví dụ: 2,000"
                      class="w-full"
                      addon-after="VNĐ"
                    />
                  </div>

                  <!-- Tỷ lệ tương đương & Thao tác -->
                  <div
                    class="sm:col-span-4 flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-5"
                  >
                    <span
                      class="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2.5 py-1 rounded-lg border border-orange-200/60 dark:border-orange-900/50"
                    >
                      ≈ {{ getRateText(option) }} / S-Point
                    </span>
                    <a-button
                      type="text"
                      danger
                      class="flex items-center justify-center text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      @click="removeExchangeOption(index)"
                    >
                      Xóa
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a-spin>
      </a-tab-pane>

      <!-- TAB 2: LỊCH SỬ NHẬN & QUY ĐỔI -->
      <a-tab-pane key="history" tab="📜 Lịch sử & quy đổi">
        <div class="space-y-4 pt-2">
          <!-- Filters -->
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex flex-wrap items-center gap-3">
              <a-input-search
                v-model:value="filterSearch"
                placeholder="Tìm tên, email user hoặc nội dung..."
                class="w-full sm:w-72"
                allow-clear
                @search="handleSearchHistory"
              />
              <a-select
                v-model:value="filterType"
                class="w-full sm:w-52"
                @change="handleSearchHistory"
              >
                <a-select-option value="all"
                  >Tất cả loại giao dịch</a-select-option
                >
                <a-select-option value="checkin"
                  >Điểm danh hàng ngày</a-select-option
                >
                <a-select-option value="early_bird"
                  >Thưởng điểm danh sớm</a-select-option
                >
                <a-select-option value="referral_first_order"
                  >Thưởng đơn đầu giới thiệu</a-select-option
                >
                <a-select-option value="exchange"
                  >Quy đổi ra VNĐ</a-select-option
                >
              </a-select>
            </div>
            <a-button
              class="font-bold flex items-center gap-1.5"
              @click="loadHistory"
            >
              🔄 Tải lại
            </a-button>
          </div>

          <!-- History Table -->
          <a-table
            :data-source="historyList"
            :columns="columns"
            :loading="historyLoading"
            :pagination="historyPagination"
            row-key="id"
            size="middle"
            @change="handleTableChange"
          >
            <!-- User Column -->
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'user'">
                <div class="flex items-center gap-2.5">
                  <a-avatar :src="record.user?.image" :size="34">
                    {{
                      record.user?.name
                        ? record.user.name.charAt(0).toUpperCase()
                        : "U"
                    }}
                  </a-avatar>
                  <div class="flex flex-col text-xs">
                    <span class="font-bold text-slate-800 dark:text-slate-200">
                      {{ record.user?.name || "User #" + record.user_id }}
                    </span>
                    <span class="text-slate-400 text-[11px]">
                      {{ record.user?.email || "N/A" }}
                    </span>
                  </div>
                </div>
              </template>

              <!-- Type Column -->
              <template v-if="column.key === 'type'">
                <a-tag
                  :color="getTypeTagColor(record.type)"
                  class="font-bold rounded-lg px-2.5 py-0.5 text-xs"
                >
                  {{ getTypeLabel(record.type) }}
                </a-tag>
              </template>

              <!-- Points Column -->
              <template v-if="column.key === 'points'">
                <span
                  class="font-black text-xs"
                  :class="
                    record.points > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  "
                >
                  {{ record.points > 0 ? "+" : "" }}{{ record.points }} Point
                </span>
              </template>

              <!-- Amount VNĐ Column -->
              <template v-if="column.key === 'amount_vnd'">
                <span
                  v-if="record.amount_vnd && record.amount_vnd > 0"
                  class="font-black text-xs text-[#ee4d2d]"
                >
                  +{{ formatVnd(record.amount_vnd) }} VNĐ
                </span>
                <span v-else class="text-slate-400 text-xs">-</span>
              </template>

              <!-- Created At Column -->
              <template v-if="column.key === 'created_at'">
                <span class="text-xs font-medium text-slate-500">
                  {{ formatDate(record.created_at) }}
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
    </a-tabs>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue";
import { message } from "ant-design-vue";
import axios from "@/api/axios";

interface ExchangeOption {
  points: number;
  amount_vnd: number;
}

const activeTab = ref("config");
const loading = ref(false);
const saving = ref(false);

const settings = reactive({
  enabled: true,
  first_checkin_points: 2,
  exchange_options: [
    { points: 6, amount_vnd: 2000 },
    { points: 12, amount_vnd: 4000 },
    { points: 30, amount_vnd: 12000 },
    { points: 60, amount_vnd: 24000 },
  ] as ExchangeOption[],
});

// Admin History State
const historyList = ref<any[]>([]);
const historyLoading = ref(false);
const filterSearch = ref("");
const filterType = ref("all");
const historyPagination = reactive({
  current: 1,
  pageSize: 15,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["10", "15", "30", "50"],
});

const columns = [
  { title: "Thành viên", key: "user" },
  { title: "Loại giao dịch", key: "type" },
  { title: "Biến động Spoint", key: "points" },
  { title: "Số tiền quy đổi", key: "amount_vnd" },
  { title: "Mô tả", dataIndex: "description", key: "description" },
  { title: "Thời gian", key: "created_at" },
];

const getRateText = (option: ExchangeOption) => {
  if (!option.points || option.points <= 0) return "0đ";
  const rate = Math.round(option.amount_vnd / option.points);
  return `${rate.toLocaleString("vi-VN")}đ`;
};

const addExchangeOption = () => {
  const lastOpt =
    settings.exchange_options[settings.exchange_options.length - 1];
  const nextPoints = lastOpt ? lastOpt.points + 10 : 10;
  const nextVnd = lastOpt
    ? Math.round((lastOpt.amount_vnd / lastOpt.points) * nextPoints)
    : 4000;

  settings.exchange_options.push({
    points: nextPoints,
    amount_vnd: nextVnd,
  });
};

const removeExchangeOption = (index: number) => {
  settings.exchange_options.splice(index, 1);
};

const load = async () => {
  loading.value = true;
  try {
    const response = await axios.get("/admin/system-config/checkin-gift");
    const data = response?.data?.data ?? response?.data;
    settings.enabled = data?.enabled ?? true;
    settings.first_checkin_points = data?.first_checkin_points ?? 2;
    if (
      Array.isArray(data?.exchange_options) &&
      data.exchange_options.length > 0
    ) {
      settings.exchange_options = data.exchange_options.map((opt: any) => ({
        points: Number(opt.points) || 0,
        amount_vnd: Number(opt.amount_vnd) || 0,
      }));
    }
  } catch (error: any) {
    message.error(
      error?.response?.data?.message || "Không thể tải cấu hình Quà điểm danh."
    );
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  for (const opt of settings.exchange_options) {
    if (!opt.points || opt.points <= 0) {
      message.error("Số S-Point quy đổi phải lớn hơn 0.");
      return;
    }
    if (opt.amount_vnd < 0) {
      message.error("Số tiền VNĐ không được nhỏ hơn 0.");
      return;
    }
  }

  saving.value = true;
  try {
    const response = await axios.put(
      "/admin/system-config/checkin-gift",
      settings
    );
    const data = response?.data?.data;
    if (data) {
      settings.enabled = data.enabled;
      settings.first_checkin_points = data.first_checkin_points;
      if (Array.isArray(data.exchange_options)) {
        settings.exchange_options = data.exchange_options;
      }
    }
    message.success("Lưu cấu hình Quà điểm danh thành công!");
  } catch (error: any) {
    message.error(
      error?.response?.data?.message || "Không thể lưu cấu hình Quà điểm danh."
    );
  } finally {
    saving.value = false;
  }
};

// Admin History Methods
const loadHistory = async () => {
  historyLoading.value = true;
  try {
    const response = await axios.get("/admin/spoint-transactions", {
      params: {
        page: historyPagination.current,
        per_page: historyPagination.pageSize,
        type: filterType.value,
        search: filterSearch.value,
      },
    });
    const resData = response?.data?.data;
    if (resData) {
      historyList.value = resData.data || [];
      historyPagination.current = resData.current_page;
      historyPagination.pageSize = resData.per_page;
      historyPagination.total = resData.total;
    }
  } catch (error: any) {
    message.error("Không thể tải lịch sử giao dịch S-Point.");
  } finally {
    historyLoading.value = false;
  }
};

const handleSearchHistory = () => {
  historyPagination.current = 1;
  loadHistory();
};

const handleTableChange = (pag: any) => {
  historyPagination.current = pag.current;
  historyPagination.pageSize = pag.pageSize;
  loadHistory();
};

const formatVnd = (val: number) => {
  return new Intl.NumberFormat("vi-VN").format(val || 0);
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getTypeTagColor = (type: string) => {
  switch (type) {
    case "checkin":
      return "processing";
    case "early_bird":
      return "warning";
    case "referral_first_order":
      return "purple";
    case "exchange":
      return "error";
    default:
      return "default";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "checkin":
      return "Point Điểm Danh";
    case "early_bird":
      return "Thưởng Sớm Nhất";
    case "referral_first_order":
      return "Thưởng Giới Thiệu";
    case "exchange":
      return "Quy Đổi Ví";
    default:
      return type;
  }
};

watch(activeTab, (newTab) => {
  if (newTab === "history" && historyList.value.length === 0) {
    loadHistory();
  }
});

onMounted(() => {
  load();
});
</script>
