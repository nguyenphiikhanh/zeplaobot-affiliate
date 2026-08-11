<template>
  <div class="w-full">
    <!-- Page Title & Header -->
    <div class="mb-4 sm:mb-6">
      <h1
        class="text-xl sm:text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100"
      >
        Quản Lý Tài Chính
      </h1>
      <p
        class="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1"
      >
        Yêu cầu rút số dư hoa hồng tích lũy về tài khoản ngân hàng của bạn cực
        kỳ nhanh chóng.
      </p>
    </div>

    <!-- Financial Summary Cards -->
    <a-row :gutter="[16, 16]" class="mb-6 sm:mb-8">
      <!-- Khả dụng -->
      <a-col :xs="24" :md="8">
        <a-card
          :bordered="false"
          class="rounded-2xl shadow-sm bg-orange-50 dark:bg-orange-950/20"
        >
          <div class="flex justify-between items-start mb-2 sm:mb-4">
            <span
              class="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest"
              >Số dư khả dụng</span
            >
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-[#ee4d2d] flex items-center justify-center text-lg sm:text-xl"
            >
              <BankOutlined />
            </div>
          </div>
          <a-skeleton
            active
            :loading="isWalletLoading"
            :paragraph="{ rows: 1 }"
          >
            <div
              class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100"
            >
              {{ formatMoney(availableBalance) }}
            </div>
            <div class="text-[10px] text-slate-400 font-bold mt-1 sm:mt-2">
              Có thể thanh toán
            </div>
          </a-skeleton>
        </a-card>
      </a-col>

      <!-- Chờ xử lý -->
      <a-col :xs="24" :md="8">
        <a-card
          :bordered="false"
          class="rounded-2xl shadow-sm bg-white dark:bg-slate-900"
        >
          <div class="flex justify-between items-start mb-2 sm:mb-4">
            <span
              class="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest"
              >Chờ xử lý</span
            >
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center text-lg sm:text-xl"
            >
              <ClockCircleOutlined />
            </div>
          </div>
          <a-skeleton
            active
            :loading="isWalletLoading"
            :paragraph="{ rows: 1 }"
          >
            <div
              class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100"
            >
              {{ formatMoney(pendingBalance) }}
            </div>
            <div class="text-[10px] text-slate-400 font-bold mt-1 sm:mt-2">
              Chờ rút tiền
            </div>
          </a-skeleton>
        </a-card>
      </a-col>

      <!-- Đã thanh toán -->
      <a-col :xs="24" :md="8">
        <a-card
          :bordered="false"
          class="rounded-2xl shadow-sm bg-white dark:bg-slate-900"
        >
          <div class="flex justify-between items-start mb-2 sm:mb-4">
            <span
              class="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest"
              >Đã thanh toán</span
            >
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center text-lg sm:text-xl"
            >
              <CheckCircleOutlined />
            </div>
          </div>
          <a-skeleton
            active
            :loading="isWalletLoading"
            :paragraph="{ rows: 1 }"
          >
            <div
              class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100"
            >
              {{ formatMoney(totalWithdrawn) }}
            </div>
            <div class="text-[10px] text-slate-400 font-bold mt-1 sm:mt-2">
              Saffi đã thanh toán cho bạn
            </div>
          </a-skeleton>
        </a-card>
      </a-col>
    </a-row>

    <!-- Bank Account Linked Info -->
    <a-card
      :bordered="false"
      class="mb-8 rounded-2xl shadow-sm bg-white dark:bg-slate-900"
    >
      <a-skeleton active :loading="isBankLoading">
        <div v-if="hasBankAccount">
          <div
            class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-500"
              >
                <BankOutlined class="text-lg" />
              </div>
              <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">
                Tài khoản đối soát
              </h3>
            </div>
          </div>

          <a-row :gutter="16">
            <a-col :xs="24" :sm="8">
              <span
                class="text-[10px] font-bold text-slate-400 uppercase block mb-1"
                >Ngân hàng</span
              >
              <span
                class="text-sm font-bold text-slate-800 dark:text-slate-200"
                >{{ bankAccountInfo.bank_name }}</span
              >
            </a-col>
            <a-col :xs="24" :sm="8">
              <span
                class="text-[10px] font-bold text-slate-400 uppercase block mb-1 mt-4 sm:mt-0"
                >Số tài khoản</span
              >
              <span
                class="text-sm font-bold text-slate-800 dark:text-slate-200"
                >{{ bankAccountInfo.account_no }}</span
              >
            </a-col>
            <a-col :xs="24" :sm="8">
              <span
                class="text-[10px] font-bold text-slate-400 uppercase block mb-1 mt-4 sm:mt-0"
                >Chủ tài khoản</span
              >
              <span
                class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase"
                >{{ bankAccountInfo.account_name }}</span
              >
            </a-col>
          </a-row>
        </div>

        <div
          v-else
          class="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center text-xl shrink-0"
            >
              <WarningOutlined />
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">
                Chưa có tài khoản đối soát
              </h4>
              <p class="text-xs text-slate-500 mt-1">
                Vui lòng cài đặt trong phần chỉnh sửa thông tin cá nhân.
              </p>
            </div>
          </div>
          <router-link :to="{ name: 'ho-so' }">
            <a-button type="primary" class="font-bold">Cài đặt ngay</a-button>
          </router-link>
        </div>
      </a-skeleton>
    </a-card>

    <!-- Main Grid -->
    <a-row :gutter="[24, 24]">
      <!-- Withdraw Form -->
      <a-col :xs="24" :lg="14">
        <a-card
          :bordered="false"
          class="rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title="Yêu Cầu Rút Tiền"
        >
          <a-form layout="vertical" @submit.prevent="handleSubmit">
            <!-- Bank preview -->
            <div
              v-if="hasBankAccount"
              class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mb-6"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-orange-100 text-[#ee4d2d] flex items-center justify-center"
                >
                  <BankOutlined />
                </div>
                <div>
                  <span
                    class="block text-[10px] font-bold text-slate-400 uppercase"
                    >Rút về tài khoản</span
                  >
                  <span class="font-bold text-slate-800 dark:text-slate-200"
                    >{{ bankAccountInfo.bank_name }} •
                    {{ bankAccountInfo.account_no }}</span
                  >
                </div>
              </div>
              <span class="font-bold text-[11px] text-slate-500 uppercase">{{
                bankAccountInfo.account_name
              }}</span>
            </div>

            <a-alert
              v-else
              type="warning"
              show-icon
              message="Vui lòng cài đặt trong phần chỉnh sửa thông tin cá nhân trước khi rút tiền."
              class="mb-6 rounded-xl"
            />

            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-bold text-slate-500 uppercase"
                >Số tiền rút</span
              >
              <a-button
                type="link"
                :disabled="isApiLoading || isSubmitting"
                @click="withdrawAmount = availableBalance"
                class="p-0 text-[10px] font-bold text-[#ee4d2d]"
              >
                RÚT TOÀN BỘ SỐ DƯ
              </a-button>
            </div>

            <a-form-item
              :validate-status="amountError ? 'error' : ''"
              :help="
                amountError ||
                '* Hạn mức rút tối thiểu: 10.000đ • Miễn phí chuyển khoản'
              "
            >
              <a-input
                v-model:value="formattedWithdrawAmount"
                :disabled="isApiLoading || isSubmitting || !hasBankAccount"
                placeholder="Nhập số tiền..."
                size="large"
                class="font-bold text-lg"
              >
                <template #suffix
                  ><span class="text-xs font-bold text-slate-400"
                    >ĐỒNG</span
                  ></template
                >
              </a-input>
            </a-form-item>

            <a-alert
              v-if="errorMsg"
              type="error"
              show-icon
              :message="errorMsg"
              class="mb-4 rounded-xl"
            />
            <a-alert
              v-if="successMsg"
              type="success"
              show-icon
              :message="successMsg"
              class="mb-4 rounded-xl"
            />

            <a-button
              html-type="submit"
              type="primary"
              size="large"
              block
              :loading="isSubmitting"
              :disabled="!canSubmit"
              class="font-bold shadow-md shadow-orange-500/20"
            >
              Xác Nhận Rút Tiền
            </a-button>
          </a-form>
        </a-card>
      </a-col>

      <!-- History -->
      <a-col :xs="24" :lg="10">
        <a-card
          :bordered="false"
          class="rounded-2xl shadow-sm bg-white dark:bg-slate-900"
          title="Lịch Sử Biến Động Ví"
        >
          <a-skeleton active :loading="isHistoryLoading">
            <div
              v-if="historyList.length === 0"
              class="text-center py-8 text-slate-400 font-medium text-xs"
            >
              Chưa có thông tin biến động ví.
            </div>

            <div
              ref="historyContainerRef"
              class="flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1"
            >
              <div
                v-for="item in historyList"
                :key="item.id"
                class="p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-2"
              >
                <div class="flex items-center gap-3 overflow-hidden">
                  <div
                    class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold"
                    :class="
                      item.type === 'referral_commission'
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                        : item.type === 'point'
                        ? 'bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400'
                        : item.type === 'commission'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    "
                  >
                    <ShareAltOutlined
                      v-if="item.type === 'referral_commission'"
                    />
                    <GiftOutlined v-else-if="item.type === 'point'" />
                    <BankOutlined v-else-if="item.type === 'commission'" />
                    <WalletOutlined v-else />
                  </div>
                  <div class="min-w-0">
                    <div
                      class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                    >
                      {{
                        item.type === "referral_commission"
                          ? "Hoa hồng Giới thiệu"
                          : item.type === "point"
                          ? "Đổi thưởng S-Point"
                          : item.type === "commission"
                          ? "Hoàn tiền"
                          : "Rút tiền"
                      }}
                    </div>
                    <div
                      class="text-[11px] text-slate-400 truncate mt-0.5"
                      :title="item.account"
                    >
                      {{ item.account }}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">
                      {{ item.date }}
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end shrink-0">
                  <span
                    class="text-xs sm:text-sm font-black mb-1"
                    :class="
                      item.amount > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-800 dark:text-slate-100'
                    "
                  >
                    {{ item.amount > 0 ? "+" : "-"
                    }}{{ formatMoney(Math.abs(item.amount)) }}đ
                  </span>
                  <div class="flex items-center gap-1.5">
                    <a-button
                      v-if="
                        item.status !== 'completed' &&
                        item.status !== 'success' &&
                        item.status !== 'pending'
                      "
                      type="text"
                      size="small"
                      class="p-0 h-auto text-[10px] text-blue-500 hover:text-blue-600"
                      @click="showRejectReason(item.rejectReason)"
                    >
                      Lý do
                    </a-button>
                    <a-tag
                      :color="
                        item.status === 'completed' || item.status === 'success'
                          ? 'success'
                          : item.status === 'pending'
                          ? 'warning'
                          : 'error'
                      "
                      style="margin: 0"
                    >
                      {{
                        item.status === "completed" || item.status === "success"
                          ? "Thành công"
                          : item.status === "pending"
                          ? "Đang xử lý"
                          : "Đã hủy"
                      }}
                    </a-tag>
                  </div>
                </div>
              </div>

              <!-- Nút Xem thêm nằm ở cuối danh sách bên trong khung cuộn -->
              <div
                v-if="historyPage < historyTotalPages"
                class="flex justify-center mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0"
              >
                <a-button
                  type="text"
                  :disabled="isLoadMoreLoading"
                  @click="loadMoreHistory"
                  class="w-full h-10 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-orange-600 dark:text-orange-500 font-bold transition-all border border-transparent hover:border-orange-200 dark:hover:border-orange-900/30 flex items-center justify-center gap-2 shadow-sm"
                >
                  <LoadingOutlined
                    v-if="isLoadMoreLoading"
                    class="animate-spin text-sm"
                  />
                  <DownOutlined v-else class="text-[12px]" />
                  <span>{{
                    isLoadMoreLoading ? "Đang tải thêm dữ liệu..." : "Xem thêm"
                  }}</span>
                </a-button>
              </div>
            </div>
          </a-skeleton>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { usePromiseTracker } from "@/composables/usePromiseTracker";
import {
  BankOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  EditOutlined,
  WalletOutlined,
  ShareAltOutlined,
  GiftOutlined,
  DownOutlined,
  LoadingOutlined,
} from "@ant-design/icons-vue";
import { Modal } from "ant-design-vue";
import { useWallet } from "@/composables/useWallet";
import { useAuthStore } from "@/stores/auth";
import axios from "@/api/axios";

const { isLoading: isApiLoading } = usePromiseTracker();

onMounted(() => {
});

const { walletData, fetchWallet, isLoading: isWalletLoading } = useWallet();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const bankAccountInfo = ref(null);
const isBankLoading = ref(true);

const hasBankAccount = computed(() => {
  return !!(
    bankAccountInfo.value &&
    bankAccountInfo.value.bank_name &&
    bankAccountInfo.value.account_no
  );
});

const fetchBankAccount = async () => {
  if (!user.value?.id) {
    isBankLoading.value = false;
    return;
  }
  isBankLoading.value = true;
  try {
    const res = await axios.get(`/bank-account/${user.value.id}`);
    const bankData = res.data?.data;
    if (bankData && bankData.bank_name && bankData.account_no) {
      bankAccountInfo.value = bankData;
    } else {
      bankAccountInfo.value = null;
    }
  } catch (err) {
    console.error("Lỗi khi tải thông tin tài khoản ngân hàng:", err);
    bankAccountInfo.value = null;
  } finally {
    isBankLoading.value = false;
  }
};

const availableBalance = computed({
  get: () => walletData.value.availableBalance,
  set: (val) => {
    walletData.value.availableBalance = val;
  },
});
const pendingBalance = computed({
  get: () => walletData.value.pendingBalance,
  set: (val) => {
    walletData.value.pendingBalance = val;
  },
});
const totalWithdrawn = computed({
  get: () => walletData.value.totalPaid,
  set: (val) => {
    walletData.value.totalPaid = val;
  },
});

const withdrawAmount = ref("");
const isSubmitting = ref(false);
const successMsg = ref("");
const errorMsg = ref("");

const historyContainerRef = ref(null);
const historyPage = ref(1);
const historyTotalPages = ref(1);
const historyList = ref([]);
const isHistoryLoading = ref(true);
const isLoadMoreLoading = ref(false);

const fetchHistory = async (isLoadMore = false) => {
  if (isLoadMore) {
    if (isLoadMoreLoading.value) return;
    isLoadMoreLoading.value = true;
  } else {
    isHistoryLoading.value = true;
  }

  try {
    const res = await axios.get("/wallet/transactions", {
      params: { page: historyPage.value, limit: 10 },
    });
    const payload = res.data?.data || res.data;
    let dataArray = [];
    if (Array.isArray(payload)) {
      dataArray = payload;
    } else if (payload && Array.isArray(payload.data)) {
      dataArray = payload.data;
    } else if (payload && Array.isArray(payload.items)) {
      dataArray = payload.items;
    } else if (Array.isArray(res.data)) {
      dataArray = res.data;
    }

    const formattedData = dataArray.map((item) => ({
      id: item.id || Math.random(),
      type: item.type || "withdrawal",
      account: item.description || item.reference_id || `#${item.id}`,
      amount: Number(item.amount),
      date: item.created_at
        ? new Date(item.created_at).toLocaleString("vi-VN")
        : "",
      status: item.status,
      rejectReason: item.reject_reason || item.note || "",
      showReason: false,
    }));

    if (isLoadMore) {
      historyList.value = [...historyList.value, ...formattedData];
      nextTick(() => {
        if (historyContainerRef.value) {
          historyContainerRef.value.scrollTo({
            top: historyContainerRef.value.scrollHeight,
            behavior: "smooth",
          });
        }
      });
    } else {
      historyList.value = formattedData;
    }

    const lastPage = res.data?.data?.last_page || res.data?.last_page || 1;
    historyTotalPages.value = lastPage;
  } catch (err) {
    console.error("Lỗi khi tải lịch sử biến động ví:", err);
  } finally {
    isHistoryLoading.value = false;
    isLoadMoreLoading.value = false;
  }
};

const loadMoreHistory = () => {
  if (historyPage.value < historyTotalPages.value) {
    historyPage.value++;
    fetchHistory(true);
  }
};

onMounted(() => {
  fetchWallet();
  fetchBankAccount();
  fetchHistory();
});

const showRejectReason = (reason) => {
  Modal.info({
    title: "Lý do từ chối",
    content: reason || "Không có lý do cụ thể hoặc yêu cầu bị huỷ bỏ.",
    okText: "Đóng",
    centered: true,
  });
};

const formattedWithdrawAmount = computed({
  get: () => {
    if (withdrawAmount.value === "" || withdrawAmount.value === null) return "";
    return Number(withdrawAmount.value).toLocaleString("vi-VN");
  },
  set: (val) => {
    const digits = val.replace(/\D/g, "");
    withdrawAmount.value = digits ? Number(digits) : "";
  },
});

const amountError = computed(() => {
  if (withdrawAmount.value === "") return "";
  const amount = Number(withdrawAmount.value);
  if (amount < 10000) return "Số tiền rút tối thiểu là 10.000đ";
  if (amount > Number(availableBalance.value)) return "Số dư khả dụng không đủ";
  return "";
});

const canSubmit = computed(() => {
  return (
    !isSubmitting.value &&
    bankAccountInfo.value &&
    withdrawAmount.value !== "" &&
    amountError.value === ""
  );
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  successMsg.value = "";
  errorMsg.value = "";
  try {
    const res = await axios.post("/wallet/withdraw", {
      amount: Number(withdrawAmount.value),
    });
    availableBalance.value -= withdrawAmount.value;
    const transaction = res.data;

    historyList.value.unshift({
      id: transaction?.id || Date.now(),
      account:
        transaction?.reference_id ||
        transaction?.referenceId ||
        `#${transaction?.id || Date.now()}`,
      amount: withdrawAmount.value,
      date: new Date().toLocaleString("vi-VN"),
      status: "pending",
    });

    successMsg.value =
      "Yêu cầu rút tiền thành công! Hệ thống đang xử lý đối soát tự động.";
    withdrawAmount.value = "";

    fetchWallet();
    fetchHistory();
  } catch (error) {
    if (error?.response?.data?.message)
      errorMsg.value = error.response.data.message;
    else if (error?.message && error.message !== "Bad Request")
      errorMsg.value = error.message;
    else errorMsg.value = "Yêu cầu rút tiền bị từ chối. Vui lòng thử lại.";
  } finally {
    isSubmitting.value = false;
    setTimeout(() => {
      successMsg.value = "";
      errorMsg.value = "";
    }, 4000);
  }
};

const formatMoney = (val) => {
  return (val || 0).toLocaleString("vi-VN") + "đ";
};
</script>
