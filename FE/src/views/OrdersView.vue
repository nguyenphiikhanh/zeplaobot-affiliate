<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  UploadOutlined,
  ReloadOutlined,
  FilterOutlined,
  DeleteOutlined,
  RightOutlined,
  InboxOutlined,
} from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface OrderItem {
  id: number
  order_id: string
  order_status?: string | null
  order_time?: string | null
  complete_time?: string | null
  shop_name?: string | null
  product_id?: string | null
  product_name?: string | null
  quantity?: number
  currency?: string | null
  purchase_value?: number | null
  actual_commission?: number | null
  user_commission?: number | null
  sub_id?: string | null
  user_id?: string | null
  user_name?: string | null
  user_tracking_code?: string | null
  is_paid?: number
  created_at?: string
}

// State
const loading = ref(false)
const orders = ref<OrderItem[]>([])

const selectedStatus = ref('all')
const searchInput = ref('')
const selectedUserId = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const totalOrders = ref(0)
const totalPages = ref(1)

const isFilterExpanded = ref(false)
const showUploadModal = ref(false)
const isUploading = ref(false)
const csvTextInput = ref('')

const selectedOrderDetails = ref<OrderItem | null>(null)
const showDetailsDrawer = ref(false)

// Fetch orders list
const fetchOrders = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = {
      page: currentPage.value,
      limit: pageSize.value,
    }
    if (selectedStatus.value !== 'all') params.status = selectedStatus.value
    if (searchInput.value.trim()) params.search = searchInput.value.trim()
    if (selectedUserId.value.trim()) params.userId = selectedUserId.value.trim()

    const res = await api.get<
      ApiResponse<{
        orders: OrderItem[]
        total: number
        totalPages: number
      }>
    >('/api/admin/orders', { params })

    if (res.data.success && res.data.data) {
      orders.value = res.data.data.orders
      totalOrders.value = res.data.data.total
      totalPages.value = res.data.data.totalPages
    }
  } catch (error) {
    message.error('Không thể tải danh sách đơn hàng Shopee!')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
})

const clearAllFilters = () => {
  selectedStatus.value = 'all'
  searchInput.value = ''
  selectedUserId.value = ''
  currentPage.value = 1
  fetchOrders()
}

// Table Columns
const columns = [
  { title: 'Mã đơn Shopee', dataIndex: 'order_id', key: 'order_id' },
  { title: 'Người mua (User)', key: 'user' },
  { title: 'Sản phẩm', dataIndex: 'product_name', key: 'product_name' },
  { title: 'Doanh số', dataIndex: 'purchase_value', key: 'purchase_value' },
  { title: 'Hoa hồng User', dataIndex: 'user_commission', key: 'user_commission' },
  { title: 'Trạng thái', dataIndex: 'order_status', key: 'order_status' },
  { title: 'Ngày tạo', dataIndex: 'order_time', key: 'order_time' },
  { title: '', key: 'action', width: 50 },
]

const getStatusColor = (status?: string | null) => {
  switch (status) {
    case 'success':
    case 'completed':
      return 'green'
    case 'pending':
      return 'orange'
    case 'unpaid':
      return 'gold'
    case 'cancelled':
      return 'red'
    default:
      return 'default'
  }
}

const getStatusLabel = (status?: string | null) => {
  switch (status) {
    case 'success':
    case 'completed':
      return 'Thành công'
    case 'pending':
      return 'Chờ duyệt'
    case 'unpaid':
      return 'Chờ thanh toán'
    case 'cancelled':
      return 'Đã hủy'
    default:
      return status || 'Không rõ'
  }
}

const openOrderDetails = (order: OrderItem) => {
  selectedOrderDetails.value = order
  showDetailsDrawer.value = true
}

// Upload CSV handler
const handleUploadCsv = async () => {
  if (!csvTextInput.value.trim()) {
    message.warning('Vui lòng dán hoặc chọn dữ liệu CSV Shopee!')
    return
  }

  isUploading.value = true
  try {
    const res = await api.post<ApiResponse<{ successCount: number; message: string }>>(
      '/api/admin/orders/upload-csv',
      { csv: csvTextInput.value.trim() },
    )
    if (res.data.success) {
      message.success(res.data.data?.message || 'Upload dữ liệu Shopee thành công!')
      csvTextInput.value = ''
      showUploadModal.value = false
      fetchOrders()
    }
  } catch (error) {
    message.error('Lỗi khi import file CSV Shopee!')
  } finally {
    isUploading.value = false
  }
}

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    csvTextInput.value = e.target?.result as string
  }
  reader.readAsText(file)
}
</script>

<template>
  <div class="flex flex-col gap-6 pb-12">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <span>Quản lý Đơn hàng Shopee</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
            Shopee Affiliate
          </span>
        </h2>
        <p class="text-xs text-slate-500 mt-1">
          Theo dõi, đối soát và upload dữ liệu đơn hàng từ nền tảng Shopee.
        </p>
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <a-button
          type="primary"
          @click="showUploadModal = true"
          class="!bg-[#ff5733] hover:!bg-[#e04826] font-semibold !inline-flex !items-center !justify-center !gap-2 !h-9 !px-4 !rounded-xl !border-none !text-white !shadow-xs"
        >
          <template #icon><UploadOutlined /></template>
          Upload CSV Shopee
        </a-button>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
      <!-- Filter Toolbar -->
      <div class="p-4 border-b border-slate-100 space-y-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <!-- Status Select -->
            <a-select
              v-model:value="selectedStatus"
              @change="fetchOrders"
              :options="[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Chờ duyệt', value: 'pending' },
                { label: 'Thành công', value: 'success' },
                { label: 'Chờ thanh toán', value: 'unpaid' },
                { label: 'Đã hủy', value: 'cancelled' },
              ]"
              style="width: 170px"
            />

            <!-- Page Size -->
            <a-select
              v-model:value="pageSize"
              @change="fetchOrders"
              :options="[
                { label: '20 / trang', value: 20 },
                { label: '50 / trang', value: 50 },
                { label: '100 / trang', value: 100 },
              ]"
              style="width: 120px"
            />

            <!-- Toggle Filter Button -->
            <a-button
              type="default"
              @click="isFilterExpanded = !isFilterExpanded"
              class="!inline-flex !items-center !justify-center !gap-1.5 font-medium text-xs !h-8 !px-3"
            >
              <template #icon><FilterOutlined /></template>
              <span>{{ isFilterExpanded ? 'Thu gọn' : 'Tìm nâng cao' }}</span>
            </a-button>

            <!-- Reset Filters -->
            <a-button
              v-if="selectedStatus !== 'all' || searchInput || selectedUserId"
              @click="clearAllFilters"
              type="text"
              danger
              class="!inline-flex !items-center !justify-center !gap-1 font-medium text-xs !h-8 !px-2"
            >
              <template #icon><DeleteOutlined /></template>
              <span>Xóa bộ lọc</span>
            </a-button>
          </div>

          <!-- Refresh Button -->
          <a-button
            type="primary"
            ghost
            @click="fetchOrders"
            :loading="loading"
            class="!inline-flex !items-center !justify-center !gap-1.5 font-medium text-xs !h-8 !px-4 shrink-0"
          >
            <template #icon><ReloadOutlined /></template>
            <span>Làm mới</span>
          </a-button>
        </div>

        <!-- Expanded Filters Panel -->
        <div v-if="isFilterExpanded" class="pt-3 border-t border-slate-100 border-dashed flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500 uppercase">Order / Sub ID:</span>
            <a-input-search
              v-model:value="searchInput"
              placeholder="Nhập mã đơn hàng..."
              enter-button
              @search="fetchOrders"
              style="width: 240px"
              allow-clear
            />
          </div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500 uppercase">User ID:</span>
            <a-input-search
              v-model:value="selectedUserId"
              placeholder="Nhập ID thành viên..."
              enter-button
              @search="fetchOrders"
              style="width: 220px"
              allow-clear
            />
          </div>
        </div>
      </div>

      <!-- Main Table -->
      <a-table
        :columns="columns"
        :data-source="orders"
        :row-key="(r) => r.id"
        :pagination="false"
        :loading="loading"
        :scroll="{ x: 'max-content' }"
        :custom-row="
          (record) => ({
            onClick: () => openOrderDetails(record),
            class: 'cursor-pointer hover:bg-orange-50/30 transition-colors',
          })
        "
      >
        <template #bodyCell="{ column, record }">
          <!-- Order ID Column -->
          <template v-if="column.key === 'order_id'">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-md bg-orange-500 text-white font-extrabold text-[10px] tracking-wide shrink-0">
                SHOPEE
              </span>
              <span class="font-bold text-slate-800 text-xs font-mono">
                #{{ record.order_id }}
              </span>
            </div>
          </template>

          <!-- User Column (NO Email, Display Name or "Người dùng hệ thống" + User ID) -->
          <template v-else-if="column.key === 'user'">
            <div v-if="record.user_id" class="flex flex-col text-left">
              <span class="font-bold text-slate-800 text-xs truncate max-w-[150px]">
                {{ record.user_name || 'Người dùng hệ thống' }}
              </span>
              <span class="text-[11px] font-mono text-slate-500 truncate max-w-[150px] mt-0.5">
                ID: {{ record.user_id }}
              </span>
            </div>
            <span v-else class="text-xs text-slate-400 italic">Chưa gán User</span>
          </template>

          <!-- Product Name Column -->
          <template v-else-if="column.key === 'product_name'">
            <div class="font-semibold text-slate-700 text-xs truncate max-w-[220px]" :title="record.product_name">
              {{ record.product_name || 'Sản phẩm Shopee' }}
            </div>
          </template>

          <!-- Purchase Value Column -->
          <template v-else-if="column.key === 'purchase_value'">
            <span class="font-bold text-slate-800 text-xs">
              {{ Math.round(record.purchase_value || 0).toLocaleString('vi-VN') }}đ
            </span>
          </template>

          <!-- User Commission Column -->
          <template v-else-if="column.key === 'user_commission'">
            <span class="font-extrabold text-orange-600 text-xs">
              {{ Math.round(record.user_commission || 0).toLocaleString('vi-VN') }}đ
            </span>
          </template>

          <!-- Order Status Column -->
          <template v-else-if="column.key === 'order_status'">
            <a-tag :color="getStatusColor(record.order_status)">
              {{ getStatusLabel(record.order_status) }}
            </a-tag>
          </template>

          <!-- Order Time Column -->
          <template v-else-if="column.key === 'order_time'">
            <span class="text-xs text-slate-500 font-medium">
              {{ record.order_time ? new Date(record.order_time).toLocaleDateString('vi-VN') : '—' }}
            </span>
          </template>

          <!-- Action Column -->
          <template v-else-if="column.key === 'action'">
            <RightOutlined class="text-slate-400 text-xs" />
          </template>
        </template>
      </a-table>

      <!-- Pagination Footer -->
      <div class="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-slate-500 font-medium">
          Hiển thị {{ orders.length }} / Tổng {{ totalOrders }} đơn hàng Shopee
        </span>

        <a-pagination
          v-if="totalPages > 1"
          v-model:current="currentPage"
          :total="totalOrders"
          :page-size="pageSize"
          show-less-items
          @change="fetchOrders"
        />
      </div>
    </div>

    <!-- Modal Upload CSV Shopee -->
    <a-modal
      v-model:open="showUploadModal"
      title="Upload dữ liệu đối soát Shopee Affiliate"
      :footer="null"
      width="600px"
    >
      <div class="space-y-4 pt-2">
        <p class="text-xs text-slate-500 leading-relaxed">
          Chọn file CSV hoặc dán trực tiếp nội dung xuất từ báo cáo Shopee Affiliate Dashboard. Hệ thống sẽ tự động khớp nối Sub ID để gán User tương ứng.
        </p>

        <!-- File Upload Area -->
        <div class="border-2 border-dashed border-orange-200 hover:border-orange-400 rounded-2xl p-6 text-center bg-orange-50/40 transition-colors">
          <InboxOutlined class="text-4xl text-[#ff5733] mb-2" />
          <p class="text-xs font-bold text-slate-700">Bấm để chọn file CSV từ máy tính</p>
          <input
            type="file"
            accept=".csv,text/csv"
            @change="handleFileUpload"
            class="mt-2 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
          />
        </div>

        <!-- Or Paste Textarea -->
        <div class="space-y-1">
          <label class="block text-xs font-bold text-slate-700">Hoặc dán nội dung CSV tại đây:</label>
          <textarea
            v-model="csvTextInput"
            rows="6"
            placeholder="Dán dữ liệu CSV từ Shopee tại đây..."
            class="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <a-button @click="showUploadModal = false">Hủy</a-button>
          <a-button
            type="primary"
            :loading="isUploading"
            @click="handleUploadCsv"
            class="!bg-[#ff5733] font-bold"
          >
            Bắt đầu Upload
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- Drawer Chi tiết Đơn hàng Shopee -->
    <a-drawer
      v-model:open="showDetailsDrawer"
      title="Chi tiết đơn hàng Shopee"
      placement="right"
      width="480px"
    >
      <div v-if="selectedOrderDetails" class="space-y-6">
        <!-- Section: General -->
        <div class="space-y-2">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin đơn hàng</div>
          <div class="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Mã đơn Shopee:</span>
              <span class="font-bold text-slate-800 font-mono">#{{ selectedOrderDetails.order_id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Trạng thái:</span>
              <a-tag :color="getStatusColor(selectedOrderDetails.order_status)">
                {{ getStatusLabel(selectedOrderDetails.order_status) }}
              </a-tag>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Tên Shop:</span>
              <span class="font-medium text-slate-800">{{ selectedOrderDetails.shop_name || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Section: User Info -->
        <div class="space-y-2">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Người nhận hoa hồng</div>
          <div class="bg-orange-50/60 border border-orange-100 p-4 rounded-2xl space-y-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Tên người dùng:</span>
              <span class="font-bold text-slate-800">
                {{ selectedOrderDetails.user_name || 'Người dùng hệ thống' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">User ID:</span>
              <span class="font-bold text-slate-800 font-mono">
                {{ selectedOrderDetails.user_id || 'Chưa gán' }}
              </span>
            </div>
            <div v-if="selectedOrderDetails.user_tracking_code" class="flex justify-between">
              <span class="text-slate-500">Mã theo dõi:</span>
              <span class="font-mono font-bold text-orange-600">
                {{ selectedOrderDetails.user_tracking_code }}
              </span>
            </div>
            <div v-if="selectedOrderDetails.sub_id" class="flex justify-between">
              <span class="text-slate-500">Sub ID:</span>
              <span class="font-mono text-slate-600">{{ selectedOrderDetails.sub_id }}</span>
            </div>
          </div>
        </div>

        <!-- Section: Financials -->
        <div class="space-y-2">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Giá trị & Hoa hồng</div>
          <div class="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-500">Giá trị đơn:</span>
              <span class="font-bold text-slate-800">
                {{ Math.round(selectedOrderDetails.purchase_value || 0).toLocaleString('vi-VN') }}đ
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Hoa hồng gốc Shopee:</span>
              <span class="font-medium text-slate-800">
                {{ Math.round(selectedOrderDetails.actual_commission || 0).toLocaleString('vi-VN') }}đ
              </span>
            </div>
            <div class="flex justify-between text-orange-600 font-bold">
              <span>Hoa hồng chia cho User:</span>
              <span>
                {{ Math.round(selectedOrderDetails.user_commission || 0).toLocaleString('vi-VN') }}đ
              </span>
            </div>
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>
