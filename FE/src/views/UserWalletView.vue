<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { message } from 'ant-design-vue'
import { BankOutlined, CloseOutlined, DollarCircleOutlined, EditOutlined, SaveOutlined, WalletOutlined } from '@ant-design/icons-vue'
import UserPageLayout from '../components/UserPageLayout.vue'
import { api, type ApiResponse } from '../services/api'

type Wallet = { availableBalance: number; pendingBalance: number; totalPaid: number }
type BankAccount = { bankId: string; bankName: string; accountNo: string; accountName: string }
type VietQrBank = { bin: string; code: string; shortName?: string; short_name?: string; name: string; logo?: string }
type Transaction = { id: number; amount: number; status: string; referenceId: string | null; description: string | null; createdAt: string }

const fallbackBanks: VietQrBank[] = [
  { bin: '970422', code: 'MB', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân Đội' },
  { bin: '970436', code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
  { bin: '970407', code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam' },
  { bin: '970416', code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
  { bin: '970418', code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
]

const wallet = ref<Wallet>({ availableBalance: 0, pendingBalance: 0, totalPaid: 0 })
const bank = ref<BankAccount>({ bankId: '', bankName: '', accountNo: '', accountName: '' })
const savedBank = ref<BankAccount | null>(null)
const banks = ref<VietQrBank[]>([])
const history = ref<Transaction[]>([])
const loading = ref(true)
const saving = ref(false)
const withdrawing = ref(false)
const editingBank = ref(false)
const amount = ref<number | undefined>()

const bankOptions = computed(() => (banks.value.length ? banks.value : fallbackBanks).map(item => ({
  value: item.bin,
  label: `${item.shortName || item.short_name || item.code} - ${item.name}`,
})))

const ownerError = computed(() => {
  const owner = bank.value.accountName.trim()
  if (!owner) return ''
  return owner.length > 35 || !/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(owner)
    ? 'Tên chủ tài khoản phải viết không dấu và tối đa 35 ký tự.' : ''
})
const accountError = computed(() => {
  const account = bank.value.accountNo.trim()
  return account && !/^\d{5,20}$/.test(account) ? 'Số tài khoản phải gồm 5–20 chữ số.' : ''
})
const hasBankAccount = computed(() => Boolean(savedBank.value?.bankId && savedBank.value.accountNo && savedBank.value.accountName))
const amountError = computed(() => {
  if (amount.value === undefined) return ''
  if (amount.value < 10000) return 'Số tiền rút tối thiểu là 10.000đ'
  if (amount.value > wallet.value.availableBalance) return 'Số dư khả dụng không đủ'
  return ''
})
const canWithdraw = computed(() => !loading.value && !withdrawing.value && hasBankAccount.value && amount.value !== undefined && !amountError.value)

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.abs(value || 0))}đ`
const chooseBank = (bankId: string) => {
  const item = (banks.value.length ? banks.value : fallbackBanks).find(entry => entry.bin === bankId)
  bank.value.bankId = bankId
  bank.value.bankName = item?.name || ''
}
const withdrawAll = () => { amount.value = wallet.value.availableBalance || undefined }
const editBank = () => {
  bank.value = savedBank.value ? { ...savedBank.value } : { bankId: '', bankName: '', accountNo: '', accountName: '' }
  editingBank.value = true
}
const cancelBankEdit = () => {
  bank.value = savedBank.value ? { ...savedBank.value } : { bankId: '', bankName: '', accountNo: '', accountName: '' }
  editingBank.value = false
}

async function loadBanks() {
  try {
    const response = await fetch('https://api.vietqr.io/v2/banks')
    const result = await response.json()
    if (result?.code === '00' && Array.isArray(result.data)) banks.value = result.data
  } catch { banks.value = [] }
}

async function load() {
  loading.value = true
  try {
    const [walletResult, bankResult, historyResult] = await Promise.all([
      api.get<ApiResponse<Wallet>>('/api/user/wallet'),
      api.get<ApiResponse<BankAccount | null>>('/api/user/bank-account'),
      api.get<ApiResponse<{ transactions: Transaction[] }>>('/api/user/wallet/transactions'),
    ])
    if (walletResult.data.data) wallet.value = walletResult.data.data
    if (bankResult.data.data) {
      savedBank.value = { ...bankResult.data.data }
      bank.value = { ...bankResult.data.data }
    } else {
      savedBank.value = null
      editingBank.value = false
    }
    history.value = historyResult.data.data?.transactions || []
  } catch { message.error('Không thể tải thông tin ví.') }
  finally { loading.value = false }
}

async function saveBank() {
  if (!bank.value.bankId || !bank.value.accountNo || !bank.value.accountName) return message.warning('Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.')
  if (ownerError.value || accountError.value) return
  saving.value = true
  try {
    const response = await api.put<ApiResponse<BankAccount>>('/api/user/bank-account', {
      bank_id: bank.value.bankId, bank_name: bank.value.bankName,
      account_no: bank.value.accountNo.trim(), account_name: bank.value.accountName.trim(),
    })
    if (response.data.data) {
      savedBank.value = { ...response.data.data }
      bank.value = { ...response.data.data }
    }
    editingBank.value = false
    message.success('Đã lưu tài khoản ngân hàng.')
  } catch (error: any) { message.error(error.response?.data?.message || 'Không thể lưu tài khoản.') }
  finally { saving.value = false }
}

async function withdraw() {
  if (!canWithdraw.value) return
  withdrawing.value = true
  try {
    await api.post('/api/user/wallet/withdraw', { amount: amount.value })
    message.success('Tạo yêu cầu rút tiền thành công.')
    amount.value = undefined
    await load()
  } catch (error: any) { message.error(error.response?.data?.message || 'Không thể rút tiền.') }
  finally { withdrawing.value = false }
}

onMounted(async () => { await Promise.all([loadBanks(), load()]) })
</script>

<template>
  <UserPageLayout>
    <a-spin :spinning="loading">
      <div class="space-y-6">
        <div><h1 class="text-2xl font-black text-slate-900">Ví của <span class="text-[#ee4d2d]">bạn</span></h1><p class="mt-1 text-sm text-slate-500">Quản lý số dư, tài khoản nhận tiền và lịch sử giao dịch.</p></div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div v-for="item in [{ label: 'Số dư khả dụng', value: wallet.availableBalance }, { label: 'Đang chờ rút', value: wallet.pendingBalance }, { label: 'Tổng đã rút', value: wallet.totalPaid }]" :key="item.label" class="rounded-2xl bg-white p-5 shadow-sm"><WalletOutlined class="text-xl !text-[#ee4d2d]"/><div class="mt-3 text-xs font-bold text-slate-500">{{ item.label }}</div><div class="mt-1 text-2xl font-black text-slate-900">{{ money(item.value) }}</div></div>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <a-card :bordered="false" class="bank-account-card h-full !rounded-2xl">
            <div class="mb-5 flex items-center justify-between gap-3">
              <h3 class="flex items-center gap-2 text-sm font-black"><BankOutlined class="!text-[#ee4d2d]"/> Tài khoản ngân hàng</h3>
              <button v-if="!editingBank" type="button" class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-[#ee4d2d] transition hover:bg-orange-50" @click="editBank"><EditOutlined/> {{ hasBankAccount ? 'Chỉnh sửa' : 'Thiết lập' }}</button>
            </div>

            <div v-if="!editingBank && savedBank" class="space-y-3">
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-4"><div class="text-[10px] font-bold uppercase text-slate-400">Ngân hàng</div><div class="mt-1 text-sm font-bold text-slate-800">{{ savedBank.bankName }}</div></div>
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-4"><div class="text-[10px] font-bold uppercase text-slate-400">Số tài khoản</div><div class="mt-1 text-sm font-bold text-slate-800">{{ savedBank.accountNo }}</div></div>
              <div class="rounded-xl border border-slate-100 bg-slate-50 p-4"><div class="text-[10px] font-bold uppercase text-slate-400">Tên chủ tài khoản</div><div class="mt-1 text-sm font-bold text-slate-800">{{ savedBank.accountName }}</div></div>
            </div>
            <div v-else-if="!editingBank" class="flex min-h-[270px] w-full flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center"><BankOutlined class="mb-3 text-3xl !text-slate-300"/><div class="text-sm font-bold text-slate-500">Chưa thiết lập</div><div class="mt-1 text-xs text-slate-400">Thiết lập tài khoản để có thể rút tiền.</div></div>

            <div v-else class="space-y-4">
              <div><label class="mb-1.5 block text-xs font-bold text-slate-600">Ngân hàng</label><a-select show-search option-filter-prop="label" :value="bank.bankId || undefined" class="w-full" placeholder="Chọn ngân hàng" :options="bankOptions" @change="chooseBank"/></div>
              <div><label class="mb-1.5 block text-xs font-bold text-slate-600">Số tài khoản</label><a-input v-model:value="bank.accountNo" placeholder="Nhập số tài khoản" :status="accountError ? 'error' : ''"/><p v-if="accountError" class="mt-1.5 text-xs text-rose-600">{{ accountError }}</p></div>
              <div><label class="mb-1.5 block text-xs font-bold text-slate-600">Tên chủ tài khoản</label><a-input v-model:value="bank.accountName" maxlength="35" placeholder="NGUYEN VAN A" class="uppercase" :status="ownerError ? 'error' : ''"/><p v-if="ownerError" class="mt-1.5 text-xs text-rose-600">{{ ownerError }}</p><p v-else class="mt-1.5 text-[11px] text-slate-400">Viết không dấu, tối đa 35 ký tự.</p></div>
              <div class="bank-form-actions grid grid-cols-2 gap-3 pt-2"><a-button block :disabled="saving" class="bank-form-button bank-form-button--cancel" @click="cancelBankEdit"><CloseOutlined/> <span>Hủy</span></a-button><a-button type="primary" block :loading="saving" :disabled="saving || !!ownerError || !!accountError" class="bank-form-button" @click="saveBank"><SaveOutlined/> <span>Lưu</span></a-button></div>
            </div>
          </a-card>

          <a-card :bordered="false" class="withdraw-card h-full !rounded-2xl">
            <div class="mb-5 flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#ee4d2d]"><DollarCircleOutlined class="text-xl"/></div>
              <div><h3 class="text-sm font-black text-slate-900">Tạo yêu cầu rút tiền</h3><p class="mt-1 text-xs leading-5 text-slate-400">Tiền sẽ được duyệt và chuyển tới tài khoản đã lưu.</p></div>
            </div>

            <div class="mt-2">
              <div class="mb-2 flex items-end justify-between gap-3"><div><label class="block text-xs font-bold text-slate-700">Số tiền muốn rút</label><span class="mt-1 block text-[10px] text-slate-400">Khả dụng: {{ money(wallet.availableBalance) }}</span></div><button type="button" :disabled="loading || withdrawing || !hasBankAccount || wallet.availableBalance <= 0" class="rounded-lg bg-orange-50 px-3 py-2 text-[10px] font-black text-[#ee4d2d] transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300" @click="withdrawAll">RÚT TOÀN BỘ</button></div>
              <a-input-number v-model:value="amount" :min="0" :controls="false" :disabled="loading || withdrawing || !hasBankAccount" class="withdraw-amount-input !w-full" size="large" placeholder="0" :formatter="(value: any) => value ? Number(value).toLocaleString('vi-VN') : ''" :parser="(value: string) => Number(value.replace(/\D/g, ''))"><template #addonAfter>VNĐ</template></a-input-number>
              <div class="mt-2 flex min-h-5 items-start gap-1.5 text-[11px]" :class="amountError ? 'text-rose-600' : 'text-slate-400'"><span class="mt-[1px]">{{ amountError ? '!' : '•' }}</span><span>{{ amountError || 'Tối thiểu 10.000đ · Miễn phí chuyển khoản' }}</span></div>
            </div>

            <a-alert v-if="!hasBankAccount" type="warning" show-icon message="Vui lòng thiết lập và lưu tài khoản ngân hàng trước." class="mt-4 !rounded-xl"/>
            <div class="mt-6"><a-button type="primary" block :loading="withdrawing" :disabled="!canWithdraw" class="!flex !items-center !justify-center" @click="withdraw">Xác nhận yêu cầu rút tiền</a-button></div>
          </a-card>
        </div>

        <a-card :bordered="false" class="!rounded-2xl" title="Lịch sử biến động ví">
          <div v-if="history.length" class="divide-y divide-slate-100"><div v-for="item in history" :key="item.id" class="flex items-center justify-between py-4"><div><div class="text-xs font-bold text-slate-800">{{ item.description || item.referenceId || `#${item.id}` }}</div><div class="mt-1 text-[10px] text-slate-400">{{ new Date(item.createdAt).toLocaleString('vi-VN') }}</div></div><div class="text-right"><div class="text-sm font-black" :class="item.amount >= 0 ? 'text-emerald-600' : 'text-slate-800'">{{ item.amount >= 0 ? '+' : '-' }}{{ money(item.amount) }}</div><div class="mt-1 text-[10px] font-bold text-slate-500">{{ item.status === 'success' ? 'Thành công' : item.status === 'pending' ? 'Đang xử lý' : 'Đã từ chối' }}</div></div></div></div>
          <a-empty v-else description="Chưa có giao dịch"/>
        </a-card>
      </div>
    </a-spin>
  </UserPageLayout>
</template>

<style scoped>
.bank-account-card :deep(.ant-card-body) {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.withdraw-card :deep(.ant-card-body) {
  display: flex;
  height: 100%;
  flex-direction: column;
}

.withdraw-amount-input :deep(.ant-input-number-input) {
  height: 46px;
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

.withdraw-amount-input,
.withdraw-amount-input :deep(.ant-input-number-group-wrapper),
.withdraw-amount-input :deep(.ant-input-number-group),
.withdraw-amount-input :deep(.ant-input-number) {
  width: 100% !important;
}

.withdraw-amount-input :deep(.ant-input-number-group-addon) {
  padding-inline: 14px;
  background: #fff7f4;
  color: #ee4d2d;
  font-size: 11px;
  font-weight: 800;
}

.bank-form-button {
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
}

.bank-form-button--cancel {
  border-color: #fed7cc;
  background: #fff7f4;
  color: #d94728;
  box-shadow: none;
}

.bank-form-button--cancel:not(:disabled):hover {
  border-color: #ee4d2d;
  background: #fff0eb;
  color: #c83c20;
}

.bank-form-button :deep(.anticon),
.bank-form-button :deep(.ant-btn-loading-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  line-height: 1;
}

.bank-form-button :deep(.anticon svg) {
  display: block;
  width: 14px;
  height: 14px;
}
</style>
