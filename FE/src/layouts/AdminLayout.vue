<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import {
  API_ACTIVITY_EVENT,
  api,
  clearAuthTokens,
  type ApiResponse,
} from "../services/api";
import {
  ZALO_BOT_STATUS_EVENT,
  readZaloBotStatus,
  saveZaloBotStatus,
  type ZaloBotStatus,
} from "../services/zalo-bot-status";
import {
  cacheAffiliateConfig,
  clearAffiliateConfigCache,
  hasCachedAffiliateConfig,
} from "../services/affiliate-config-state";
import {
  ShoppingCartOutlined,
  WalletOutlined,
  TeamOutlined,
  HistoryOutlined,
  LinkOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  CloseOutlined,
  BellOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  GlobalOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);
const isMobileMenuOpen = ref(false);
const botStatus = ref(readZaloBotStatus());
const apiLoading = ref(false);
const affiliateConfigRequired = ref(false);

const botStatusLabel = computed(() =>
  botStatus.value.connected ? "Bot đang hoạt động" : "Bot chưa hoạt động"
);
const botStatusClasses = computed(() =>
  botStatus.value.connected
    ? "bg-emerald-50 text-emerald-600 border-emerald-200"
    : botStatus.value.connecting
    ? "bg-amber-50 text-amber-600 border-amber-200"
    : "bg-slate-100 text-slate-500 border-slate-200"
);
const botStatusDotClass = computed(() =>
  botStatus.value.connected
    ? "bg-emerald-500 animate-pulse"
    : botStatus.value.connecting
    ? "bg-amber-500 animate-pulse"
    : "bg-slate-400"
);

const handleBotStatusEvent = (event: Event) => {
  botStatus.value = (event as CustomEvent<ZaloBotStatus>).detail;
};
const handleApiActivity = (event: Event) => {
  apiLoading.value = Number((event as CustomEvent<number>).detail || 0) > 0;
};

const checkAffiliateConfig = async () => {
  if (route.path === "/admin/shopee-config") {
    affiliateConfigRequired.value = false;
    return;
  }
  if (hasCachedAffiliateConfig()) {
    affiliateConfigRequired.value = false;
    return;
  }
  try {
    const response = await api.get<
      ApiResponse<{ settings: { affiliate_id?: string } }>
    >("/api/admin/shopee-config");
    const configured = Boolean(
      response.data.data?.settings.affiliate_id?.trim()
    );
    affiliateConfigRequired.value = !configured;
    if (configured) cacheAffiliateConfig();
  } catch {
    affiliateConfigRequired.value = false;
  }
};

watch(() => route.path, () => {
  checkAffiliateConfig();
  isMobileMenuOpen.value = false;
});

onMounted(async () => {
  window.addEventListener(ZALO_BOT_STATUS_EVENT, handleBotStatusEvent);
  window.addEventListener(API_ACTIVITY_EVENT, handleApiActivity);
  await checkAffiliateConfig();
  try {
    const response = await api.get<ApiResponse<ZaloBotStatus>>(
      "/api/admin/zalo-config/status"
    );
    if (response.data.data) {
      botStatus.value = response.data.data;
      saveZaloBotStatus(response.data.data);
    }
  } catch {
    // Keep the last cached status when the API is temporarily unavailable.
  }
});
onUnmounted(() => {
  window.removeEventListener(ZALO_BOT_STATUS_EVENT, handleBotStatusEvent);
  window.removeEventListener(API_ACTIVITY_EVENT, handleApiActivity);
});

const handleLogout = () => {
  clearAffiliateConfigCache();
  clearAuthTokens();
  message.info("Đã đăng xuất tài khoản Quản trị");
  router.push("/admin/login");
};

const menuItems = [
  {
    key: "/admin/orders",
    title: "Đơn hàng",
    icon: ShoppingCartOutlined,
  },
  {
    key: "/admin/withdrawals",
    title: "Rút tiền",
    icon: WalletOutlined,
  },
  {
    key: "/admin/users",
    title: "Người dùng",
    icon: TeamOutlined,
  },
  {
    key: "/admin/transaction-history",
    title: "Lịch sử giao dịch",
    icon: HistoryOutlined,
  },
  {
    key: "/admin/link-history",
    title: "Lịch sử tạo Link",
    icon: LinkOutlined,
  },
  {
    key: "/admin/shopee-config",
    title: "Cấu hình Shopee",
    icon: ShoppingOutlined,
  },
  {
    key: "/admin/settings",
    title: "Cấu hình Bot Zalo",
    icon: SettingOutlined,
  },
  {
    key: "/admin/general-config",
    title: "Cấu hình chung",
    icon: GlobalOutlined,
  },
];

const currentRouteKey = computed(() => route.path);

const isActive = (path: string) =>
  currentRouteKey.value === path ||
  currentRouteKey.value.startsWith(`${path}/`);

const navigate = (path: string) => {
  router.push(path);
  isMobileMenuOpen.value = false;
};
</script>

<template>
  <div
    class="h-screen flex overflow-hidden bg-slate-100 text-slate-800 font-sans relative"
  >
    <!-- Desktop Clean White Sidebar (Hidden on Mobile/Tablet < 1024px) -->
    <aside
      :class="[
        'bg-white border-r border-slate-200/80 hidden lg:flex flex-col justify-between transition-all duration-300 z-30 shadow-[4px_0_24px_rgba(15,23,42,0.035)] relative shrink-0',
        isCollapsed ? 'w-[76px]' : 'w-[272px]',
      ]"
    >
      <div>
        <!-- Sidebar Brand Header -->
        <div
          :class="[
            'h-[72px] flex items-center border-b border-slate-100',
            isCollapsed ? 'px-3 justify-center' : 'px-4',
          ]"
        >
          <router-link
            to="/admin/orders"
            class="flex items-center gap-3 overflow-hidden cursor-pointer min-w-0"
          >
            <div
              class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/70 p-1.5 flex items-center justify-center shrink-0 border border-orange-100 shadow-sm shadow-orange-500/10"
            >
              <img
                src="/logo/shopee.png"
                class="w-full h-full object-contain"
                alt="ZeplaoBot Logo"
              />
            </div>
            <div v-show="!isCollapsed" class="flex flex-col text-left min-w-0">
              <span
                class="font-black text-sm leading-tight text-slate-900 tracking-tight truncate"
              >
                ZeplaoBot Admin
              </span>
              <span
                class="text-[10px] font-bold text-[#ee4d2d] tracking-wider uppercase truncate"
              >
                Shopee Workspace
              </span>
            </div>
          </router-link>
        </div>

        <!-- Sidebar Navigation Menu -->
        <nav
          class="p-3 pt-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-150px)]"
        >
          <div
            v-show="!isCollapsed"
            class="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.16em] text-left"
          >
            Quản lý hệ thống
          </div>

          <button
            v-for="item in menuItems"
            :key="item.key"
            @click="navigate(item.key)"
            :class="[
              'relative w-full flex items-center gap-3 px-3.5 h-11 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer group',
              isCollapsed ? 'justify-center' : '',
              isActive(item.key)
                ? 'bg-[#fff1ed] !text-[#ee4d2d] shadow-sm shadow-orange-500/5'
                : 'text-slate-600 hover:text-[#ee4d2d] hover:bg-orange-50/70',
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                'text-[17px] shrink-0 transition-colors',
                isActive(item.key)
                  ? '!text-[#ee4d2d]'
                  : 'text-slate-400 group-hover:text-[#ee4d2d]',
              ]"
            />
            <span
              v-show="!isCollapsed"
              :class="[
                'truncate text-left',
                isActive(item.key) ? '!text-[#ee4d2d]' : '',
              ]"
            >
              {{ item.title }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Sidebar Bottom Profile / Logout -->
      <div class="p-3 border-t border-slate-100 bg-slate-50/60">
        <button
          @click="handleLogout"
          type="button"
          :class="[
            'w-full h-10 flex items-center gap-3 px-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer',
            isCollapsed ? 'justify-center' : '',
          ]"
          title="Đăng xuất Admin"
        >
          <LogoutOutlined class="text-base text-rose-600 shrink-0" />
          <span v-show="!isCollapsed" class="truncate">Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Navigation Drawer (< 1024px) -->
    <a-drawer
      :open="isMobileMenuOpen"
      placement="left"
      :closable="false"
      @close="isMobileMenuOpen = false"
      width="280px"
      :body-style="{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff' }"
    >
      <div class="flex flex-col justify-between h-full bg-white">
        <div>
          <!-- Drawer Brand Header -->
          <div class="h-[72px] px-4 flex items-center justify-between border-b border-slate-100">
            <router-link
              to="/admin/orders"
              class="flex items-center gap-3 overflow-hidden cursor-pointer"
              @click="isMobileMenuOpen = false"
            >
              <div
                class="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/70 p-1.5 flex items-center justify-center shrink-0 border border-orange-100 shadow-sm"
              >
                <img
                  src="/logo/shopee.png"
                  class="w-full h-full object-contain"
                  alt="ZeplaoBot Logo"
                />
              </div>
              <div class="flex flex-col text-left min-w-0">
                <span class="font-black text-sm text-slate-900 tracking-tight truncate">
                  ZeplaoBot Admin
                </span>
                <span class="text-[10px] font-bold text-[#ee4d2d] tracking-wider uppercase truncate">
                  Shopee Workspace
                </span>
              </div>
            </router-link>

            <button
              type="button"
              @click="isMobileMenuOpen = false"
              class="w-8 h-8 inline-flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <CloseOutlined class="text-base" />
            </button>
          </div>

          <!-- Drawer Navigation Menu -->
          <nav class="p-3 pt-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div class="px-3 pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.16em] text-left">
              Quản lý hệ thống
            </div>

            <button
              v-for="item in menuItems"
              :key="item.key"
              @click="navigate(item.key)"
              :class="[
                'w-full flex items-center gap-3 px-3.5 h-11 rounded-xl text-[13px] font-bold transition-all duration-200 cursor-pointer group',
                isActive(item.key)
                  ? 'bg-[#fff1ed] !text-[#ee4d2d] shadow-sm shadow-orange-500/5'
                  : 'text-slate-600 hover:text-[#ee4d2d] hover:bg-orange-50/70',
              ]"
            >
              <component
                :is="item.icon"
                :class="[
                  'text-[17px] shrink-0 transition-colors',
                  isActive(item.key) ? '!text-[#ee4d2d]' : 'text-slate-400 group-hover:text-[#ee4d2d]',
                ]"
              />
              <span :class="['truncate text-left', isActive(item.key) ? '!text-[#ee4d2d]' : '']">
                {{ item.title }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Drawer Bottom Logout -->
        <div class="p-3 border-t border-slate-100 bg-slate-50/60">
          <button
            @click="handleLogout"
            type="button"
            class="w-full h-11 flex items-center gap-3 px-3.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogoutOutlined class="text-base text-rose-600 shrink-0" />
            <span class="truncate">Đăng xuất Admin</span>
          </button>
        </div>
      </div>
    </a-drawer>

    <!-- Main Content Layout Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <div
        class="absolute left-0 right-0 top-0 z-50 h-[3px] overflow-hidden"
        aria-hidden="true"
      >
        <div
          v-if="apiLoading"
          class="admin-loading-bar h-full bg-[#ee4d2d]"
        ></div>
      </div>

      <!-- Top Header Bar -->
      <header
        class="h-[72px] bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20"
      >
        <div class="flex items-center gap-2 sm:gap-3 min-w-0">
          <!-- Mobile Hamburger Toggle Button (< 1024px) -->
          <button
            type="button"
            @click="isMobileMenuOpen = true"
            class="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Mở menu quản trị"
          >
            <MenuOutlined class="text-lg" />
          </button>

          <!-- Desktop Sidebar Toggle Button (>= 1024px) -->
          <button
            type="button"
            @click="isCollapsed = !isCollapsed"
            class="hidden lg:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            :title="isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
          >
            <component :is="isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined" class="text-base" />
          </button>

          <h2 class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
            ZeplaoBot Admin
          </h2>
        </div>

        <div class="flex items-center gap-2 sm:gap-4 shrink-0">
          <div
            :class="[
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold border transition-colors',
              botStatusClasses,
            ]"
          >
            <span :class="['w-2 h-2 rounded-full shrink-0', botStatusDotClass]"></span>
            <span class="truncate max-w-[120px] sm:max-w-none">{{ botStatusLabel }}</span>
          </div>

          <button
            type="button"
            class="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Thông báo"
          >
            <BellOutlined class="text-base" />
          </button>
        </div>
      </header>

      <!-- Main Page Router View -->
      <main
        class="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-slate-100"
      >
        <router-view />
      </main>
    </div>
  </div>

  <a-modal
    :open="affiliateConfigRequired"
    title="Yêu cầu cấu hình Affiliate ID"
    :closable="false"
    :mask-closable="false"
    :keyboard="false"
    width="440px"
  >
    <div class="py-2 text-sm leading-6 text-slate-600">
      Affiliate ID là cấu hình bắt buộc để hệ thống hoạt động. Vui lòng thiết
      lập trước khi sử dụng các chức năng khác.
    </div>
    <template #footer>
      <a-button
        type="primary"
        class="!inline-flex !items-center !justify-center"
        @click="router.push('/admin/shopee-config')"
        >Đến trang cài đặt</a-button
      >
    </template>
  </a-modal>
</template>

<style scoped>
.admin-loading-bar {
  width: 42%;
  animation: admin-loading 1.05s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(238, 77, 45, 0.55);
}
@keyframes admin-loading {
  0% {
    transform: translateX(-110%);
  }
  100% {
    transform: translateX(340%);
  }
}
</style>
