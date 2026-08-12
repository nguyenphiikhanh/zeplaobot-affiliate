<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { CloseOutlined, CopyOutlined, DeleteOutlined, LinkOutlined, ReloadOutlined, RightOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons-vue'
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

interface AdminUser {
  id: string
  name: string | null
  image: string | null
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
const selectedItem = ref<LinkHistoryItem | null>(null)

// User selection modal state
const users = ref<AdminUser[]>([])
const showUserModal = ref(false)
const userSearch = ref('')
const loadingUsers = ref(false)

const selectedUser = computed(() => users.value.find(x => x.id === userId.value))
const filteredUsers = computed(() => {
  const keyword = userSearch.value.trim().toLowerCase()
  return keyword
    ? users.value.filter(u => (u.name || '').toLowerCase().includes(keyword) || u.id.toLowerCase().includes(keyword))
    : users.value
})

const hasFilters = computed(() => !!subIdFilter.value || !!userId.value.trim())
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
    const response = await api.get<ApiResponse<{ links: LinkHistoryItem[]; total: number; totalPages: number }>>('/api/admin/link-history', { params })
    links.value = response.data.data?.links || []
    total.value = response.data.data?.total || 0
    totalPages.value = response.data.data?.totalPages || 1
  } catch {
    message.error('Không thể tải lịch sử tạo link.')
  } finally { loading.value = false }
}

const fetchUsers = async () => {
  loadingUsers.value = true
  try {
    const r = await api.get<ApiResponse<{ users: AdminUser[] }>>('/api/admin/users/list', {
      params: { page: 1, limit: 100, search: userSearch.value.trim() || undefined }
    })
    users.value = r.data.data?.users || []
  } catch {
    users.value = []
    message.error('Không thể tải danh sách người dùng.')
  } finally {
    loadingUsers.value = false
  }
}

const openUserModal = async () => {
  showUserModal.value = true
  userSearch.value = ''
  await fetchUsers()
}

const selectUser = (user: AdminUser) => {
  userId.value = user.id
  showUserModal.value = false
  userSearch.value = ''
  page.value = 1
  fetchHistory()
}

const clearUserFilter = () => {
  userId.value = ''
  page.value = 1
  fetchHistory()
}

onMounted(fetchHistory)
watch(limit, () => { page.value = 1; fetchHistory() })
watch(subIdInput, (newVal) => {
  if (!newVal && subIdFilter.value) {
    subIdFilter.value = ''
    page.value = 1
    fetchHistory()
  }
})

const searchSubId = (val?: string) => {
  const query = val !== undefined ? val : subIdInput.value
  subIdFilter.value = query.trim()
  page.value = 1
  fetchHistory()
}

const clearFilters = () => {
  subIdInput.value = ''
  subIdFilter.value = ''
  userId.value = ''
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
            
            <!-- Unified Sub ID Search Pill -->
            <div class="flex items-center rounded-xl border border-slate-200 bg-white p-1 focus-within:border-[#ee4d2d] focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-sm">
              <SearchOutlined class="text-slate-400 ml-2.5 text-xs" />
              <input
                v-model="subIdInput"
                placeholder="Tìm theo Sub ID..."
                class="w-48 sm:w-56 h-7 pl-2 pr-2 text-xs text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                @keyup.enter="searchSubId(subIdInput)"
              />
              <button
                v-if="subIdInput"
                type="button"
                class="text-slate-300 hover:text-slate-500 mr-3.5 text-xs cursor-pointer flex items-center justify-center p-0.5"
                @click="subIdInput = ''"
              >
                <CloseOutlined class="text-[10px]" />
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center gap-1.5 h-7 px-3.5 rounded-lg bg-[#ee4d2d] hover:bg-[#d63d1e] active:bg-[#bd3617] text-white text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                @click="searchSubId(subIdInput)"
              >
                <SearchOutlined class="text-[11px]" />
                <span>Tìm</span>
              </button>
            </div>

            <button
              type="button"
              class="btn-action-secondary"
              @click="openUserModal"
            >
              <UserOutlined />
              <span class="max-w-[150px] truncate">{{ selectedUser ? (selectedUser.name || selectedUser.id) : 'Tìm người dùng' }}</span>
              <CloseOutlined v-if="userId" class="ml-1 text-slate-400 hover:text-rose-500" @click.stop="clearUserFilter" />
            </button>

            <button
              v-if="hasFilters"
              type="button"
              class="btn-action-danger"
              @click="clearFilters"
            >
              <DeleteOutlined />
              <span>Xóa bộ lọc</span>
            </button>
          </div>

          <button
            type="button"
            class="btn-action-primary shrink-0"
            :disabled="loading"
            @click="fetchHistory"
          >
            <ReloadOutlined />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      <a-table :columns="columns" :data-source="links" :row-key="(record: LinkHistoryItem) => record.id" :pagination="false" :loading="loading" :scroll="{x:'max-content'}" :custom-row="(record: LinkHistoryItem) => ({onClick:()=>selectedItem=record,class:'cursor-pointer'})">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'created_at'"><div class="text-xs font-bold text-slate-700">{{ new Date(record.created_at).toLocaleDateString('vi-VN') }}</div><div class="text-[10px] text-slate-400 mt-0.5">{{ new Date(record.created_at).toLocaleTimeString('vi-VN') }}</div></template>
          <template v-else-if="column.key === 'user'"><div class="flex items-center gap-3"><div class="w-8 h-8 rounded-full overflow-hidden bg-orange-50 border border-orange-100 flex items-center justify-center text-[#ee4d2d] text-xs font-black shrink-0"><img v-if="record.user?.image" :src="record.user.image" :alt="record.user.name || 'Người dùng Zalo'" referrerpolicy="no-referrer" loading="lazy" class="w-full h-full object-cover" /><span v-else>{{ record.user?.name?.charAt(0)?.toUpperCase() || 'U' }}</span></div><div class="flex flex-col"><span class="text-xs font-bold text-slate-800">{{ record.user?.name || 'Người dùng hệ thống' }}</span><span class="text-[10px] font-mono text-slate-500">{{ record.user_id }}</span></div></div></template>
          <template v-else-if="column.key === 'sub_id'"><span class="px-2 py-1 rounded-md bg-orange-50 text-[#ee4d2d] border border-orange-100 text-[11px] font-mono font-bold">{{ record.sub_id }}</span></template>
          <template v-else-if="column.key === 'affiliate_link'"><div class="flex items-center gap-2 max-w-[250px]"><LinkOutlined class="text-[#ee4d2d] shrink-0" /><span class="text-xs text-slate-600 truncate" :title="record.affiliate_link">{{ truncate(record.affiliate_link) }}</span></div></template>
          <template v-else-if="column.key === 'product'"><div class="max-w-[280px] px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-emerald-600 truncate" :title="productName(record.product_info)">{{ productName(record.product_info) }}</div></template>
          <template v-else-if="column.key === 'details'"><button type="button" class="btn-action-primary !h-7 !px-2.5 text-[11px]" @click.stop="selectedItem = record"><span>Chi tiết</span><RightOutlined class="text-[10px]" /></button></template>
        </template>
      </a-table>

      <div class="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3"><span class="text-xs text-slate-500">{{ paginationText }}</span><a-pagination v-if="totalPages > 1" class="orange-pagination" :current="page" :total="total" :page-size="limit" show-less-items @change="changePage" /></div>
    </a-card>

    <a-drawer :open="!!selectedItem" placement="right" width="480" :closable="false" @close="selectedItem=null">
      <template #title><div class="flex items-center justify-between gap-3"><div><span class="inline-flex px-2 py-0.5 rounded-md bg-orange-50 text-[#ee4d2d] border border-orange-100 text-[10px] font-black">SHOPEE LINK</span><h3 class="text-base font-bold mt-2">Chi tiết lịch sử tạo link</h3></div><button type="button" class="btn-action-secondary !w-8 !h-8 !p-0" @click="selectedItem=null"><CloseOutlined /></button></div></template>
      <div v-if="selectedItem" class="flex flex-col gap-4">
        <div v-for="item in [{label:'Sub ID',value:selectedItem.sub_id},{label:'Link gốc',value:selectedItem.origin_link},{label:'Affiliate Link',value:selectedItem.affiliate_link}]" :key="item.label" class="rounded-xl border border-slate-200 bg-slate-50 p-4"><div class="flex items-center justify-between mb-2"><span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ item.label }}</span><button type="button" class="btn-action-primary !h-7 !px-2 text-xs" @click="copyText(item.value,item.label)"><CopyOutlined /><span>Copy</span></button></div><p class="m-0 text-xs font-mono text-slate-700 break-all">{{ item.value }}</p></div>
        <div class="rounded-xl overflow-hidden bg-[#0d1117] border border-slate-700"><div class="px-4 py-2 flex items-center justify-between bg-[#161b22] border-b border-slate-700"><span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Product JSON</span><button type="button" class="btn-action-primary !h-7 !px-2 text-xs" @click="copyText(formatJson(selectedItem.product_info),'JSON')"><CopyOutlined /><span>Copy</span></button></div><pre class="m-0 p-4 overflow-x-auto text-[12px] leading-5 text-emerald-400 font-mono">{{ formatJson(selectedItem.product_info) }}</pre></div>
      </div>
    </a-drawer>

    <!-- User Selection Modal -->
    <a-modal v-model:open="showUserModal" title="Chọn người dùng" :footer="null" width="560px" @after-close="userSearch=''">
      <a-input v-model:value="userSearch" allow-clear placeholder="Tìm theo tên hoặc Zalo UID..." class="mb-4" autofocus>
        <template #prefix><SearchOutlined class="text-slate-400" /></template>
      </a-input>
      <div class="max-h-[430px] space-y-2 overflow-y-auto pr-1">
        <div v-if="loadingUsers" class="flex justify-center py-12"><a-spin /></div>
        <button v-else v-for="user in filteredUsers" :key="user.id" type="button" :class="['flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all hover:border-orange-200 hover:bg-orange-50/60', user.id === userId ? 'border-[#ee4d2d] bg-orange-50' : 'border-slate-200 bg-[#FAFAFA]']" @click="selectUser(user)">
          <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50">
            <img v-if="user.image" :src="user.image" referrerpolicy="no-referrer" loading="lazy" class="h-full w-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center font-black text-[#ee4d2d]">{{ user.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-bold text-slate-800">{{ user.name || 'Người dùng Zalo' }}</div>
            <div class="mt-1 truncate font-mono text-[10px] text-slate-400">UID: {{ user.id }}</div>
          </div>
          <span v-if="user.id === userId" class="rounded-full bg-[#ee4d2d] px-2.5 py-1 text-[10px] font-bold text-white">Đang chọn</span>
        </button>
        <a-empty v-if="!loadingUsers && !filteredUsers.length" description="Không tìm thấy người dùng" />
      </div>
    </a-modal>
  </div>
</template>

<style scoped>
:deep(.orange-pagination .ant-pagination-item-active) {
  border-color: #ee4d2d !important;
}

:deep(.orange-pagination .ant-pagination-item-active a) {
  color: #ee4d2d !important;
}
</style>
