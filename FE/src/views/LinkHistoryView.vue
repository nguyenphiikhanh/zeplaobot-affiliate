<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CloseOutlined, CopyOutlined, DeleteOutlined, FilterOutlined, LinkOutlined, ReloadOutlined, RightOutlined, UserOutlined } from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface LinkHistoryItem {
  id: number
  user_id: string
  origin_link: string
  affiliate_link: string
  sub_id: string
  type: number
  product_info: Record<string, unknown> | null
  created_at: string
  user: { id: string | null; name: string | null; image: string | null; tracking_code: string | null } | null
}

const links = ref<LinkHistoryItem[]>([])
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const totalPages = ref(1)
const subIdInput = ref('')
const subIdFilter = ref('')
const userId = ref('')
const startDate = ref('')
const endDate = ref('')
const expanded = ref(false)
const selectedItem = ref<LinkHistoryItem | null>(null)

const hasFilters = computed(() => !!subIdFilter.value || !!userId.value.trim() || !!startDate.value || !!endDate.value)
const paginationText = computed(() => `Hiển thị ${links.value.length} / Tổng ${total.value} lượt tạo link`)
const columns = [
  { title: 'Thời gian', dataIndex: 'created_at', key: 'created_at', width: 150 },
  { title: 'Tạo bởi', key: 'user', width: 210 },
  { title: 'Sub ID', dataIndex: 'sub_id', key: 'sub_id', width: 150 },
  { title: 'Affiliate Link', dataIndex: 'affiliate_link', key: 'affiliate_link', width: 260 },
  { title: 'Sản phẩm', key: 'product', width: 300 },
  { title: '', key: 'details', width: 50 },
]

const fetchHistory = async () => {
  loading.value = true
  try {
    const params: Record<string, string | number> = { page: page.value, limit: limit.value }
    if (subIdFilter.value) params.subId = subIdFilter.value
    if (userId.value.trim()) params.userId = userId.value.trim()
    if (startDate.value) params.startDate = startDate.value
    if (endDate.value) params.endDate = endDate.value
    const response = await api.get<ApiResponse<{ links: LinkHistoryItem[]; total: number; totalPages: number }>>('/api/admin/link-history', { params })
    links.value = response.data.data?.links || []
    total.value = response.data.data?.total || 0
    totalPages.value = response.data.data?.totalPages || 1
  } catch {
    message.error('Không thể tải lịch sử tạo link.')
  } finally { loading.value = false }
}

onMounted(fetchHistory)
watch(limit, () => { page.value = 1; fetchHistory() })

const searchSubId = (value: string) => { subIdFilter.value = value.trim(); page.value = 1; fetchHistory() }
const applyAdvancedFilters = () => {
  if (startDate.value && endDate.value && startDate.value > endDate.value) {
    message.warning('Ngày bắt đầu không được lớn hơn ngày kết thúc.')
    return
  }
  page.value = 1
  fetchHistory()
}
const clearFilters = () => {
  subIdInput.value = ''
  subIdFilter.value = ''
  userId.value = ''
  startDate.value = ''
  endDate.value = ''
  page.value = 1
  fetchHistory()
}
const changePage = (value: number) => { page.value = value; fetchHistory() }

const productName = (info: Record<string, unknown> | null) => {
  if (!info) return 'Không có dữ liệu sản phẩm'
  const value = info.productName || info.title || info.name
  return value ? String(value) : 'Không xác định sản phẩm'
}
const formatJson = (value: unknown) => {
  try { return JSON.stringify(value || {}, null, 2) } catch { return String(value || '{}') }
}
const truncate = (value: string, length = 36) => value.length > length ? `${value.slice(0, length)}...` : value
const copyText = async (value: string, label = 'Nội dung') => {
  try { await navigator.clipboard.writeText(value); message.success(`Đã sao chép ${label}.`) }
  catch { message.error('Không thể sao chép nội dung.') }
}
</script>

<template>
  <div class="flex flex-col gap-6 pb-12">
    <div>
      <h2 class="text-lg font-bold text-slate-800 tracking-tight">Lịch sử tạo Link</h2>
      <p class="text-[13px] text-slate-500 mt-1">Lưu vết và đối soát lịch sử tạo link Affiliate Shopee của người dùng.</p>
    </div>

    <a-card :bordered="false" :body-style="{ padding: 0 }" class="overflow-hidden !rounded-2xl">
      <div class="p-4 border-b border-slate-100 flex flex-col gap-3">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <a-select v-model:value="limit" :options="[{label:'10 / trang',value:10},{label:'20 / trang',value:20},{label:'50 / trang',value:50},{label:'100 / trang',value:100}]" style="width:120px" />
            <a-input-search v-model:value="subIdInput" placeholder="Tìm theo Sub ID..." enter-button allow-clear class="orange-search" style="width:240px" @search="searchSubId" />
            <a-button class="!inline-flex !items-center !justify-center !gap-1.5 !h-8 !px-3 !rounded-lg !border-slate-200 hover:!border-orange-200 hover:!text-[#ee4d2d] text-xs font-semibold" @click="expanded = !expanded"><template #icon><FilterOutlined /></template><span>{{ expanded ? 'Thu gọn' : 'Mở rộng' }}</span></a-button>
            <a-button v-if="hasFilters" type="text" danger class="!inline-flex !items-center !justify-center !gap-1 !h-8 !px-2 text-xs font-semibold" @click="clearFilters"><template #icon><DeleteOutlined /></template><span>Xóa bộ lọc</span></a-button>
          </div>
          <a-button class="!inline-flex !items-center !justify-center !gap-1.5 !h-8 !px-4 !rounded-lg !border-[#ee4d2d] !text-[#ee4d2d] hover:!border-[#d63d1e] hover:!text-[#d63d1e] text-xs font-semibold shrink-0" :loading="loading" @click="fetchHistory"><template #icon><ReloadOutlined /></template><span>Làm mới</span></a-button>
        </div>

        <div v-if="expanded" class="pt-3 border-t border-slate-100 border-dashed flex flex-wrap items-end gap-4">
          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-slate-500 uppercase">User ID</label>
            <div class="relative"><UserOutlined class="absolute left-3 top-2.5 text-slate-400" /><input v-model="userId" class="w-56 h-9 pl-9 pr-3 rounded-lg border border-slate-300 bg-slate-50 text-xs font-mono focus:outline-none focus:border-[#ee4d2d]" placeholder="Nhập User ID..." /></div>
          </div>
          <div class="space-y-1.5"><label class="block text-[11px] font-bold text-slate-500 uppercase">Từ ngày</label><input v-model="startDate" type="date" class="h-9 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs" /></div>
          <div class="space-y-1.5"><label class="block text-[11px] font-bold text-slate-500 uppercase">Đến ngày</label><input v-model="endDate" type="date" class="h-9 px-3 rounded-lg border border-slate-300 bg-slate-50 text-xs" /></div>
          <a-button type="primary" class="!inline-flex !items-center !justify-center !h-9 !px-5 !rounded-lg !border-none !bg-[#ee4d2d] hover:!bg-[#d63d1e] !text-white text-xs font-bold" @click="applyAdvancedFilters"><span class="!text-white">Áp dụng</span></a-button>
        </div>
      </div>

      <a-table :columns="columns" :data-source="links" :row-key="(record: LinkHistoryItem) => record.id" :pagination="false" :loading="loading" :scroll="{x:'max-content'}" :custom-row="(record: LinkHistoryItem) => ({onClick:()=>selectedItem=record,class:'cursor-pointer'})">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'"><div class="text-xs font-bold text-slate-700">{{ new Date(record.created_at).toLocaleDateString('vi-VN') }}</div><div class="text-[10px] text-slate-400 mt-0.5">{{ new Date(record.created_at).toLocaleTimeString('vi-VN') }}</div></template>
          <template v-else-if="column.key === 'user'"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full overflow-hidden bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d] text-xs font-black shrink-0"><img v-if="record.user?.image" :src="record.user.image" :alt="record.user.name || 'Người dùng Zalo'" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover" /><span v-else>{{ record.user?.name?.charAt(0)?.toUpperCase() || 'U' }}</span></div><div class="flex flex-col"><span class="text-xs font-bold text-slate-800">{{ record.user?.name || 'Người dùng hệ thống' }}</span><span class="text-[10px] font-mono text-slate-500">{{ record.user_id }}</span></div></div></template>
          <template v-else-if="column.key === 'sub_id'"><span class="px-2 py-1 rounded-md bg-orange-50 text-[#ee4d2d] border border-orange-100 text-[11px] font-mono font-bold">{{ record.sub_id }}</span></template>
          <template v-else-if="column.key === 'affiliate_link'"><div class="flex items-center gap-2 max-w-[250px]"><LinkOutlined class="text-[#ee4d2d] shrink-0" /><span class="text-xs text-slate-600 truncate" :title="record.affiliate_link">{{ truncate(record.affiliate_link) }}</span></div></template>
          <template v-else-if="column.key === 'product'"><div class="max-w-[280px] px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-emerald-600 truncate" :title="productName(record.product_info)">{{ productName(record.product_info) }}</div></template>
          <template v-else-if="column.key === 'details'"><RightOutlined class="text-slate-400" /></template>
        </template>
      </a-table>

      <div class="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"><span class="text-xs text-slate-500">{{ paginationText }}</span><a-pagination v-if="totalPages > 1" class="orange-pagination" :current="page" :total="total" :page-size="limit" show-less-items @change="changePage" /></div>
    </a-card>

    <a-drawer :open="!!selectedItem" placement="right" width="480" :closable="false" @close="selectedItem=null">
      <template #title><div class="flex items-center justify-between gap-3"><div><span class="inline-flex px-2 py-0.5 rounded-md bg-orange-50 text-[#ee4d2d] border border-orange-100 text-[10px] font-black">SHOPEE LINK</span><h3 class="text-base font-bold mt-2">Chi tiết lịch sử tạo link</h3></div><a-button type="text" class="!w-9 !h-9 !p-0 !inline-flex !items-center !justify-center !rounded-xl hover:!bg-orange-50 hover:!text-[#ee4d2d] shrink-0" @click="selectedItem=null"><CloseOutlined /></a-button></div></template>
      <div v-if="selectedItem" class="flex flex-col gap-4">
        <div v-for="item in [{label:'Sub ID',value:selectedItem.sub_id},{label:'Link gốc',value:selectedItem.origin_link},{label:'Affiliate Link',value:selectedItem.affiliate_link}]" :key="item.label" class="rounded-xl border border-slate-200 bg-slate-50 p-4"><div class="flex items-center justify-between mb-2"><span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ item.label }}</span><a-button type="text" size="small" class="!inline-flex !items-center !justify-center !gap-1 !h-7 !px-2 !text-[#ee4d2d] hover:!bg-orange-50 text-xs font-semibold" @click="copyText(item.value,item.label)"><template #icon><CopyOutlined /></template><span>Copy</span></a-button></div><p class="m-0 text-xs font-mono text-slate-700 break-all">{{ item.value }}</p></div>
        <div class="rounded-xl overflow-hidden bg-[#0d1117] border border-slate-700"><div class="px-4 py-2 flex items-center justify-between bg-[#161b22] border-b border-slate-700"><span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product JSON</span><a-button type="text" size="small" class="!inline-flex !items-center !justify-center !gap-1 !h-7 !px-2 !text-orange-300 hover:!text-orange-200 hover:!bg-white/5 text-xs font-semibold" @click="copyText(formatJson(selectedItem.product_info),'JSON')"><template #icon><CopyOutlined /></template><span>Copy</span></a-button></div><pre class="m-0 p-4 overflow-x-auto text-[12px] leading-5 text-emerald-400 font-mono">{{ formatJson(selectedItem.product_info) }}</pre></div>
      </div>
    </a-drawer>
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
  color: white !important;
}

:deep(.orange-search .ant-input-search-button:hover) {
  border-color: #d63d1e !important;
  background: #d63d1e !important;
}

:deep(.orange-pagination .ant-pagination-item-active) {
  border-color: #ee4d2d !important;
}

:deep(.orange-pagination .ant-pagination-item-active a) {
  color: #ee4d2d !important;
}
</style>
