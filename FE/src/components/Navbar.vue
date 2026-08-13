<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  HomeOutlined, 
  ShoppingOutlined, 
  WalletOutlined, 
  GiftOutlined,
  LogoutOutlined,
  DownOutlined,
  CopyOutlined,
} from '@ant-design/icons-vue'
import { getSessionUser, clearAuthTokens, type SessionUser } from '../services/api'

const router = useRouter()
const route = useRoute()
const user = ref<SessionUser | null>(null)
const avatarFailed = ref(false)

const navItems = [
  { id: 'home', label: 'Trang chủ', mobileLabel: 'Trang chủ', icon: HomeOutlined, path: '/' },
  { id: 'search', label: 'Đơn hàng', mobileLabel: 'Đơn hàng', icon: ShoppingOutlined, path: '/orders' },
  { id: 'wallet', label: 'Ví của bạn', mobileLabel: 'Ví', icon: WalletOutlined, path: '/wallet' },
]
const activeTab = computed(() => route.path === '/orders' ? 'search' : route.path === '/wallet' ? 'wallet' : 'home')
const navigate = (item: typeof navItems[number]) => {
  router.push(item.path)
}

onMounted(async () => {
  user.value = await getSessionUser()
  avatarFailed.value = false
})

const displayName = computed(() => {
  if (!user.value) return 'Tài khoản'
  if (user.value.name && user.value.name.trim()) return user.value.name.trim()
  return `ID: ${user.value.id}`
})

const avatarInitials = computed(() => {
  if (!user.value) return 'U'
  return (user.value.name?.trim().charAt(0) || user.value.id.charAt(0) || 'U').toUpperCase()
})
const avatarUrl = computed(() => !avatarFailed.value ? user.value?.image?.trim() || '' : '')

const copyTrackingCode = () => {
  if (user.value?.tracking_code) {
    navigator.clipboard.writeText(user.value.tracking_code)
    message.success('Đã sao chép mã theo dõi!')
  }
}

const handleLogout = () => {
  clearAuthTokens()
  message.success('Đã đăng xuất!')
  router.push('/login')
}
</script>

<template>
  <!-- Top Navigation Header -->
  <header class="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-gray-100/90 shadow-2xs transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-2.5 cursor-pointer group" @click="router.push('/')">
        <div class="relative w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-50 to-orange-50 border border-orange-100/80 shadow-2xs group-hover:scale-105 transition-transform duration-300">
          <div class="relative flex items-center justify-center">
            <GiftOutlined class="text-xl sm:text-2xl text-[#ff5733] transform group-hover:rotate-6 transition-transform" />
          </div>
        </div>
        <span class="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-[#d94f3d] via-rose-500 to-orange-500 bg-clip-text text-transparent inline-block">
          Affiliate Portal
        </span>
      </div>

      <!-- Desktop Navigation Pills -->
      <nav class="hidden md:flex items-center gap-1.5 bg-gray-50/90 p-1.5 rounded-full border border-gray-100 shadow-2xs">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="navigate(item)"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === item.id 
              ? 'bg-[#fff2ee] text-[#ff5733] border border-orange-200/60 shadow-2xs font-semibold' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border border-transparent'
          ]"
        >
          <component :is="item.icon" class="text-base" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Right Action Area (Desktop & Mobile Dropdown Trigger) -->
      <div class="flex items-center gap-3">
        <!-- Desktop User Button with Name -->
        <div class="hidden md:block">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <button
              type="button"
              class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200/80 cursor-pointer transition-all duration-200 shadow-2xs group"
            >
              <div class="w-9 h-9 overflow-hidden rounded-full bg-gradient-to-br from-[#ff6b4a] to-[#ff4520] text-white flex items-center justify-center font-extrabold text-xs shadow-xs group-hover:scale-105 transition-transform">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="h-full w-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                <span v-else class="text-white">{{ avatarInitials }}</span>
              </div>

              <div class="flex flex-col text-left pr-1">
                <span class="text-xs font-bold text-slate-800 group-hover:text-[#ff5733] max-w-[130px] truncate">
                  {{ displayName }}
                </span>
                <span v-if="user?.tracking_code" class="text-[10px] font-medium text-slate-400">
                  {{ user.tracking_code }}
                </span>
              </div>

              <DownOutlined class="text-xs text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            <template #overlay>
              <div class="w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-2 mt-2">
                <div class="p-3 bg-gradient-to-br from-rose-50/60 to-orange-50/60 rounded-xl space-y-1.5">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 overflow-hidden rounded-full bg-[#ff5733] text-white flex items-center justify-center font-black text-sm shrink-0">
                      <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="h-full w-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                      <span v-else class="text-white">{{ avatarInitials }}</span>
                    </div>
                    <div class="overflow-hidden">
                      <div class="text-sm font-bold text-slate-900 truncate">
                        {{ displayName }}
                      </div>
                      <div class="text-xs font-mono text-slate-500 truncate">
                        ID: {{ user?.id }}
                      </div>
                    </div>
                  </div>

                  <div 
                    v-if="user?.tracking_code"
                    @click="copyTrackingCode"
                    class="flex items-center justify-between bg-white/80 hover:bg-white border border-orange-200/80 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all text-xs text-slate-700 font-medium group"
                    title="Bấm để sao chép mã theo dõi"
                  >
                    <span class="font-mono font-bold text-orange-600 text-[11px]">
                      {{ user.tracking_code }}
                    </span>
                    <span class="text-[10px] text-slate-400 group-hover:text-slate-600 flex items-center gap-1">
                      <CopyOutlined class="text-[10px]" />
                      <span>Copy</span>
                    </span>
                  </div>
                </div>

                <div class="h-px bg-slate-100"></div>

                <button
                  @click="handleLogout"
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-all text-left"
                >
                  <LogoutOutlined class="text-sm" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </template>
          </a-dropdown>
        </div>

        <!-- Mobile User Avatar Only Trigger -->
        <div class="md:hidden">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <button
              type="button"
              class="w-9 h-9 overflow-hidden rounded-full bg-gradient-to-br from-[#ff6b4a] to-[#ff4520] text-white flex items-center justify-center font-extrabold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all border border-orange-200/80 cursor-pointer"
            >
              <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="h-full w-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
              <span v-else class="text-white">{{ avatarInitials }}</span>
            </button>

            <template #overlay>
              <div class="w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-2 mt-2">
                <div class="p-3 bg-gradient-to-br from-rose-50/60 to-orange-50/60 rounded-xl space-y-1.5">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 overflow-hidden rounded-full bg-[#ff5733] text-white flex items-center justify-center font-black text-sm shrink-0">
                      <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="h-full w-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                      <span v-else class="text-white">{{ avatarInitials }}</span>
                    </div>
                    <div class="overflow-hidden">
                      <div class="text-sm font-bold text-slate-900 truncate">
                        {{ displayName }}
                      </div>
                      <div class="text-xs font-mono text-slate-500 truncate">
                        ID: {{ user?.id }}
                      </div>
                    </div>
                  </div>

                  <div 
                    v-if="user?.tracking_code"
                    @click="copyTrackingCode"
                    class="flex items-center justify-between bg-white/80 hover:bg-white border border-orange-200/80 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all text-xs text-slate-700 font-medium group"
                    title="Bấm để sao chép mã theo dõi"
                  >
                    <span class="font-mono font-bold text-orange-600 text-[11px]">
                      {{ user.tracking_code }}
                    </span>
                    <span class="text-[10px] text-slate-400 group-hover:text-slate-600 flex items-center gap-1">
                      <CopyOutlined class="text-[10px]" />
                      <span>Copy</span>
                    </span>
                  </div>
                </div>

                <div class="h-px bg-slate-100"></div>

                <button
                  @click="handleLogout"
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-all text-left"
                >
                  <LogoutOutlined class="text-sm" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </template>
          </a-dropdown>
        </div>

      </div>

    </div>
  </header>

  <!-- Mobile Fixed Glassmorphic Bottom Navigation Bar -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 md:hidden w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/80 shadow-lg shadow-slate-900/10 pt-2 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
    <div class="max-w-md mx-auto flex items-center justify-around">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="navigate(item)"
        :class="[
          'flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl transition-all duration-200 relative cursor-pointer',
          activeTab === item.id 
            ? 'text-[#ff5733] font-bold' 
            : 'text-slate-500 hover:text-slate-800 font-medium'
        ]"
      >
        <!-- Active indicator pill background -->
        <div 
          v-if="activeTab === item.id" 
          class="absolute inset-0 bg-gradient-to-r from-rose-50/90 to-orange-50/90 border border-orange-200/80 rounded-xl -z-10 shadow-2xs transition-all duration-200"
        ></div>

        <component 
          :is="item.icon" 
          :class="[
            'text-xl transition-transform duration-200', 
            activeTab === item.id ? 'scale-110 text-[#ff5733]' : 'text-slate-400'
          ]" 
        />
        <span class="text-xs mt-1 tracking-tight leading-none">{{ item.mobileLabel || item.label }}</span>
      </button>
    </div>
  </nav>
</template>
