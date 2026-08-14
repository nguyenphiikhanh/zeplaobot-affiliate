<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  WalletOutlined,
  BankOutlined,
  EditOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface WalletInfo {
  availableBalance: number
  pendingBalance: number
  totalPaid: number
}

interface BankAccount {
  bankId: string
  bankName: string
  accountNo: string
  accountName: string
}

interface Transaction {
  id: number
  amount: number
  type: string
  status: string
  description: string
  createdAt: string
  referenceId?: string
}

interface VietQRBank {
  id: number
  name: string
  code: string
  bin: string
  shortName: string
  logo?: string
}

const loading = ref(false)
const savingBank = ref(false)
const withdrawing = ref(false)
const loadingBanks = ref(false)
const banksList = ref<VietQRBank[]>([])

const wallet = ref<WalletInfo>({
  availableBalance: 0,
  pendingBalance: 0,
  totalPaid: 0,
})

const savedBank = ref<BankAccount | null>(null)
const editingBank = ref(false)
const bankForm = ref<BankAccount>({
  bankId: '',
  bankName: '',
  accountNo: '',
  accountName: '',
})

const withdrawAmount = ref<number | null>(null)
const transactions = ref<Transaction[]>([])

const loadBanks = async () => {
  loadingBanks.value = true
  try {
    const res = await fetch('https://api.vietqr.io/v2/banks')
    const json = await res.json()
    if (json.data && Array.isArray(json.data)) {
      banksList.value = json.data
    }
  } catch (err) {
    console.error('Failed to load banks:', err)
  } finally {
    loadingBanks.value = false
  }
}

const bankOptions = computed(() => {
  return banksList.value.map((b) => ({
    value: b.bin || b.code,
    label: `${b.shortName || b.code} - ${b.name}`,
    name: b.shortName || b.name,
  }))
})

const hasBankAccount = computed(() => {
  return !!(savedBank.value?.bankName && savedBank.value?.accountNo && savedBank.value?.accountName)
})

const canWithdraw = computed(() => {
  const amt = Number(withdrawAmount.value || 0)
  return hasBankAccount.value && amt >= 10000 && amt <= wallet.value.availableBalance && !withdrawing.value
})

const formatMoney = (v: number) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(v || 0)) + 'đ'
}

const loadWalletData = async () => {
  loading.value = true
  try {
    const [wRes, bRes, tRes] = await Promise.all([
      api.get<ApiResponse<WalletInfo>>('/api/user/wallet'),
      api.get<ApiResponse<BankAccount>>('/api/user/bank-account'),
      api.get<ApiResponse<{ transactions: Transaction[] }>>('/api/user/wallet/transactions'),
    ])

    if (wRes.data.data) wallet.value = wRes.data.data
    if (bRes.data.data) {
      savedBank.value = bRes.data.data
      bankForm.value = { ...bRes.data.data }
    }
    if (tRes.data.data?.transactions) {
      transactions.value = tRes.data.data.transactions
    }
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể tải thông tin ví')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadWalletData()
  loadBanks()
})

const handleBankSelect = (val: string) => {
  const found = bankOptions.value.find((b) => b.value === val)
  bankForm.value.bankId = val
  bankForm.value.bankName = found?.name || val
}

const startEditBank = () => {
  if (savedBank.value) {
    bankForm.value = { ...savedBank.value }
  }
  editingBank.value = true
}

const cancelEditBank = () => {
  if (savedBank.value) {
    bankForm.value = { ...savedBank.value }
  }
  editingBank.value = false
}

const saveBankAccount = async () => {
  if (!bankForm.value.bankName || !bankForm.value.accountNo || !bankForm.value.accountName) {
    return message.warning('Vui lòng điền đầy đủ thông tin ngân hàng!')
  }
  savingBank.value = true
  try {
    const res = await api.put<ApiResponse<BankAccount>>('/api/user/bank-account', {
      bankId: bankForm.value.bankId,
      bankName: bankForm.value.bankName,
      accountNo: bankForm.value.accountNo.trim(),
      accountName: bankForm.value.accountName.trim().toUpperCase(),
    })
    savedBank.value = res.data.data || { ...bankForm.value }
    editingBank.value = false
    message.success('Đã lưu thông tin tài khoản ngân hàng thành công!')
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Lỗi khi lưu tài khoản ngân hàng')
  } finally {
    savingBank.value = false
  }
}

const setWithdrawAll = () => {
  withdrawAmount.value = wallet.value.availableBalance
}

const handleWithdraw = async () => {
  if (!canWithdraw.value) return
  withdrawing.value = true
  try {
    await api.post('/api/user/wallet/withdraw', {
      amount: Number(withdrawAmount.value),
    })
    message.success('Đã tạo yêu cầu rút tiền thành công!')
    withdrawAmount.value = null
    await loadWalletData()
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể tạo yêu cầu rút tiền')
  } finally {
    withdrawing.value = false
  }
}

const getTxStatus = (status: string) => {
  if (status === 'success' || status === 'completed') return { label: 'Thành công', class: 'bg-emerald-50 text-emerald-600' }
  if (status === 'rejected' || status === 'cancelled') return { label: 'Từ chối', class: 'bg-rose-50 text-rose-600' }
  return { label: 'Đang xử lý', class: 'bg-amber-50 text-amber-600' }
}
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4 text-left">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2.5 text-slate-900 font-extrabold text-base sm:text-lg">
          <div class="w-8 h-8 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
            <WalletOutlined class="text-base" />
          </div>
          <h2 class="text-base sm:text-lg font-black text-slate-900 leading-none m-0">Ví Tiền & Rút Hoa Hồng</h2>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">
          Quản lý số dư hoa hồng khả dụng, tài khoản ngân hàng nhận tiền và lịch sử giao dịch.
        </p>
      </div>

      <button
        type="button"
        @click="loadWalletData"
        :disabled="loading"
        class="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95 transition-all"
      >
        <ReloadOutlined :class="{ 'animate-spin': loading }" />
        <span class="hidden sm:inline">Làm mới</span>
      </button>
    </div>

    <!-- 3 Wallet Balance Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
      <!-- 1. Available Balance -->
      <div class="rounded-2xl bg-gradient-to-tr from-[#ee4d2d] to-[#ff5722] p-4 text-white shadow-md relative overflow-hidden flex flex-col justify-between min-h-[100px]">
        <div class="text-xs font-bold text-orange-100">Số dư khả dụng</div>
        <div class="text-2xl sm:text-3xl font-black mt-1">{{ formatMoney(wallet.availableBalance) }}</div>
        <div class="text-[10px] text-orange-100/90 mt-1">Sẵn sàng để rút về tài khoản</div>
      </div>

      <!-- 2. Pending Balance -->
      <div class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[100px]">
        <div class="text-xs font-bold text-slate-400">Đang chờ duyệt</div>
        <div class="text-xl sm:text-2xl font-black text-amber-600 mt-1">{{ formatMoney(wallet.pendingBalance) }}</div>
        <div class="text-[10px] text-slate-400 mt-1">Đơn đang trong thời gian chờ Shopee đối soát</div>
      </div>

      <!-- 3. Total Paid -->
      <div class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[100px]">
        <div class="text-xs font-bold text-slate-400">Đã thanh toán</div>
        <div class="text-xl sm:text-2xl font-black text-emerald-600 mt-1">{{ formatMoney(wallet.totalPaid) }}</div>
        <div class="text-[10px] text-slate-400 mt-1">Tổng hoa hồng đã chuyển vào STK</div>
      </div>
    </div>

    <!-- 2 Columns: Bank Account + Withdraw Form -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <!-- Bank Account Card -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
                <BankOutlined class="text-sm" />
              </div>
              <h3 class="text-sm font-black text-slate-800 leading-none m-0">Tài khoản nhận tiền</h3>
            </div>

            <button
              v-if="!editingBank && hasBankAccount"
              type="button"
              @click="startEditBank"
              class="text-xs font-bold text-[#ee4d2d] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <EditOutlined /> Sửa
            </button>
          </div>

          <!-- View Saved Bank -->
          <div v-if="!editingBank && hasBankAccount" class="space-y-2.5">
            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <div class="text-[10px] font-bold text-slate-400 uppercase">Ngân hàng</div>
              <div class="text-xs font-bold text-slate-800 mt-0.5">{{ savedBank?.bankName }}</div>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <div class="text-[10px] font-bold text-slate-400 uppercase">Số tài khoản</div>
              <div class="text-xs font-mono font-bold text-slate-800 mt-0.5">{{ savedBank?.accountNo }}</div>
            </div>

            <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
              <div class="text-[10px] font-bold text-slate-400 uppercase">Chủ tài khoản</div>
              <div class="text-xs font-bold text-slate-800 mt-0.5">{{ savedBank?.accountName }}</div>
            </div>
          </div>

          <!-- Empty Bank state -->
          <div v-else-if="!editingBank" class="py-8 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-orange-50 text-[#ee4d2d] flex items-center justify-center mx-auto text-xl">
              <BankOutlined />
            </div>
            <div class="text-xs font-bold text-slate-700">Chưa thiết lập tài khoản nhận tiền</div>
            <button
              type="button"
              @click="editingBank = true"
              class="h-9 px-4 rounded-xl bg-[#ee4d2d] text-white text-xs font-bold hover:bg-[#d83d1e] transition-all cursor-pointer shadow-xs"
            >
              + Thêm tài khoản ngân hàng
            </button>
          </div>

          <!-- Edit Bank Form -->
          <div v-else class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Chọn Ngân hàng</label>
              <a-select
                show-search
                option-filter-prop="label"
                :value="bankForm.bankId || undefined"
                class="w-full"
                placeholder="Chọn ngân hàng..."
                :options="bankOptions"
                @change="handleBankSelect"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Số tài khoản</label>
              <input
                v-model="bankForm.accountNo"
                type="text"
                placeholder="Nhập số tài khoản..."
                class="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Tên chủ tài khoản (Viết hoa không dấu)</label>
              <input
                v-model="bankForm.accountName"
                type="text"
                placeholder="NGUYEN VAN A"
                class="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold uppercase focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div class="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                @click="cancelEditBank"
                class="h-9 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-600 transition cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                @click="saveBankAccount"
                :disabled="savingBank"
                class="h-9 rounded-xl bg-[#ee4d2d] hover:bg-[#d83d1e] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SaveOutlined />
                <span>{{ savingBank ? 'Đang lưu...' : 'Lưu tài khoản' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Withdraw Form Card -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div class="space-y-3">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
              <WalletOutlined class="text-sm" />
            </div>
            <h3 class="text-sm font-black text-slate-800 leading-none m-0">Tạo yêu cầu rút tiền</h3>
          </div>

          <div>
            <div class="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Số tiền muốn rút</span>
              <button
                type="button"
                @click="setWithdrawAll"
                :disabled="wallet.availableBalance < 10000"
                style="color: #ee4d2d !important;"
                class="text-[11px] font-black !text-[#ee4d2d] hover:!text-[#d73211] active:opacity-80 cursor-pointer disabled:!text-slate-300 transition-colors select-none"
              >
                RÚT TẤT CẢ
              </button>
            </div>

            <div class="relative mb-2.5">
              <input
                v-model.number="withdrawAmount"
                type="number"
                min="10000"
                :max="wallet.availableBalance"
                placeholder="0"
                class="w-full h-11 px-3.5 pr-14 rounded-xl bg-slate-50 border border-slate-200 text-base font-black text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
              <span class="absolute right-3.5 top-3 text-xs font-bold text-slate-400 pointer-events-none">VNĐ</span>
            </div>
            <p class="text-[11px] text-slate-400 font-medium mb-3 pl-0.5">
              * Tối thiểu 10.000đ · Miễn phí rút tiền
            </p>
          </div>
        </div>

        <div class="pt-4">
          <div v-if="!hasBankAccount" class="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-700 font-medium mb-3">
            ⚠️ Vui lòng thiết lập tài khoản ngân hàng trước khi rút tiền.
          </div>

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
            {{ withdrawing ? 'Đang xử lý...' : 'Xác nhận rút tiền' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Transaction History Card -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-black text-slate-800">Lịch sử biến động ví & Rút tiền</h3>
        <span class="text-xs text-slate-400 font-medium">{{ transactions.length }} giao dịch</span>
      </div>

      <div v-if="transactions.length" class="divide-y divide-slate-100">
        <div
          v-for="tx in transactions"
          :key="tx.id"
          class="py-3 flex items-center justify-between gap-3"
        >
          <div class="space-y-0.5 min-w-0 flex-1">
            <div class="text-xs font-bold text-slate-800 truncate">
              {{ tx.description || (tx.type === 'withdraw' ? 'Yêu cầu rút tiền' : 'Cộng hoa hồng đơn hàng') }}
            </div>
            <div class="text-[10px] text-slate-400">
              {{ new Date(tx.createdAt).toLocaleString('vi-VN') }}
            </div>
          </div>

          <div class="text-right shrink-0 flex flex-col items-end gap-1">
            <div :class="['text-xs sm:text-sm font-black', tx.amount >= 0 ? 'text-emerald-600' : 'text-slate-900']">
              {{ tx.amount >= 0 ? '+' : '-' }}{{ formatMoney(Math.abs(tx.amount)) }}
            </div>
            <span :class="['px-2 py-0.5 rounded-full text-[9px] font-bold', getTxStatus(tx.status).class]">
              {{ getTxStatus(tx.status).label }}
            </span>
          </div>
        </div>
      </div>

      <div v-else class="py-8 text-center space-y-1">
        <div class="text-xs font-bold text-slate-600">Chưa có lịch sử giao dịch</div>
        <p class="text-[11px] text-slate-400">Các yêu cầu rút tiền và cộng hoa hồng sẽ hiển thị ở đây.</p>
      </div>
    </div>
  </div>
</template>
