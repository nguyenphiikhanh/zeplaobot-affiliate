<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RightOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface Order {
  id: number
  orderId: string
  orderStatus: string | null
  orderTime: string | null
  shopName: string | null
  productName: string | null
  purchaseValue: number | null
  actualCommission: number | null
  userCommission: number | null
  subId: string | null
}

const rows = ref<Order[]>([])
const loading = ref(false)
const tab = ref<'All' | 'Pending' | 'Completed' | 'Cancelled'>('All')
const searchQuery = ref('')
const page = ref(1)
const total = ref(0)
const selected = ref<Order | null>(null)
const limit = 15

const fetchOrders = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      limit,
    }
    if (tab.value !== 'All') {
      params.status = tab.value
    }
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim()
    }
    const res = await api.get<ApiResponse<{ orders: Order[]; total: number }>>('/api/user/orders', { params })
    rows.value = res.data.data?.orders || []
    total.value = res.data.data?.total || 0
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})

watch(tab, () => {
  page.value = 1
  fetchOrders()
})

const handleSearch = () => {
  page.value = 1
  fetchOrders()
}

const formatMoney = (v: number | null) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(v || 0)) + 'đ'
}

const getStatusBadge = (status: string | null) => {
  if (status === 'Completed') return { label: 'Hoàn thành', class: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' }
  if (status === 'Cancelled') return { label: 'Đã hủy', class: 'bg-rose-50 text-rose-600 border border-rose-200/60' }
  if (status === 'Unpaid') return { label: 'Chờ thanh toán', class: 'bg-blue-50 text-blue-600 border border-blue-200/60' }
  return { label: 'Chờ duyệt', class: 'bg-amber-50 text-amber-600 border border-amber-200/60' }
}
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4 text-left">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2.5 text-slate-900 font-extrabold text-base sm:text-lg">
          <div class="w-8 h-8 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
            <FileTextOutlined class="text-base" />
          </div>
          <h2 class="text-base sm:text-lg font-black text-slate-900 leading-none m-0">Tra Cứu Đơn Hàng</h2>
        </div>
          <h2>Tra Cứu Đơn Hàng</h2>
        </div>
        <p class="text-xs text-slate-500 leading-relaxed">
          Theo dõi tiến trình ghi nhận hoa hồng và trạng thái duyệt đơn Shopee của bạn.
        </p>
      </div>

      <button
        type="button"
        @click="fetchOrders"
        :disabled="loading"
        class="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-2xs active:scale-95 transition-all"
      >
        <ReloadOutlined :class="{ 'animate-spin': loading }" />
        <span>Làm mới</span>
      </button>
    </div>

    <!-- Search & Filter Tabs Card -->
    <div class="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
      <!-- Search Input -->
      <div class="relative flex items-center">
        <input
          v-model="searchQuery"
          @keyup.enter="handleSearch"
          type="text"
          placeholder="Tìm theo mã đơn hàng hoặc tên sản phẩm..."
          class="w-full h-10 pl-9 pr-20 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-slate-400"
        />
        <SearchOutlined class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
        <button
          type="button"
          @click="handleSearch"
          class="absolute right-1.5 h-7 px-3 rounded-lg bg-[#ee4d2d] hover:bg-[#d83d1e] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          Tìm
        </button>
      </div>

      <!-- Segmented Status Tabs -->
      <div class="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-xl">
        <button
          type="button"
          @click="tab = 'All'"
          :class="[
            'py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center select-none truncate',
            tab === 'All' ? 'bg-white text-[#ee4d2d] shadow-xs' : 'text-slate-600 hover:text-slate-900',
          ]"
        >
          Tất cả
        </button>

        <button
          type="button"
          @click="tab = 'Pending'"
          :class="[
            'py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center select-none truncate',
            tab === 'Pending' ? 'bg-white text-[#ee4d2d] shadow-xs' : 'text-slate-600 hover:text-slate-900',
          ]"
        >
          Chờ duyệt
        </button>

        <button
          type="button"
          @click="tab = 'Completed'"
          :class="[
            'py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center select-none truncate',
            tab === 'Completed' ? 'bg-white text-[#ee4d2d] shadow-xs' : 'text-slate-600 hover:text-slate-900',
          ]"
        >
          Thành công
        </button>

        <button
          type="button"
          @click="tab = 'Cancelled'"
          :class="[
            'py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer text-center select-none truncate',
            tab === 'Cancelled' ? 'bg-white text-[#ee4d2d] shadow-xs' : 'text-slate-600 hover:text-slate-900',
          ]"
        >
          Đã hủy
        </button>
      </div>
    </div>

    <!-- Orders List Card -->
    <div class="bg-white rounded-2xl p-3 sm:p-5 border border-slate-200/80 shadow-xs">
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center gap-3">
        <div class="w-8 h-8 rounded-full border-3 border-orange-100 border-t-[#ee4d2d] animate-spin"></div>
        <span class="text-xs font-bold text-slate-400">Đang tải danh sách đơn hàng...</span>
      </div>

      <div v-else-if="rows.length" class="divide-y divide-slate-100">
        <div
          v-for="item in rows"
          :key="item.id"
          @click="selected = item"
          class="py-3 sm:py-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-xl px-2 sm:px-3 transition-colors cursor-pointer group"
        >
          <!-- Left info: Shopee Logo + Product & ID -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="w-10 h-10 rounded-xl bg-orange-50/80 border border-orange-100 flex items-center justify-center shrink-0 p-1.5">
              <img src="/logo/shopee.png" alt="Shopee" class="w-full h-full object-contain" />
            </div>

            <div class="min-w-0 flex-1 space-y-0.5">
              <div class="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-[#ee4d2d] transition-colors">
                {{ item.productName || 'Đơn hàng Shopee' }}
              </div>
              <div class="text-[11px] text-slate-400 flex items-center gap-2">
                <span class="font-mono font-medium">#{{ item.orderId }}</span>
                <span v-if="item.orderTime">· {{ new Date(item.orderTime).toLocaleDateString('vi-VN') }}</span>
              </div>
            </div>
          </div>

          <!-- Right info: Commission amount + status pill -->
          <div class="text-right shrink-0 flex flex-col items-end gap-1">
            <div class="text-sm sm:text-base font-black text-emerald-600">
              +{{ formatMoney(item.userCommission) }}
            </div>
            <span :class="['px-2 py-0.5 rounded-full text-[10px] font-bold', getStatusBadge(item.orderStatus).class]">
              {{ getStatusBadge(item.orderStatus).label }}
            </span>
          </div>

          <RightOutlined class="text-xs text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
        </div>

        <!-- Pagination -->
        <div v-if="total > limit" class="pt-4 flex justify-center">
          <a-pagination
            :current="page"
            :total="total"
            :page-size="limit"
            size="small"
            @change="(p: number) => { page = p; fetchOrders() }"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-12 text-center space-y-2">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
          <FileTextOutlined />
        </div>
        <div class="text-sm font-bold text-slate-700">Chưa có đơn hàng nào</div>
        <p class="text-xs text-slate-400 max-w-xs mx-auto">
          Dán link Shopee vào trang Tạo link để mua sắm và nhận hoa hồng hoàn tiền tự động nhé!
        </p>
      </div>
    </div>

    <!-- Order Detail Drawer Modal -->
    <a-drawer
      :open="!!selected"
      title="Chi tiết đơn hàng"
      placement="right"
      :width="420"
      @close="selected = null"
    >
      <div v-if="selected" class="space-y-3 text-left">
        <div class="p-3 bg-orange-50/70 border border-orange-200/80 rounded-xl flex items-center justify-between">
          <div>
            <div class="text-[10px] font-bold uppercase text-slate-400">Hoa hồng của bạn</div>
            <div class="text-lg font-black text-[#ee4d2d]">{{ formatMoney(selected.userCommission) }}</div>
          </div>
          <span :class="['px-2.5 py-1 rounded-full text-xs font-bold', getStatusBadge(selected.orderStatus).class]">
            {{ getStatusBadge(selected.orderStatus).label }}
          </span>
        </div>

        <div class="space-y-2">
          <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div class="text-[10px] font-bold uppercase text-slate-400">Mã đơn hàng</div>
            <div class="text-xs font-mono font-bold text-slate-800 mt-0.5">{{ selected.orderId }}</div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div class="text-[10px] font-bold uppercase text-slate-400">Tên sản phẩm</div>
            <div class="text-xs font-bold text-slate-800 mt-0.5">{{ selected.productName || 'Sản phẩm Shopee' }}</div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div class="text-[10px] font-bold uppercase text-slate-400">Cửa hàng</div>
            <div class="text-xs font-bold text-slate-800 mt-0.5">{{ selected.shopName || 'Shopee' }}</div>
          </div>

          <div class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div class="text-[10px] font-bold uppercase text-slate-400">Giá trị đơn hàng</div>
            <div class="text-xs font-bold text-slate-800 mt-0.5">{{ formatMoney(selected.purchaseValue) }}</div>
          </div>

          <div v-if="selected.orderTime" class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div class="text-[10px] font-bold uppercase text-slate-400">Thời gian ghi nhận</div>
            <div class="text-xs font-bold text-slate-800 mt-0.5">{{ new Date(selected.orderTime).toLocaleString('vi-VN') }}</div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>
