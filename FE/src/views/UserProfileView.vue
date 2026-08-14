<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  BankOutlined,
  EditOutlined,
  SaveOutlined,
  LogoutOutlined,
  SafetyCertificateOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons-vue'
import { api, clearAuthTokens, getSessionUser, type ApiResponse } from '../services/api'

interface VietQRBank {
  id: number
  name: string
  code: string
  bin: string
  shortName: string
  logo?: string
}

interface BankAccount {
  bankId: string
  bankName: string
  accountNo: string
  accountName: string
}

const router = useRouter()
const user = ref<any>(null)
const savedBank = ref<BankAccount | null>(null)
const editingBank = ref(false)
const loading = ref(false)
const savingBank = ref(false)
const loadingBanks = ref(false)
const banksList = ref<VietQRBank[]>([])

const bankForm = ref<BankAccount>({
  bankId: '',
  bankName: '',
  accountNo: '',
  accountName: '',
})

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

const loadUserData = async () => {
  loading.value = true
  try {
    user.value = await getSessionUser()
    const res = await api.get<ApiResponse<BankAccount>>('/api/user/bank-account')
    if (res.data.data) {
      savedBank.value = res.data.data
      bankForm.value = { ...res.data.data }
    }
  } catch {
    // Ignore error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUserData()
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

const handleLogout = () => {
  clearAuthTokens()
  message.info('Đã đăng xuất tài khoản')
  router.push('/login')
}
</script>

<template>
  <div class="space-y-3 sm:space-y-4 text-left">
    <!-- User Info Card -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#ee4d2d] to-[#ff5722] p-0.5 shrink-0 shadow-sm flex items-center justify-center text-white overflow-hidden">
        <img v-if="user?.image" :src="user.image" class="w-full h-full object-cover rounded-full" alt="Avatar" />
        <UserOutlined v-else class="text-2xl" />
      </div>

      <div class="flex-1 min-w-0">
        <h2 class="text-base font-extrabold text-slate-900 truncate">
          {{ user?.name || 'Khách hàng' }}
        </h2>
        <div class="flex items-center gap-1.5 mt-1">
          <span class="text-xs text-slate-400 font-medium">UID:</span>
          <span class="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
            {{ user?.id || '---' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Bank Account Settings Card (Moved from Wallet) -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
            <BankOutlined class="text-base" />
          </div>
          <div>
            <h3 class="text-sm sm:text-base font-black text-slate-900 leading-none m-0">Tài khoản nhận tiền</h3>
            <p class="text-[11px] text-slate-400 mt-1">Tài khoản ngân hàng dùng để nhận hoa hồng khi bạn rút tiền.</p>
          </div>
        </div>

        <button
          v-if="!editingBank && hasBankAccount"
          type="button"
          @click="startEditBank"
          class="text-xs font-bold text-[#ee4d2d] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <EditOutlined /> Sửa
        </button>
      </div>

      <!-- View Saved Bank -->
      <div v-if="!editingBank && hasBankAccount" class="space-y-2 pt-1">
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

      <!-- Empty Bank State -->
      <div v-else-if="!editingBank" class="py-6 text-center space-y-2">
        <div class="text-xs font-bold text-slate-700">Chưa thiết lập tài khoản nhận tiền</div>
        <p class="text-[11px] text-slate-400">Vui lòng thêm tài khoản ngân hàng để có thể thực hiện rút tiền.</p>
        <button
          type="button"
          @click="editingBank = true"
          class="h-9 px-4 rounded-xl bg-[#ee4d2d] text-white text-xs font-bold hover:bg-[#d83d1e] transition-all cursor-pointer shadow-xs mt-1"
        >
          + Thêm tài khoản ngân hàng
        </button>
      </div>

      <!-- Edit Bank Form -->
      <div v-else class="space-y-3 pt-2">
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

    <!-- Security Information -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <SafetyCertificateOutlined class="text-base" />
        </div>
        <div>
          <div class="text-xs font-bold text-slate-800">Bảo mật & Phiên đăng nhập</div>
          <div class="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
            <CheckCircleOutlined /> Đang được bảo vệ an toàn
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="pt-1">
      <button
        @click="handleLogout"
        type="button"
        class="w-full h-11 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
      >
        <LogoutOutlined class="text-sm" />
        <span>Đăng xuất tài khoản</span>
      </button>
    </div>
  </div>
</template>
