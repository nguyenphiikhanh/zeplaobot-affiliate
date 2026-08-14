<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  CopyOutlined,
  DownOutlined,
} from '@ant-design/icons-vue'
import { api, clearAuthTokens, getSessionUser, type ApiResponse, type SessionUser } from '../services/api'

interface SiteConfig {
  site_name: string
  site_description: string
  meta_title: string
  meta_description: string
}

const route = useRoute()
const router = useRouter()
const user = ref<SessionUser | null>(null)
const siteConfig = ref<SiteConfig | null>(null)
const avatarFailed = ref(false)

const navItems = [
  { path: '/', label: 'Tổng quan', mobileLabel: 'Tổng quan', menuTitle: 'TỔNG QUAN', icon: AppstoreOutlined },
  { path: '/generate-link', label: 'Tạo link', mobileLabel: 'Tạo link', menuTitle: 'TẠO LINK', icon: ShoppingCartOutlined },
  { path: '/orders', label: 'Đơn hàng', mobileLabel: 'Đơn hàng', menuTitle: 'ĐƠN HÀNG', icon: FileTextOutlined },
  { path: '/wallet', label: 'Ví tiền', mobileLabel: 'Ví tiền', menuTitle: 'VÍ TIỀN', icon: WalletOutlined },
  { path: '/profile', label: 'Thông tin', mobileLabel: 'Thông tin', menuTitle: 'THÔNG TIN', icon: UserOutlined },
]

const activeIndex = computed(() => {
  const path = route.path
  if (path === '/') return 0
  if (path.startsWith('/generate-link')) return 1
  if (path.startsWith('/orders')) return 2
  if (path.startsWith('/wallet')) return 3
  if (path.startsWith('/profile')) return 4
  return 0
})

const currentMenuLabel = computed(() => {
  const path = route.path
  if (path === '/') return 'TỔNG QUAN'
  if (path.startsWith('/generate-link')) return 'TẠO LINK'
  if (path.startsWith('/orders')) return 'ĐƠN HÀNG'
  if (path.startsWith('/wallet')) return 'VÍ TIỀN'
  if (path.startsWith('/profile')) return 'THÔNG TIN'
  return 'TỔNG QUAN'
})

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const loadData = async () => {
  try {
    user.value = await getSessionUser()
    avatarFailed.value = false
  } catch {
    // ignore
  }

  try {
    const res = await api.get<ApiResponse<SiteConfig>>('/api/site-config')
    if (res.data?.data) {
      siteConfig.value = res.data.data
    }
  } catch {
    // ignore
  }
}

onMounted(() => {
  loadData()
})

const siteName = computed(() => {
  return siteConfig.value?.site_name?.trim() || 'Affiliate - Hoàn tiền'
})

const siteSubtitle = computed(() => {
  return siteConfig.value?.site_description?.trim() || 'Hoàn tiền affiliate'
})

const siteInitials = computed(() => {
  const name = siteName.value.replace(/[^a-zA-Z0-9\s]/g, '').trim()
  const words = name.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return (name.slice(0, 2) || 'SH').toUpperCase()
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
const avatarUrl = computed(() => (!avatarFailed.value ? user.value?.image?.trim() || '' : ''))

const copyTrackingCode = () => {
  if (user.value?.tracking_code) {
    navigator.clipboard.writeText(user.value.tracking_code)
    message.success('Đã sao chép mã theo dõi!')
  }
}

const handleLogout = () => {
  clearAuthTokens()
  message.info('Đã đăng xuất tài khoản')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
    <!-- ============================================== -->
    <!-- 1. MOBILE TOP HEADER (< md)                   -->
    <!-- ============================================== -->
    <header class="md:hidden bg-gradient-to-r from-[#ee4d2d] via-[#f05330] to-[#ff5722] text-white shadow-md sticky top-0 z-30 pb-5 rounded-b-2xl sm:rounded-b-3xl">
      <div class="max-w-md mx-auto px-3.5 h-12 flex items-center justify-between">
        <!-- Mobile Brand Info -->
        <router-link to="/" class="flex items-center gap-2.5 overflow-hidden text-left cursor-pointer">
          <div class="w-8 h-8 rounded-xl bg-white text-[#ee4d2d] font-black text-xs flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
              @error="avatarFailed = true"
            />
            <span v-else class="text-[#ee4d2d] font-black text-sm">{{ avatarInitials }}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-extrabold text-sm tracking-tight leading-none truncate">
              {{ siteName }}
            </span>
            <span class="text-[11px] text-orange-100 font-medium tracking-normal mt-0.5 truncate">Hoàn tiền Affiliate</span>
          </div>
        </router-link>

        <!-- Mobile Header Logout Button -->
        <button
          type="button"
          @click="handleLogout"
          class="h-7 px-2.5 rounded-full border border-white/40 bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <LogoutOutlined class="text-[10px]" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <!-- 50% Vertical Overlap Floating Greeting Card on Mobile Header -->
      <div class="max-w-md mx-auto px-3 -mb-10 pt-0.5 relative z-10">
        <div class="bg-white rounded-xl sm:rounded-2xl px-3 py-2 sm:p-3.5 border border-slate-200/90 shadow-sm text-left">
          <div class="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            {{ currentMenuLabel }}
          </div>
          <h1 class="text-base sm:text-lg font-black text-slate-900 mt-0.5 tracking-tight truncate" style="-webkit-text-stroke: 0.15px currentColor; font-weight: 900;">
            Xin chào, <span class="text-[#ee4d2d]" style="-webkit-text-stroke: 0.15px #ee4d2d;">{{ user?.name || 'Khách hàng' }}</span>
          </h1>
          <p class="text-[10px] sm:text-xs text-slate-400 font-medium mt-0.5 truncate">Chúc bạn có trải nghiệm tốt khi sử dụng hệ thống</p>
        </div>
      </div>
    </header>

    <!-- ============================================== -->
    <!-- 2. DESKTOP TOP NAVBAR (>= md)                 -->
    <!-- ============================================== -->
    <header class="hidden md:block sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 border-b border-slate-200/90 shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <!-- Desktop Brand Logo -->
        <router-link to="/" class="flex items-center gap-3 cursor-pointer group">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ee4d2d] to-[#ff5722] text-white font-black text-base flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform overflow-hidden shrink-0">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer"
              @error="avatarFailed = true"
            />
            <span v-else class="text-white font-black text-base">{{ avatarInitials }}</span>
          </div>
          <div class="flex flex-col text-left">
            <span class="text-lg font-black tracking-tight text-slate-900 leading-none">
              {{ siteName }}
            </span>
            <span class="text-xs font-bold text-[#ee4d2d] tracking-normal mt-0.5 max-w-[240px] truncate">Hoàn tiền Affiliate</span>
          </div>
        </router-link>

        <!-- Desktop iOS-Style Segmented Slider Navigation Pills -->
        <nav class="relative flex items-center bg-slate-100/90 p-1 rounded-full border border-slate-200/80 shadow-inner w-[540px]">
          <!-- iOS Sliding Pill Indicator -->
          <div
            class="absolute top-1 bottom-1 rounded-full bg-white shadow-sm border border-slate-200/70 transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
            :style="{
              left: `calc(${activeIndex} * (100% - 8px) / 5 + 4px)`,
              width: `calc((100% - 8px) / 5)`,
            }"
          ></div>

          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            :class="[
              'relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-colors duration-200 select-none cursor-pointer text-center truncate',
              isActive(item.path)
                ? 'text-[#ee4d2d]'
                : 'text-slate-500 hover:text-slate-800',
            ]"
          >
            <component :is="item.icon" class="text-sm shrink-0" />
            <span class="truncate">{{ item.label }}</span>
          </router-link>
        </nav>

        <!-- Desktop User Dropdown Menu -->
        <div class="flex items-center gap-3">
          <a-dropdown :trigger="['click']" placement="bottomRight">
            <button
              type="button"
              class="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-slate-200/80 bg-white shadow-2xs transition-all cursor-pointer group"
            >
              <div class="w-8 h-8 rounded-full bg-[#ee4d2d] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="w-full h-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                <span v-else>{{ avatarInitials }}</span>
              </div>

              <div class="flex flex-col text-left pr-1">
                <span class="text-xs font-bold text-slate-800 group-hover:text-[#ee4d2d] max-w-[120px] truncate">
                  {{ displayName }}
                </span>
              </div>

              <DownOutlined class="text-[10px] text-slate-400 group-hover:text-slate-600 transition-transform" />
            </button>

            <template #overlay>
              <div class="w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 space-y-2 mt-2">
                <div class="p-3 bg-gradient-to-br from-orange-50/80 to-rose-50/60 rounded-xl space-y-1.5 text-left">
                  <div class="flex items-center gap-2.5">
                    <div class="w-10 h-10 rounded-full bg-[#ee4d2d] text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden">
                      <img v-if="avatarUrl" :src="avatarUrl" :alt="displayName" class="w-full h-full object-cover" referrerpolicy="no-referrer" @error="avatarFailed = true" />
                      <span v-else>{{ avatarInitials }}</span>
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
                    class="flex items-center justify-between bg-white border border-orange-200/80 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all text-xs text-slate-700 font-medium hover:border-orange-300"
                    title="Bấm để sao chép mã theo dõi"
                  >
                    <span class="font-mono font-bold text-[#ee4d2d] text-[11px]">
                      #{{ user.tracking_code }}
                    </span>
                    <span class="text-[10px] text-slate-400 flex items-center gap-1">
                      <CopyOutlined class="text-[10px]" />
                      <span>Copy</span>
                    </span>
                  </div>
                </div>

                <div class="h-px bg-slate-100"></div>

                <button
                  @click="handleLogout"
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer transition-all text-left"
                >
                  <LogoutOutlined class="text-sm" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </template>
          </a-dropdown>
        </div>
      </div>
    </header>

    <!-- ============================================== -->
    <!-- 3. MAIN CONTENT (Responsive Mobile / Desktop)  -->
    <!-- ============================================== -->
    <main class="flex-1 w-full max-w-md md:max-w-5xl lg:max-w-6xl mx-auto p-2.5 sm:p-4 md:p-6 pt-6 md:pt-6 pb-20 md:pb-12 space-y-2 sm:space-y-4">
      <router-view />
    </main>

    <!-- ============================================== -->
    <!-- 4. MOBILE iOS-STYLE SLIDING BOTTOM BAR (< md)  -->
    <!-- ============================================== -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
      <div class="relative max-w-md mx-auto h-16 px-1.5 flex items-center">
        <!-- iOS Sliding Active Box Indicator -->
        <div
          class="absolute top-1.5 bottom-1.5 rounded-2xl bg-orange-50/90 border border-orange-200/90 shadow-xs transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none"
          :style="{
            left: `calc(${activeIndex} * (100% - 12px) / 5 + 6px)`,
            width: `calc((100% - 12px) / 5)`,
          }"
        ></div>

        <!-- 5 Menu Items -->
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'relative z-10 flex-1 flex flex-col items-center justify-center h-full transition-all duration-200 select-none cursor-pointer',
            isActive(item.path)
              ? 'text-[#ee4d2d] font-black'
              : 'text-slate-500 font-medium hover:text-slate-800',
          ]"
        >
          <div
            :class="[
              'w-7 h-7 flex items-center justify-center transition-transform duration-200',
              isActive(item.path) ? 'scale-110 text-[#ee4d2d]' : 'text-slate-500',
            ]"
          >
            <component :is="item.icon" class="text-lg" />
          </div>
          <span
            :class="[
              'text-[10px] mt-0.5 tracking-tight truncate max-w-[64px] transition-colors',
              isActive(item.path) ? 'text-[#ee4d2d] font-black' : 'text-slate-500',
            ]"
          >
            {{ item.mobileLabel }}
          </span>
        </router-link>
      </div>
    </nav>
  </div>
</template>
