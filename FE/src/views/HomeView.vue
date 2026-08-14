<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  LinkOutlined,
  FileTextOutlined,
  BankOutlined,
} from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface DashboardData {
  user: {
    id: string
    name: string
    tracking_code: string
    image: string | null
  }
  wallet: {
    availableBalance: number
    pendingBalance: number
    totalPaid: number
  }
  stats: {
    total_orders: number
    completed_orders: number
    completed_commission?: number
    pending_orders: number
    pending_commission?: number
    paid_orders: number
    current_month_commission: number
    current_month_orders: number
    current_month_label: string
  }
  chart: {
    months: {
      monthKey: string
      monthLabel: string
      year: number
      month: number
      amount: number
      count: number
    }[]
    highest_month: {
      monthKey: string
      amount: number
    }
    total_6_months: number
  }
}

const router = useRouter()
const loading = ref(false)
const data = ref<DashboardData | null>(null)

const loadDashboard = async () => {
  loading.value = true
  try {
    const res = await api.get<ApiResponse<DashboardData>>('/api/user/dashboard-summary')
    data.value = res.data.data ?? null
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể tải dữ liệu tổng quan')
  } finally {
    loading.value = false
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(val || 0))
}

const formatCompactCurrency = (val: number) => {
  if (!val || val === 0) return '0'
  if (val >= 1_000_000) {
    return (val / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'tr'
  }
  if (val >= 1_000) {
    return (val / 1_000).toFixed(0) + 'k'
  }
  return String(val)
}

const currentMonthKey = computed(() => {
  const currentMonthNum = new Date().getMonth() + 1
  return 'T' + currentMonthNum
})

const maxChartAmount = computed(() => {
  if (!data.value?.chart?.months?.length) return 1
  const max = Math.max(...data.value.chart.months.map(m => m.amount))
  return max > 0 ? max : 1
})

onMounted(() => {
  loadDashboard()
})
</script>

<template>
  <div class="flex flex-col space-y-2.5 sm:space-y-4 text-left min-h-full">
    <!-- Top Greeting Card (Only on Desktop >= md) -->
    <div class="hidden md:block bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
      <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
        TỔNG QUAN
      </div>
      <h1 class="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight truncate" style="-webkit-text-stroke: 0.15px currentColor; font-weight: 900;">
        Xin chào, <span class="text-[#ee4d2d]" style="-webkit-text-stroke: 0.15px #ee4d2d;">{{ data?.user?.name || 'Khách hàng' }}</span>
      </h1>
      <p class="text-xs text-slate-500 font-medium mt-1">Chúc bạn có trải nghiệm tốt khi sử dụng hệ thống</p>
    </div>

    <!-- 1. Available Balance Card (Orange Gradient) -->
    <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#ee4d2d] via-[#f25c3a] to-[#ff6433] p-4 sm:p-6 text-white shadow-md shadow-orange-900/10 flex flex-col justify-between">
      <!-- Decorative background circles -->
      <div class="absolute right-0 top-0 w-32 sm:w-40 h-32 sm:h-40 bg-white/10 rounded-full blur-xl pointer-events-none -mr-8 -mt-8"></div>

      <div class="relative z-10 space-y-0.5">
        <div class="text-xs sm:text-sm font-semibold text-orange-100">
          Số dư hoa hồng khả dụng
        </div>
        <div class="text-2xl sm:text-4xl font-black tracking-tight">
          {{ formatCurrency(data?.wallet?.availableBalance || 0) }}đ
        </div>
      </div>

      <div class="relative z-10 pt-3 sm:pt-4">
        <button
          type="button"
          @click="router.push('/wallet')"
          style="color: #ee4d2d !important;"
          class="w-full h-9 sm:h-12 !bg-white !text-[#ee4d2d] hover:!bg-orange-50 active:scale-[0.98] transition-all rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-sm flex items-center justify-center cursor-pointer select-none"
        >
          <span style="color: #ee4d2d !important;" class="!text-[#ee4d2d] font-black">Rút tiền</span>
        </button>
      </div>
    </div>

    <!-- 2. 3 Quick Action Navigation Buttons (Directly below Balance Card!) -->
    <div class="grid grid-cols-3 gap-2">
      <button
        type="button"
        @click="router.push('/generate-link')"
        class="h-9.5 sm:h-12 bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl sm:rounded-2xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-800 shadow-2xs flex items-center justify-center cursor-pointer"
      >
        Tạo link
      </button>

      <button
        type="button"
        @click="router.push('/orders')"
        class="h-9.5 sm:h-12 bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl sm:rounded-2xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-800 shadow-2xs flex items-center justify-center cursor-pointer"
      >
        Xem đơn
      </button>

      <button
        type="button"
        @click="router.push('/wallet')"
        class="h-9.5 sm:h-12 bg-white hover:bg-slate-50 active:scale-95 transition-all rounded-xl sm:rounded-2xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-800 shadow-2xs flex items-center justify-center cursor-pointer"
      >
        STK nhận tiền
      </button>
    </div>

    <!-- 3. Current Month Earned Card -->
    <div class="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-200/80 shadow-xs">
      <div class="flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 font-extrabold text-lg sm:text-2xl flex items-center justify-center shrink-0 border border-emerald-100/60">
            ₫
          </div>
          <div>
            <div class="text-[10px] sm:text-xs font-bold text-slate-400">
              {{ data?.stats?.current_month_label || 'Tháng này' }}
            </div>
            <div class="text-xs sm:text-base font-extrabold text-slate-900">
              Đã nhận tháng này
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="text-sm sm:text-xl font-black text-emerald-600">
            {{ formatCurrency(data?.stats?.current_month_commission || 0) }}đ
          </div>
          <div class="text-[10px] sm:text-[11px] text-slate-400 font-medium">
            {{ data?.stats?.current_month_orders || 0 }} đơn đã hoàn thành
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 4 Status Cards (Text on TOP, Value in MIDDLE) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      <!-- Card 1: Tổng đơn -->
      <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-center text-left sm:text-center space-y-1">
        <div class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          Tổng đơn
        </div>
        <div class="text-base sm:text-lg font-black text-slate-900 truncate">
          {{ data?.stats?.total_orders || 0 }} đơn
        </div>
      </div>

      <!-- Card 2: Đơn hoàn thành -->
      <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-center text-left sm:text-center space-y-1">
        <div class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          Đơn hoàn thành
        </div>
        <div class="text-base sm:text-lg font-black text-[#00b087] truncate">
          {{ data?.stats?.completed_orders || 0 }} đơn
        </div>
      </div>

      <!-- Card 3: Đang xử lý -->
      <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-center text-left sm:text-center space-y-1">
        <div class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          Đang xử lý
        </div>
        <div class="text-base sm:text-lg font-black text-amber-500 truncate">
          {{ formatCurrency(data?.stats?.pending_commission || 0) }}đ
        </div>
      </div>

      <!-- Card 4: Đã trả -->
      <div class="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col justify-center text-left sm:text-center space-y-1">
        <div class="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
          Đã trả
        </div>
        <div class="text-base sm:text-lg font-black text-blue-600 truncate">
          {{ formatCurrency(data?.stats?.completed_commission || 0) }}đ
        </div>
      </div>
    </div>

    <!-- 5. Monthly Commission Chart Card (Filled height down to bottom menu) -->
    <div class="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
      <div class="flex items-center justify-between">
        <span class="text-xs sm:text-base font-extrabold text-slate-900">Hoa hồng nhận theo tháng</span>
        <span class="text-[10px] sm:text-xs text-slate-400 font-medium">6 tháng gần nhất</span>
      </div>

      <!-- Chart Bars -->
      <div class="h-36 sm:h-52 pt-3 flex items-end justify-between gap-2 sm:gap-3 px-2 sm:px-6">
        <div
          v-for="m in data?.chart?.months || []"
          :key="m.monthKey"
          class="flex-1 flex flex-col items-center h-full justify-end"
        >
          <!-- Amount label on top -->
          <span
            :class="[
              'text-[9px] sm:text-xs mb-1.5 font-bold truncate max-w-full',
              m.monthKey === currentMonthKey ? 'text-rose-500 font-black' : 'text-slate-500',
            ]"
          >
            {{ formatCompactCurrency(m.amount) }}
          </span>

          <!-- Bar -->
          <div class="w-full max-w-[28px] sm:max-w-[48px] bg-slate-100 rounded-t-lg sm:rounded-t-xl overflow-hidden flex items-end h-26 sm:h-40">
            <div
              :style="{ height: Math.max(8, (m.amount / maxChartAmount) * 100) + '%' }"
              :class="[
                'w-full rounded-t-lg sm:rounded-t-xl transition-all duration-500',
                m.amount > 0 ? 'bg-gradient-to-t from-[#ee4d2d] to-[#ff6a3c]' : 'bg-rose-400 h-1.5',
              ]"
            ></div>
          </div>

          <!-- Month Label -->
          <span
            :class="[
              'text-[10px] sm:text-xs mt-2 font-extrabold',
              m.monthKey === currentMonthKey ? 'text-rose-500 font-black' : 'text-slate-600',
            ]"
          >
            {{ m.monthKey }}
          </span>
        </div>
      </div>

      <!-- Bottom Summary Row -->
      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-sm text-slate-600 font-medium">
        <div>
          Cao nhất: <strong class="text-slate-900">{{ data?.chart?.highest_month?.monthKey || 'T1' }} · {{ formatCurrency(data?.chart?.highest_month?.amount || 0) }}đ</strong>
        </div>
        <div>
          Tổng 6 tháng: <strong class="text-slate-900">{{ formatCurrency(data?.chart?.total_6_months || 0) }}đ</strong>
        </div>
      </div>
    </div>
  </div>
</template>
