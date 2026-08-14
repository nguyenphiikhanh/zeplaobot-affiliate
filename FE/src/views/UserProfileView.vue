<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  UserOutlined,
  CopyOutlined,
  BankOutlined,
  LogoutOutlined,
  CustomerServiceOutlined,
  SafetyCertificateOutlined,
  RightOutlined,
} from '@ant-design/icons-vue'
import { api, clearAuthTokens, getSessionUser, type ApiResponse } from '../services/api'

const router = useRouter()
const user = ref<any>(null)
const bankAccount = ref<any>(null)
const loading = ref(false)

const loadUserData = async () => {
  loading.value = true
  try {
    user.value = await getSessionUser()
    const res = await api.get<ApiResponse<any>>('/api/user/bank-account')
    bankAccount.value = res.data.data
  } catch (error) {
    // Ignore error
  } finally {
    loading.value = false
  }
}

const copyTrackingCode = () => {
  if (!user.value?.tracking_code) return
  navigator.clipboard.writeText(user.value.tracking_code)
  message.success('Đã sao chép mã theo dõi!')
}

const handleLogout = () => {
  clearAuthTokens()
  message.info('Đã đăng xuất tài khoản')
  router.push('/login')
}

onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="space-y-4 text-left">
    <!-- User Info Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-[#ee4d2d] to-[#ff5722] p-0.5 shrink-0 shadow-sm flex items-center justify-center text-white overflow-hidden">
        <img v-if="user?.image" :src="user.image" class="w-full h-full object-cover rounded-full" alt="Avatar" />
        <UserOutlined v-else class="text-2xl" />
      </div>

      <div class="flex-1 min-w-0">
        <h2 class="text-base font-extrabold text-slate-900 truncate">
          {{ user?.name || 'Khách hàng' }}
        </h2>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-slate-500 font-medium">Mã theo dõi:</span>
          <span class="text-xs font-mono font-bold text-[#ee4d2d] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100">
            #{{ user?.tracking_code || '---' }}
          </span>
          <button
            type="button"
            @click="copyTrackingCode"
            class="text-slate-400 hover:text-[#ee4d2d] transition-colors p-1 cursor-pointer"
            title="Sao chép"
          >
            <CopyOutlined class="text-xs" />
          </button>
        </div>
      </div>
    </div>

    <!-- Quick Links / Settings -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
      <!-- Bank Account -->
      <router-link
        to="/wallet"
        class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BankOutlined class="text-base" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-800">Tài khoản ngân hàng nhận tiền</div>
            <div class="text-[11px] text-slate-400 mt-0.5">
              {{ bankAccount ? (bankAccount.bankName + ' - ' + bankAccount.accountNo) : 'Chưa thiết lập' }}
            </div>
          </div>
        </div>
        <RightOutlined class="text-xs text-slate-400" />
      </router-link>

      <!-- Bot Zalo Support -->
      <a
        href="https://zalo.me"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CustomerServiceOutlined class="text-base" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-800">Hỗ trợ qua Zalo Bot</div>
            <div class="text-[11px] text-slate-400 mt-0.5">Nhắn tin tra cứu số dư và rút tiền tự động</div>
          </div>
        </div>
        <RightOutlined class="text-xs text-slate-400" />
      </a>

      <!-- Security -->
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <SafetyCertificateOutlined class="text-base" />
          </div>
          <div>
            <div class="text-xs font-bold text-slate-800">Bảo mật & Phiên đăng nhập</div>
            <div class="text-[11px] text-emerald-600 font-medium mt-0.5">Đang được bảo vệ bởi Token an toàn</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="pt-2">
      <button
        @click="handleLogout"
        type="button"
        class="w-full h-12 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
      >
        <LogoutOutlined class="text-sm" />
        <span>Đăng xuất tài khoản</span>
      </button>
    </div>
  </div>
</template>
