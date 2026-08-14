<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  WalletOutlined,
  BankOutlined,
  ReloadOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

interface WalletInfo {
  availableBalance: number;
  pendingBalance: number;
  totalPaid: number;
}

interface BankAccount {
  bankId: string;
  bankName: string;
  accountNo: string;
  accountName: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  status: string;
  description: string;
  createdAt: string;
  referenceId?: string;
}

const router = useRouter();
const loading = ref(false);
const withdrawing = ref(false);

const wallet = ref<WalletInfo>({
  availableBalance: 0,
  pendingBalance: 0,
  totalPaid: 0,
});

const savedBank = ref<BankAccount | null>(null);
const withdrawAmount = ref<number | null>(null);
const displayAmount = ref<string>("");
const transactions = ref<Transaction[]>([]);

const hasBankAccount = computed(() => {
  return !!(
    savedBank.value?.bankName &&
    savedBank.value?.accountNo &&
    savedBank.value?.accountName
  );
});

const canWithdraw = computed(() => {
  const amt = Number(withdrawAmount.value || 0);
  return (
    hasBankAccount.value &&
    amt >= 10000 &&
    amt <= wallet.value.availableBalance &&
    !withdrawing.value
  );
});

const maskAccountNumber = (accNo?: string | null) => {
  if (!accNo) return '';
  const str = String(accNo).trim();
  if (str.length <= 4) return '****';
  return `****${str.slice(-4)}`;
};

const formatMoney = (v: number) => {
  return new Intl.NumberFormat("vi-VN").format(Math.round(v || 0)) + "đ";
};

interface VietQRBank {
  id: number
  name: string
  code: string
  bin: string
  shortName: string
}

const banksList = ref<VietQRBank[]>([])

const loadBanks = async () => {
  try {
    const res = await fetch('https://api.vietqr.io/v2/banks')
    const json = await res.json()
    if (json.data && Array.isArray(json.data)) {
      banksList.value = json.data
    }
  } catch (err) {
    console.error('Failed to load banks:', err)
  }
}

const displayBankCode = computed(() => {
  if (!savedBank.value) return ''
  const id = String(savedBank.value.bankId || '').trim()
  const name = String(savedBank.value.bankName || '').trim()

  const found = banksList.value.find(
    (b) =>
      b.code?.toUpperCase() === id.toUpperCase() ||
      b.bin === id ||
      b.shortName?.toUpperCase() === name.toUpperCase() ||
      b.code?.toUpperCase() === name.toUpperCase()
  )
  if (found && found.code) {
    return found.code.toUpperCase()
  }
  return (id || name).toUpperCase()
})

const loadWalletData = async () => {
  loading.value = true;
  try {
    const [wRes, bRes, tRes] = await Promise.all([
      api.get<ApiResponse<WalletInfo>>("/api/user/wallet"),
      api.get<ApiResponse<BankAccount>>("/api/user/bank-account"),
      api.get<ApiResponse<{ transactions: Transaction[] }>>(
        "/api/user/wallet/transactions"
      ),
    ]);

    if (wRes.data.data) wallet.value = wRes.data.data;
    if (bRes.data.data) savedBank.value = bRes.data.data;
    if (tRes.data.data?.transactions) {
      transactions.value = tRes.data.data.transactions;
    }
  } catch (error: any) {
    message.error(
      error.response?.data?.message || "Không thể tải thông tin ví"
    );
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWalletData();
  loadBanks();
});

const handleAmountInput = (e: Event) => {
  const input = e.target as HTMLInputElement;
  const rawDigits = input.value.replace(/\D/g, "");
  if (!rawDigits) {
    withdrawAmount.value = null;
    displayAmount.value = "";
    return;
  }
  const num = parseInt(rawDigits, 10);
  withdrawAmount.value = num;
  displayAmount.value = new Intl.NumberFormat("vi-VN").format(num);
};

const setWithdrawAll = () => {
  if (wallet.value.availableBalance >= 10000) {
    withdrawAmount.value = wallet.value.availableBalance;
    displayAmount.value = new Intl.NumberFormat("vi-VN").format(
      wallet.value.availableBalance
    );
  }
};

const handleWithdraw = async () => {
  if (!canWithdraw.value) return;
  withdrawing.value = true;
  try {
    await api.post("/api/user/wallet/withdraw", {
      amount: Number(withdrawAmount.value),
    });
    message.success("Đã tạo yêu cầu rút tiền thành công!");
    withdrawAmount.value = null;
    displayAmount.value = "";
    await loadWalletData();
  } catch (error: any) {
    message.error(
      error.response?.data?.message || "Không thể tạo yêu cầu rút tiền"
    );
  } finally {
    withdrawing.value = false;
  }
};

const getTxStatus = (status: string) => {
  if (status === "success" || status === "completed")
    return { label: "Thành công", class: "bg-emerald-50 text-emerald-600" };
  if (status === "rejected" || status === "cancelled")
    return { label: "Từ chối", class: "bg-rose-50 text-rose-600" };
  return { label: "Đang xử lý", class: "bg-amber-50 text-amber-600" };
};
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4 text-left">
    <!-- Header Banner Card -->
    <div
      class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3"
    >
      <div class="space-y-1">
        <div
          class="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg sm:text-xl"
        >
          <div
            class="w-8.5 h-8.5 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0"
          >
            <WalletOutlined class="text-lg" />
          </div>
          <h2
            class="text-lg sm:text-xl font-black text-slate-950 leading-none m-0 tracking-tight"
            style="-webkit-text-stroke: 0.2px currentColor; font-weight: 900"
          >
            Ví Tiền & Rút Hoa Hồng
          </h2>
        </div>
        <p
          class="text-sm sm:text-base text-slate-600 font-bold leading-relaxed pt-0.5"
        >
          Quản lý số dư hoa hồng khả dụng, thực hiện rút tiền và theo dõi lịch
          sử biến động ví.
        </p>
      </div>

      <button
        type="button"
        @click="loadWalletData"
        :disabled="loading"
        class="h-9.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all shrink-0"
      >
        <ReloadOutlined :class="{ 'animate-spin': loading }" />
        <span class="hidden sm:inline">Làm mới</span>
      </button>
    </div>

    <!-- 3 Wallet Balance Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
      <!-- 1. Available Balance -->
      <div
        class="rounded-2xl bg-gradient-to-tr from-[#ee4d2d] to-[#ff5722] p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[100px]"
      >
        <div
          class="text-sm sm:text-base font-black text-white uppercase tracking-wider"
          style="-webkit-text-stroke: 0.15px currentColor"
        >
          Số dư hoa hồng khả dụng
        </div>
        <div v-if="loading" class="h-8 w-32 bg-white/30 rounded-md animate-pulse my-1"></div>
        <div v-else class="text-2xl sm:text-3xl font-black mt-1">
          {{ formatMoney(wallet.availableBalance) }}
        </div>
        <div class="text-[10px] text-orange-100/90 mt-1">
          Sẵn sàng để rút về tài khoản
        </div>
      </div>

      <!-- 2. Pending Balance -->
      <div
        class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[100px]"
      >
        <div class="text-xs font-bold text-slate-400">Đang chờ duyệt</div>
        <div v-if="loading" class="h-7 w-28 bg-slate-200 rounded-md animate-pulse my-auto pt-1"></div>
        <div v-else class="text-xl sm:text-2xl font-black text-amber-600 my-auto pt-1">
          {{ formatMoney(wallet.pendingBalance) }}
        </div>
      </div>

      <!-- 3. Total Paid -->
      <div
        class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[100px]"
      >
        <div class="text-xs font-bold text-slate-400">Đã thanh toán</div>
        <div v-if="loading" class="h-7 w-28 bg-slate-200 rounded-md animate-pulse my-auto pt-1"></div>
        <div v-else class="text-xl sm:text-2xl font-black text-emerald-600 my-auto pt-1">
          {{ formatMoney(wallet.totalPaid) }}
        </div>
      </div>
    </div>

    <!-- Withdraw Form Card -->
    <div
      class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8.5 h-8.5 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0"
        >
          <WalletOutlined class="text-lg" />
        </div>
        <h3
          class="text-base sm:text-lg font-black text-slate-950 leading-none m-0 tracking-tight translate-y-[1.5px]"
          style="-webkit-text-stroke: 0.2px currentColor; font-weight: 900"
        >
          Tạo yêu cầu rút tiền
        </h3>
      </div>

      <!-- Recipient Bank Account Card -->
      <div
        class="p-3 sm:p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <div
            class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"
          >
            <BankOutlined class="text-base" />
          </div>
          <div v-if="loading" class="min-w-0 flex-1 space-y-1">
            <div class="h-3 w-20 bg-slate-200 rounded-md animate-pulse"></div>
            <div class="h-4 w-36 bg-slate-200 rounded-md animate-pulse"></div>
          </div>
          <div v-else-if="hasBankAccount" class="min-w-0 flex-1">
            <div class="text-[10px] font-bold text-slate-400 uppercase">
              Tài khoản nhận tiền
            </div>
            <div class="text-xs sm:text-sm font-bold text-slate-800 truncate">
              {{ displayBankCode }} - {{ maskAccountNumber(savedBank?.accountNo) }}
            </div>
          </div>
          <div v-else class="min-w-0 flex-1">
            <div class="text-xs font-bold text-amber-600">
              Chưa thiết lập tài khoản ngân hàng
            </div>
            <div class="text-[11px] text-slate-400">
              Vui lòng cài đặt tài khoản để nhận tiền hoa hồng
            </div>
          </div>
        </div>

        <router-link
          to="/profile"
          class="text-xs font-bold text-[#ee4d2d] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>{{ hasBankAccount ? "Đổi tài khoản" : "Cài đặt ngay" }}</span>
          <RightOutlined class="text-[10px]" />
        </router-link>
      </div>

      <!-- Amount Input -->
      <div>
        <div
          class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5"
        >
          <span>Số tiền muốn rút</span>
          <button
            type="button"
            @click="setWithdrawAll"
            :disabled="wallet.availableBalance < 10000"
            style="color: #ee4d2d !important"
            class="text-[11px] font-black !text-[#ee4d2d] hover:!text-[#d73211] active:opacity-80 cursor-pointer disabled:!text-slate-300 transition-colors select-none"
          >
            RÚT TẤT CẢ
          </button>
        </div>

        <div class="relative mb-2">
          <input
            :value="displayAmount"
            @input="handleAmountInput"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="w-full h-11 px-3.5 pr-14 rounded-xl bg-slate-50 border border-slate-200 text-base font-black text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
          />
          <span
            class="absolute right-3.5 top-3 text-xs font-bold text-slate-400 pointer-events-none"
            >VNĐ</span
          >
        </div>
        <p class="text-[11px] text-slate-400 font-medium pl-0.5">
          * Tối thiểu 10.000đ · Miễn phí rút tiền
        </p>
      </div>

      <div class="pt-2">
        <button
          type="button"
          @click="handleWithdraw"
          :disabled="!canWithdraw"
          :class="[
            'w-full h-11 rounded-xl text-xs sm:text-sm font-black transition-all select-none flex items-center justify-center text-white',
            canWithdraw
              ? 'bg-[#ee4d2d] hover:bg-[#d83d1e] shadow-md shadow-orange-500/20 active:scale-[0.98] cursor-pointer'
              : '!bg-[#ee4d2d]/35 !text-white/70 cursor-not-allowed shadow-none',
          ]"
        >
          {{ withdrawing ? "Đang xử lý..." : "Xác nhận rút tiền" }}
        </button>
      </div>
    </div>

    <!-- Transaction History Card -->
    <div
      class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3"
    >
      <div class="flex items-center justify-between">
        <h3
          class="text-base sm:text-lg font-black text-slate-950 leading-none m-0 tracking-tight"
          style="-webkit-text-stroke: 0.2px currentColor; font-weight: 900"
        >
          Lịch sử biến động ví & Rút tiền
        </h3>
        <span v-if="loading" class="h-3.5 w-20 bg-slate-200 rounded-md animate-pulse inline-block"></span>
        <span v-else class="text-xs text-slate-400 font-medium"
          >{{ transactions.length }} giao dịch</span
        >
      </div>

      <div v-if="loading" class="divide-y divide-slate-100 animate-pulse">
        <div v-for="n in 3" :key="n" class="py-3 flex items-center justify-between gap-3">
          <div class="space-y-1 flex-1">
            <div class="h-3.5 bg-slate-200 rounded-md w-1/2"></div>
            <div class="h-3 bg-slate-100 rounded-md w-1/3"></div>
          </div>
          <div class="h-4 bg-slate-200 rounded-md w-16"></div>
        </div>
      </div>

      <div v-else-if="transactions.length" class="divide-y divide-slate-100">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="py-3 flex items-center justify-between gap-3"
        >
          <div class="space-y-0.5 min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate">
              {{
                tx.description ||
                (tx.type === "withdraw"
                  ? "Yêu cầu rút tiền"
                  : "Cộng hoa hồng đơn hàng")
              }}
            </div>
            <div class="text-[10px] text-slate-400">
              {{ new Date(tx.createdAt).toLocaleString("vi-VN") }}
            </div>
          </div>

          <div class="text-right shrink-0 flex flex-col items-end gap-1">
            <div
              :class="[
                'text-xs sm:text-sm font-black',
                tx.amount >= 0 ? 'text-emerald-600' : 'text-slate-900',
              ]"
            >
              {{ tx.amount >= 0 ? "+" : "-"
              }}{{ formatMoney(Math.abs(tx.amount)) }}
            </div>
            <span
              :class="[
                'px-2 py-0.5 rounded-full text-[9px] font-bold',
                getTxStatus(tx.status).class,
              ]"
            >
              {{ getTxStatus(tx.status).label }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="py-8 text-center space-y-1">
        <div class="text-xs font-bold text-slate-600">
          Chưa có lịch sử giao dịch
        </div>
        <p class="text-[11px] text-slate-400">
          Các yêu cầu rút tiền và cộng hoa hồng sẽ hiển thị ở đây.
        </p>
      </div>
    </div>
  </div>
</template>
