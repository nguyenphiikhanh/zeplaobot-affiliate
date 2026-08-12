<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
  HomeOutlined, 
  SearchOutlined, 
  WalletOutlined, 
  ClockCircleOutlined,
  GiftOutlined,
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  DownOutlined,
  CopyOutlined,
} from '@ant-design/icons-vue'
import { getSessionUser, clearAuthTokens, type SessionUser } from '../services/api'

const router = useRouter()
const activeTab = ref('home')
const user = ref<SessionUser | null>(null)
const isMobileMenuOpen = ref(false)

const navItems = [
  { id: 'home', label: 'Trang chủ', icon: HomeOutlined },
  { id: 'search', label: 'Tra cứu đơn hàng', icon: SearchOutlined },
  { id: 'wallet', label: 'Ví của bạn', icon: WalletOutlined },
  { id: 'guide', label: 'Hướng dẫn', icon: ClockCircleOutlined },
]

onMounted(async () => {
  user.value = await getSessionUser()
})

const displayName = computed(() => {
  if (!user.value) return 'Tài khoản'
  if (user.value.name && user.value.name.trim()) return user.value.name.trim()
  return `ID: ${user.value.id}`
})

const avatarInitials = computed(() => {
  if (!user.value) return 'U'
  if (user.value.name && user.value.name.trim()) {
    const parts = user.value.name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return user.value.name.substring(0, 2).toUpperCase()
  }
  return user.value.id.substring(0, 2).toUpperCase()
})

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
  <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-white/90 border-b border-gray-100/90 shadow-2xs transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3 cursor-pointer group" @click="router.push('/')">
        <div class="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-50 to-orange-50 border border-orange-100/80 shadow-2xs group-hover:scale-105 transition-transform duration-300">
          <div class="relative flex items-center justify-center">
            <GiftOutlined class="text-2xl text-[#ff5733] transform group-hover:rotate-6 transition-transform" />
          </div>
        </div>
        <span class="text-lg font-black tracking-tight bg-gradient-to-r from-[#d94f3d] via-rose-500 to-orange-500 bg-clip-text text-transparent hidden sm:inline-block">
          Affiliate Portal
        </span>
      </div>

      <!-- Desktop Navigation Pills -->
      <nav class="hidden md:flex items-center gap-1.5 bg-gray-50/90 p-1.5 rounded-full border border-gray-100 shadow-2xs">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeTab = item.id"
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

      <!-- Right Action Area (Desktop & Mobile trigger) -->
      <div class="flex items-center gap-3">
        <!-- Desktop User Dropdown -->
        <div class="hidden md:block">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <button
              type="button"
              class="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50/70 border border-slate-200/80 hover:border-orange-200/80 cursor-pointer transition-all duration-200 shadow-2xs group"
            >
              <!-- Avatar Circle -->
              <div class="w-9 h-9 rounded-full bg-gradient-to-br from-[#ff6b4a] to-[#ff4520] text-white flex items-center justify-center font-extrabold text-xs shadow-xs group-hover:scale-105 transition-transform">
                {{ avatarInitials }}
              </div>

              <!-- Display Name / ID -->
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

            <!-- Dropdown Menu Overlay -->
            <template #overlay>
              <div class="w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-2 mt-2">
                <!-- User Profile Header -->
                <div class="p-3 bg-gradient-to-br from-rose-50/60 to-orange-50/60 rounded-xl space-y-1.5">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-full bg-[#ff5733] text-white flex items-center justify-center font-black text-sm shrink-0">
                      {{ avatarInitials }}
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

                  <!-- Tracking Code Badge -->
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

                <!-- Logout Button -->
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

        <!-- Mobile Hamburger Button -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          type="button"
          class="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200 cursor-pointer transition-all"
        >
          <CloseOutlined v-if="isMobileMenuOpen" class="text-lg" />
          <MenuOutlined v-else class="text-lg" />
        </button>
      </div>

    </div>

    <!-- Mobile Navigation Drawer / Panel -->
    <div
      v-if="isMobileMenuOpen"
      class="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-4 animate-fadeIn"
    >
      <!-- User Info Box on Mobile -->
      <div class="p-3.5 bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff6b4a] to-[#ff4520] text-white flex items-center justify-center font-extrabold text-sm">
            {{ avatarInitials }}
          </div>
          <div>
            <div class="text-sm font-bold text-slate-800">
              {{ displayName }}
            </div>
            <div v-if="user?.tracking_code" class="text-xs font-mono text-slate-500">
              {{ user.tracking_code }}
            </div>
          </div>
        </div>

        <button
          @click="handleLogout"
          type="button"
          class="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <LogoutOutlined />
          <span>Thoát</span>
        </button>
      </div>

      <!-- Mobile Nav Links -->
      <div class="space-y-1">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeTab = item.id; isMobileMenuOpen = false"
          :class="[
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left',
            activeTab === item.id 
              ? 'bg-[#fff2ee] text-[#ff5733] border border-orange-200/60' 
              : 'text-slate-600 hover:bg-slate-50'
          ]"
        >
          <component :is="item.icon" class="text-lg" />
          <span>{{ item.label }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
