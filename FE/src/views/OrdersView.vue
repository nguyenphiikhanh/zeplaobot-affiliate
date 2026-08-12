<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined, FileDoneOutlined, FilterOutlined, InfoCircleOutlined, ReloadOutlined, RightOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface OrderItem {
  id: number
  order_id: string
  order_status?: string | null
  order_time?: string | null
  shop_name?: string | null
  product_name?: string | null
  purchase_value?: number | null
  actual_commission?: number | null
  user_commission?: number | null
  sub_id?: string | null
  user_id?: string | null
  user_name?: string | null
  user_tracking_code?: string | null
  type?: number | null
}

type CsvRow = Record<string, string | null>
type ImportRow = Record<string, string | number | null>

const loading = ref(false)
const orders = ref<OrderItem[]>([])
const totalOrders = ref(0)
const totalPages = ref(1)
const currentPage = ref(1)
const limit = ref(20)
const selectedStatus = ref('all')
const orderIdInput = ref('')
const orderIdFilter = ref('')
const selectedUserId = ref('')
const isFilterExpanded = ref(false)
const selectedOrder = ref<OrderItem | null>(null)

const showUploadModal = ref(false)
const selectedFile = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)

const statusOptions = [
  { label: 'Tất cả trạng thái', value: 'all' },
  { label: 'Chờ duyệt', value: 'Pending' },
  { label: 'Thành công', value: 'Completed' },
  { label: 'Chờ thanh toán', value: 'Unpaid' },
  { label: 'Đã hủy', value: 'Cancelled' },
]
const columns = [
  { title: 'Mã đơn', dataIndex: 'order_id', key: 'order_id', width: 160 },
  { title: 'Người mua', key: 'user', width: 180 },
  { title: 'Sản phẩm', dataIndex: 'product_name', key: 'product_name', width: 220 },
  { title: 'Ngày', dataIndex: 'order_time', key: 'order_time', width: 110 },
  { title: 'Hoa hồng Sàn', dataIndex: 'actual_commission', key: 'actual_commission', align: 'right', width: 140 },
  { title: 'Hoa hồng User', dataIndex: 'user_commission', key: 'user_commission', align: 'right', width: 140 },
  { title: 'Trạng thái', dataIndex: 'order_status', key: 'order_status', align: 'center', width: 130 },
  { title: '', key: 'action', width: 50 },
]

const fetchOrders = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = { page: currentPage.value, limit: limit.value }
    if (selectedStatus.value !== 'all') params.status = selectedStatus.value
    if (orderIdFilter.value) params.order_id = orderIdFilter.value
    if (selectedUserId.value.trim()) params.userId = selectedUserId.value.trim()
    const res = await api.get<ApiResponse<{ orders: OrderItem[]; total: number; totalPages: number }>>('/api/admin/orders', { params })
    orders.value = res.data.data?.orders || []
    totalOrders.value = res.data.data?.total || 0
    totalPages.value = res.data.data?.totalPages || 1
  } catch {
    message.error('Không thể tải danh sách đơn hàng!')
  } finally {
    loading.value = false
  }
}

watch([selectedStatus, limit], () => { currentPage.value = 1; fetchOrders() })
onMounted(fetchOrders)

const clearAllFilters = () => {
  selectedStatus.value = 'all'
  orderIdInput.value = ''
  orderIdFilter.value = ''
  selectedUserId.value = ''
  currentPage.value = 1
  fetchOrders()
}
const applyOrderSearch = (value: string) => { orderIdFilter.value = value.trim(); currentPage.value = 1; fetchOrders() }
const hasFilters = computed(() => selectedStatus.value !== 'all' || !!orderIdFilter.value || !!selectedUserId.value)
const pendingCount = computed(() => orders.value.filter((item) => item.order_status?.toLowerCase() === 'pending').length)
const paginationText = computed(() => `Hiển thị ${orders.value.length} / Tổng ${totalOrders.value} đơn hàng`)

const getStatusColor = (status?: string | null) => {
  const value = status?.toLowerCase()
  if (value === 'completed' || value === 'success') return 'success'
  if (value === 'pending') return 'warning'
  if (value === 'unpaid') return 'default'
  return 'error'
}
const getStatusLabel = (status?: string | null) => {
  const value = status?.toLowerCase()
  if (value === 'completed' || value === 'success') return 'HOÀN THÀNH'
  if (value === 'pending') return 'CHỜ DUYỆT'
  if (value === 'unpaid') return 'CHỜ THANH TOÁN'
  if (value === 'cancelled') return 'ĐÃ HỦY'
  return status || 'KHÔNG RÕ'
}
const formatMoney = (value?: number | null) => `${Math.round(Number(value) || 0).toLocaleString('vi-VN')}đ`

const triggerFileInput = () => fileInput.value?.click()
const chooseFile = (file?: File) => {
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.csv')) { message.error('Vui lòng chọn đúng file CSV.'); return }
  selectedFile.value = file
}
const handleFileSelect = (event: Event) => chooseFile((event.target as HTMLInputElement).files?.[0])
const onDrop = (event: DragEvent) => chooseFile(event.dataTransfer?.files?.[0])
const closeUpload = () => { showUploadModal.value = false; selectedFile.value = null; if (fileInput.value) fileInput.value.value = '' }

const parseCsvLine = (line: string, delimiter: string) => {
  const values: string[] = []
  let value = ''
  let quoted = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i++ }
    else if (char === '"') quoted = !quoted
    else if (char === delimiter && !quoted) { values.push(value.trim()); value = '' }
    else value += char
  }
  values.push(value.trim())
  return values
}
const parseNumber = (value: string | null) => {
  if (!value) return null
  const number = Number(value.replace(/[^\d.-]/g, ''))
  return Number.isFinite(number) ? number : null
}
const mapRow = (row: CsvRow): ImportRow => {
  const value = (key: string) => row[key] || null
  return {
    orderId: value('Order id'), orderStatus: value('Order Status'), orderTime: value('Order Time'),
    completeTime: value('Complete Time'), clickTime: value('Click Time'), shopName: value('Shop Name'),
    itemId: parseNumber(value('Item id')), itemName: value('Item Name'), qty: parseNumber(value('Qty')),
    purchaseValue: parseNumber(value('Purchase Value(₫)')), totalOrderCommission: parseNumber(value('Total Order Commission(₫)')),
    subId1: value('Sub_id1'),
  }
}
const parseCsv = (text: string) => {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) throw new Error('File CSV không hợp lệ hoặc trống.')
  const delimiter = lines[0].includes('\t') ? '\t' : ','
  const headers = parseCsvLine(lines[0], delimiter)
  const rows: ImportRow[] = []
  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line, delimiter)
    const row: CsvRow = {}
    headers.forEach((header, index) => { row[header] = values[index] || null })
    const mapped = mapRow(row)
    if (mapped.orderId) rows.push(mapped)
  }
  if (!rows.length) throw new Error('Không tìm thấy dữ liệu hợp lệ trong file.')
  return rows
}
const confirmUpload = async () => {
  if (!selectedFile.value) return
  isUploading.value = true
  try {
    const data = parseCsv(await selectedFile.value.text())
    const res = await api.post<ApiResponse<{ successCount: number; skippedCount: number; message: string }>>('/api/admin/orders/upload-csv', { data })
    message.success(res.data.data?.message || 'Cập nhật dữ liệu thành công!')
    closeUpload()
    await fetchOrders()
  } catch (error) {
    message.error(error instanceof Error ? error.message : 'Lỗi khi upload file CSV.')
  } finally { isUploading.value = false }
}
</script>

<template>
  <div class="flex flex-col gap-6 pb-12">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-slate-800 tracking-tight">Quản lý Đơn hàng</h2>
        <p class="text-[13px] text-slate-500 mt-1">Theo dõi, đối soát và upload dữ liệu đơn hàng từ mạng Affiliate.</p>
      </div>
      <a-button type="primary" class="!inline-flex !items-center !justify-center !gap-2 !h-9 !px-4 !rounded-xl !border-none !bg-[#ee4d2d] hover:!bg-[#d63d1e] !text-white font-semibold shadow-sm shadow-orange-500/20" @click="showUploadModal = true"><template #icon><UploadOutlined /></template><span>Upload CSV</span></a-button>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="12"><a-card size="small" :bordered="false"><a-skeleton-button v-if="loading && !orders.length" active block/><a-statistic v-else title="Tổng đơn hàng" :value="totalOrders" /></a-card></a-col>
      <a-col :xs="12"><a-card size="small" :bordered="false"><a-skeleton-button v-if="loading && !orders.length" active block/><a-statistic v-else title="Chờ duyệt trên trang" :value="pendingCount" :value-style="{ color: '#f59e0b' }" /></a-card></a-col>
    </a-row>

    <a-card :bordered="false" :body-style="{ padding: 0 }">
      <div class="p-4 border-b border-slate-100 flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <a-select v-model:value="selectedStatus" :options="statusOptions" style="width:180px" />
            <a-select v-model:value="limit" :options="[{label:'20 / trang',value:20},{label:'50 / trang',value:50},{label:'100 / trang',value:100}]" style="width:120px" />
            <a-button class="!inline-flex !items-center !justify-center !gap-1.5 !h-8 !px-3 !rounded-lg !border-[#ee4d2d] !text-[#ee4d2d] hover:!border-[#d63d1e] hover:!text-[#d63d1e] text-xs font-semibold" @click="isFilterExpanded = !isFilterExpanded"><template #icon><FilterOutlined /></template><span>{{ isFilterExpanded ? 'Thu gọn' : 'Mở rộng' }}</span></a-button>
            <a-button v-if="hasFilters" type="text" danger class="!inline-flex !items-center !justify-center !gap-1 !h-8 !px-2 text-xs font-medium" @click="clearAllFilters"><template #icon><DeleteOutlined /></template><span>Xóa bộ lọc</span></a-button>
          </div>
          <a-button :loading="loading" class="!inline-flex !items-center !justify-center !gap-1.5 !h-8 !px-4 !rounded-lg !border-[#ee4d2d] !text-[#ee4d2d] hover:!border-[#d63d1e] hover:!text-[#d63d1e] text-xs font-semibold shrink-0" @click="fetchOrders"><template #icon><ReloadOutlined /></template><span>Làm mới</span></a-button>
        </div>
        <div v-if="isFilterExpanded" class="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 border-dashed">
          <span class="text-xs font-semibold text-slate-500 uppercase">Tìm theo Order ID:</span>
          <a-input-search v-model:value="orderIdInput" placeholder="Nhập mã đơn hàng..." enter-button allow-clear class="orange-search" style="width:250px" @search="applyOrderSearch" />
          <span class="text-xs font-semibold text-slate-500 uppercase">User ID:</span>
          <a-input-search v-model:value="selectedUserId" placeholder="Nhập ID thành viên..." enter-button allow-clear class="orange-search" style="width:220px" @search="fetchOrders" />
        </div>
      </div>

      <a-table :columns="columns" :data-source="orders" :row-key="(r: OrderItem) => r.order_id || r.id" :pagination="false" :loading="loading" :scroll="{x:'max-content'}" :custom-row="(record: OrderItem) => ({onClick:()=>selectedOrder=record,class:'cursor-pointer'})">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order_id'"><div class="flex items-center gap-2"><span class="px-2 py-0.5 rounded-md bg-[#ee4d2d] text-white font-extrabold text-[10px]">SHOPEE</span><span class="font-bold text-slate-700 text-xs">#{{ record.order_id }}</span></div></template>
          <template v-else-if="column.key === 'user'"><div v-if="record.user_id" class="flex flex-col"><span class="font-bold text-slate-800 text-xs">{{ record.user_name || 'Người dùng hệ thống' }}</span><span class="text-[11px] font-mono text-slate-500">ID: {{ record.user_id }}</span></div><span v-else class="text-xs text-slate-400 italic">Không rõ</span></template>
          <template v-else-if="column.key === 'product_name'"><div class="font-semibold text-slate-700 text-[13px] truncate max-w-[200px]" :title="record.product_name">{{ record.product_name || 'Sản phẩm từ Shopee' }}</div></template>
          <template v-else-if="column.key === 'order_time'"><span class="text-xs text-slate-500">{{ record.order_time ? new Date(record.order_time).toLocaleDateString('vi-VN') : '—' }}</span></template>
          <template v-else-if="column.key === 'actual_commission'"><span class="font-bold text-slate-800 text-[13px]">{{ formatMoney(record.actual_commission) }}</span></template>
          <template v-else-if="column.key === 'user_commission'"><span class="font-bold text-emerald-600 text-[13px]">{{ formatMoney(record.user_commission) }}</span></template>
          <template v-else-if="column.key === 'order_status'"><a-tag :color="getStatusColor(record.order_status)">{{ getStatusLabel(record.order_status) }}</a-tag></template>
          <template v-else-if="column.key === 'action'"><RightOutlined class="text-slate-400" /></template>
        </template>
      </a-table>
      <div class="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"><span class="text-xs text-slate-500">{{ paginationText }}</span><a-pagination v-if="totalPages > 1" v-model:current="currentPage" :total="totalOrders" :page-size="limit" show-less-items @change="fetchOrders" /></div>
    </a-card>

    <a-modal v-model:open="showUploadModal" title="Upload dữ liệu đối soát" :footer="null" @cancel="closeUpload">
      <div class="relative">
        <div v-if="isUploading" class="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-xl"><a-spin size="large" /><p class="text-sm font-bold mt-3">Đang xử lý...</p></div>
        <input ref="fileInput" type="file" class="hidden" accept=".csv,text/csv" @change="handleFileSelect" />
        <div v-if="!selectedFile" class="mt-4 border-2 border-dashed border-orange-200 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer bg-orange-50/40 hover:border-[#ee4d2d] hover:bg-orange-50" @click="triggerFileInput" @dragover.prevent @drop.prevent="onDrop"><UploadOutlined class="text-3xl text-[#ee4d2d] mb-3" /><h4 class="text-sm font-bold">Kéo thả file CSV vào đây</h4><p class="text-[11px] text-slate-500 mb-4">hoặc click để chọn file từ máy tính</p><a-button class="!inline-flex !items-center !justify-center !h-8 !rounded-lg !border-orange-200 !text-[#ee4d2d] font-semibold">Chọn file</a-button></div>
        <div v-else class="mt-4 border border-orange-200 rounded-xl p-5 flex flex-col items-center text-center bg-orange-50/40"><FileDoneOutlined class="text-3xl text-[#ee4d2d] mb-3" /><h4 class="text-sm font-bold">{{ selectedFile.name }}</h4><p class="text-[11px] text-slate-500 mb-5">{{ (selectedFile.size/1024).toFixed(2) }} KB</p><div class="flex items-center justify-center gap-3"><a-button class="!inline-flex !items-center !justify-center !h-8 !rounded-lg" @click="selectedFile=null">Hủy</a-button><a-button type="primary" class="!inline-flex !items-center !justify-center !h-8 !px-4 !rounded-lg !border-none !bg-[#ee4d2d] hover:!bg-[#d63d1e] !text-white font-semibold" @click="confirmUpload">Upload</a-button></div></div>
        <div class="mt-4 flex items-start gap-2"><InfoCircleOutlined class="text-slate-400 mt-0.5" /><p class="text-[11px] text-slate-500">File CSV phải được trích xuất từ báo cáo Shopee Affiliate. Hệ thống sẽ so khớp <b>Order id</b> và <b>Sub_id1</b>.</p></div>
      </div>
    </a-modal>

    <a-drawer :open="!!selectedOrder" placement="right" width="450" title="Chi tiết đơn hàng" @close="selectedOrder=null"><div v-if="selectedOrder" class="space-y-4 text-sm"><p><b>#{{ selectedOrder.order_id }}</b></p><p>Shop: {{ selectedOrder.shop_name || 'N/A' }}</p><p>Sản phẩm: {{ selectedOrder.product_name || 'N/A' }}</p><p>Sub ID: {{ selectedOrder.sub_id || 'N/A' }}</p><p>Giá trị đơn: {{ formatMoney(selectedOrder.purchase_value) }}</p><p>Hoa hồng Sàn: {{ formatMoney(selectedOrder.actual_commission) }}</p><p class="text-emerald-600 font-bold">Hoa hồng User: {{ formatMoney(selectedOrder.user_commission) }}</p></div></a-drawer>
  </div>
</template>

<style scoped>
:deep(.orange-search .ant-input-search-button) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-color: #ee4d2d !important;
  background: #ee4d2d !important;
  color: #fff !important;
}

:deep(.orange-search .ant-input-search-button:hover) {
  border-color: #d63d1e !important;
  background: #d63d1e !important;
}
</style>
