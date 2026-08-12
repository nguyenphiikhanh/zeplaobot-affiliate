<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { ReloadOutlined, SearchOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons-vue'
import { api, type ApiResponse } from '../services/api'

interface AdminUser {
  id: string
  name: string | null
  image: string | null
  available_balance: number
  pending_balance: number
  total_paid: number
  completed_orders: number
  created_at: string
}

const users = ref<AdminUser[]>([])
const selectedUser = ref<AdminUser | null>(null)
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const searchInput = ref('')
const search = ref('')
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))
const columns = [
  { title: 'Người dùng', key: 'user', width: 280 },
  { title: 'Số dư khả dụng', key: 'balance', align: 'right', width: 160 },
  { title: 'Đang chờ rút', key: 'pending', align: 'right', width: 150 },
  { title: 'Đơn hoàn thành', key: 'orders', align: 'center', width: 140 },
  { title: 'Ngày tham gia', key: 'created', align: 'right', width: 150 },
]

const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`
const date = (value: string) => new Date(value).toLocaleDateString('vi-VN')
const isNew = (value: string) => Date.now() - new Date(value).getTime() <= 30 * 24 * 60 * 60 * 1000

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await api.get<ApiResponse<{ users: AdminUser[]; total: number }>>('/api/admin/users/list', {
      params: { page: page.value, limit: limit.value, search: search.value || undefined },
    })
    users.value = response.data.data?.users || []
    total.value = response.data.data?.total || 0
  } catch {
    message.error('Không thể tải danh sách người dùng.')
  } finally {
    loading.value = false
  }
}

const applySearch = () => { search.value = searchInput.value.trim(); page.value = 1; fetchUsers() }
const clearSearch = () => { searchInput.value = ''; search.value = ''; page.value = 1; fetchUsers() }
onMounted(fetchUsers)
watch(limit, () => { page.value = 1; fetchUsers() })
</script>

<template>
  <div class="flex flex-col gap-6 pb-12">
    <div>
      <h2 class="text-lg font-bold tracking-tight text-slate-800">Quản lý Người dùng</h2>
      <p class="mt-1 text-[13px] text-slate-500">Danh sách người dùng đã tạo link Shopee qua Bot Zalo.</p>
    </div>

    <a-card :bordered="false" :body-style="{ padding: 0 }" class="overflow-hidden !rounded-2xl">
      <div class="flex flex-col justify-between gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
        <div class="flex flex-wrap items-center gap-3">
          <a-select v-model:value="limit" :options="[{label:'10 / trang',value:10},{label:'20 / trang',value:20},{label:'50 / trang',value:50},{label:'100 / trang',value:100}]" style="width:120px" />
          <a-input v-model:value="searchInput" allow-clear placeholder="Tìm theo tên hoặc Zalo UID..." class="w-64" @press-enter="applySearch" @change="!searchInput && search ? clearSearch() : undefined">
            <template #prefix><SearchOutlined class="text-slate-400" /></template>
          </a-input>
          <a-button type="primary" class="!inline-flex !h-8 !items-center !justify-center !border-none !bg-[#ee4d2d] !px-4 hover:!bg-[#d63d1e]" @click="applySearch"><span class="!text-white">Tìm kiếm</span></a-button>
        </div>
        <a-button :loading="loading" class="!inline-flex !h-8 !items-center !justify-center !gap-1.5 !border-[#ee4d2d] !text-[#ee4d2d] hover:!border-[#d63d1e] hover:!text-[#d63d1e]" @click="fetchUsers"><ReloadOutlined /><span>Làm mới</span></a-button>
      </div>

      <a-table :columns="columns" :data-source="users" row-key="id" :loading="loading" :pagination="false" :scroll="{x:1000}" :custom-row="(record: AdminUser) => ({onClick:()=>selectedUser=record,class:'cursor-pointer'})">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'user'">
            <div class="flex items-center gap-3 py-1">
              <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-orange-100 bg-orange-50">
                <img v-if="record.image" :src="record.image" referrerpolicy="no-referrer" class="h-full w-full object-cover" />
                <div v-else class="flex h-full w-full items-center justify-center font-black text-[#ee4d2d]">{{ record.name?.charAt(0)?.toUpperCase() || 'U' }}</div>
              </div>
              <div class="min-w-0"><div class="flex items-center gap-2"><b class="truncate text-xs text-slate-800">{{record.name || 'Người dùng Zalo'}}</b><a-tag v-if="isNew(record.created_at)" color="green" class="!m-0 !text-[9px]">Mới</a-tag></div><div class="mt-1 max-w-[210px] truncate font-mono text-[10px] text-slate-400">UID: {{record.id}}</div></div>
            </div>
          </template>
          <template v-else-if="column.key === 'balance'"><b class="text-xs text-emerald-600">{{money(record.available_balance)}}</b></template>
          <template v-else-if="column.key === 'pending'"><span class="text-xs font-semibold text-amber-600">{{money(record.pending_balance)}}</span></template>
          <template v-else-if="column.key === 'orders'"><b class="text-xs text-slate-700">{{record.completed_orders}}</b></template>
          <template v-else-if="column.key === 'created'"><span class="text-xs text-slate-500">{{date(record.created_at)}}</span></template>
        </template>
      </a-table>

      <div class="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row"><span class="text-xs text-slate-500">Hiển thị {{users.length}} / Tổng {{total}} người dùng</span><a-pagination v-if="totalPages>1" :current="page" :total="total" :page-size="limit" show-less-items @change="(value:number)=>{page=value;fetchUsers()}" /></div>
    </a-card>

    <a-drawer :open="!!selectedUser" title="Hồ sơ người dùng" width="430" @close="selectedUser=null">
      <div v-if="selectedUser" class="flex flex-col gap-5">
        <div class="flex flex-col items-center text-center">
          <div class="h-24 w-24 overflow-hidden rounded-full border-4 border-orange-50 bg-orange-50 shadow-sm"><img v-if="selectedUser.image" :src="selectedUser.image" referrerpolicy="no-referrer" class="h-full w-full object-cover" /><div v-else class="flex h-full w-full items-center justify-center text-3xl font-black text-[#ee4d2d]"><UserOutlined /></div></div>
          <h3 class="mb-0 mt-3 text-lg font-black text-slate-800">{{selectedUser.name || 'Người dùng Zalo'}}</h3><p class="mt-1 font-mono text-[11px] text-slate-400">UID: {{selectedUser.id}}</p>
        </div>
        <div class="grid grid-cols-2 gap-3"><div v-for="item in [{l:'Số dư khả dụng',v:money(selectedUser.available_balance)},{l:'Đang chờ rút',v:money(selectedUser.pending_balance)},{l:'Tổng đã rút',v:money(selectedUser.total_paid)},{l:'Đơn hoàn thành',v:String(selectedUser.completed_orders)}]" :key="item.l" class="rounded-xl border border-slate-200 p-4"><WalletOutlined class="mb-2 !text-[#ee4d2d]"/><div class="text-[10px] font-bold uppercase text-slate-400">{{item.l}}</div><div class="mt-1 text-sm font-black text-slate-800">{{item.v}}</div></div></div>
        <div class="rounded-xl border border-slate-200 p-4"><div class="text-[10px] font-bold uppercase text-slate-400">Ngày tham gia</div><div class="mt-1 text-sm font-bold text-slate-700">{{date(selectedUser.created_at)}}</div></div>
      </div>
    </a-drawer>
  </div>
</template>
