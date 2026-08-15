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
  RobotOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  CloseOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  GlobalOutlined,
  AppstoreOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);
const showMoreDrawer = ref(false);
const botStatus = ref(readZaloBotStatus());
const apiLoading = ref(false);
const affiliateConfigRequired = ref(false);

const botStatusLabel = computed(() => {
  return botStatus.value?.connected ? "Bot đang hoạt động" : "Bot chưa hoạt động";
});

const botStatusClasses = computed(() => {
  return botStatus.value?.connected
    ? "bg-emerald-50 text-emerald-600 border-emerald-200/80"
    : "bg-slate-100 text-slate-500 border-slate-200";
});

const botStatusDotClass = computed(() => {
  return botStatus.value?.connected ? "bg-emerald-500" : "bg-slate-400";
});

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

watch(
  () => route.path,
  () => {
    checkAffiliateConfig();
    showMoreDrawer.value = false;
  }
);

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
    icon: RobotOutlined,
  },
  {
    key: "/admin/general-config",
    title: "Cấu hình hệ thống",
    icon: SettingOutlined,
  },
];

const mobileNavItems = [
  { key: "/admin/orders", label: "Đơn hàng", icon: ShoppingCartOutlined },
  { key: "/admin/withdrawals", label: "Rút tiền", icon: WalletOutlined },
  { key: "/admin/link-history", label: "Tạo link", icon: LinkOutlined },
  { key: "/admin/users", label: "Người dùng", icon: TeamOutlined },
];

const drawerMenuItems = [
  {
    key: "/admin/transaction-history",
    label: "Lịch sử giao dịch",
    icon: HistoryOutlined,
    bgColor: "bg-amber-100/80",
    textColor: "text-amber-600",
  },
  {
    key: "/admin/shopee-config",
    label: "Cấu hình Shopee",
    icon: ShoppingOutlined,
    bgColor: "bg-blue-100/80",
    textColor: "text-blue-600",
  },
  {
    key: "/admin/settings",
    label: "Cấu hình Bot Zalo",
    icon: RobotOutlined,
    bgColor: "bg-purple-100/80",
    textColor: "text-purple-600",
  },
  {
    key: "/admin/general-config",
    label: "Cấu hình hệ thống",
    icon: SettingOutlined,
    bgColor: "bg-emerald-100/80",
    textColor: "text-emerald-600",
  },
];

const currentRouteKey = computed(() => route.path);

const isActive = (path: string) =>
  currentRouteKey.value === path ||
  currentRouteKey.value.startsWith(`${path}/`);

const isDrawerRouteActive = computed(() => {
  return drawerMenuItems.some((item) => isActive(item.key));
});

const navigate = (path: string) => {
  router.push(path);
  showMoreDrawer.value = false;
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
                Admin
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
          <!-- Desktop Sidebar Toggle Button (>= 1024px) -->
          <button
            type="button"
            @click="isCollapsed = !isCollapsed"
            class="hidden lg:inline-flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            :title="isCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'"
          >
            <component
              :is="isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
              class="text-base"
            />
          </button>

          <h2
            class="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate"
          >
            Admin
          </h2>
        </div>

        <div class="flex items-center gap-2 sm:gap-4 shrink-0">
          <div
            :class="[
              'flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold border transition-colors',
              botStatusClasses,
            ]"
          >
            <span
              :class="['w-2 h-2 rounded-full shrink-0', botStatusDotClass]"
            ></span>
            <span class="truncate max-w-[120px] sm:max-w-none">{{
              botStatusLabel
            }}</span>
          </div>
        </div>
      </header>

      <!-- Main Page Router View -->
      <main
        class="flex-1 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto bg-slate-100"
      >
        <router-view />
      </main>
    </div>
  </div>

  <!-- ============================================== -->
  <!-- MOBILE iOS-STYLE SLIDING BOTTOM BAR (< lg)    -->
  <!-- ============================================== -->
  <nav
    class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
  >
    <div
      class="relative max-w-md mx-auto h-16 px-1.5 flex items-center justify-around"
    >
      <!-- 4 Main Nav Items -->
      <button
        v-for="item in mobileNavItems"
        :key="item.key"
        type="button"
        @click="navigate(item.key)"
        class="flex-1 flex flex-col items-center justify-center py-1 relative z-10 cursor-pointer select-none"
      >
        <div
          :class="[
            'w-7 h-7 flex items-center justify-center transition-transform duration-200',
            isActive(item.key) ? 'scale-110 text-[#ee4d2d]' : 'text-slate-500',
          ]"
        >
          <component :is="item.icon" class="text-lg" />
        </div>
        <span
          :class="[
            'text-[11px] mt-0.5 tracking-tight truncate max-w-[68px] transition-colors',
            isActive(item.key)
              ? 'text-[#ee4d2d] font-black'
              : 'text-slate-500 font-bold',
          ]"
        >
          {{ item.label }}
        </span>
      </button>

      <!-- "Thêm" Button -->
      <button
        type="button"
        @click="showMoreDrawer = !showMoreDrawer"
        class="flex-1 flex flex-col items-center justify-center py-1 relative z-10 cursor-pointer select-none"
      >
        <div
          :class="[
            'w-7 h-7 flex items-center justify-center transition-transform duration-200',
            showMoreDrawer || isDrawerRouteActive
              ? 'scale-110 text-[#ee4d2d]'
              : 'text-slate-500',
          ]"
        >
          <AppstoreOutlined class="text-lg" />
        </div>
        <span
          :class="[
            'text-[11px] mt-0.5 tracking-tight truncate max-w-[68px] transition-colors',
            showMoreDrawer || isDrawerRouteActive
              ? 'text-[#ee4d2d] font-black'
              : 'text-slate-500 font-bold',
          ]"
        >
          Thêm
        </span>
      </button>
    </div>
  </nav>

  <!-- ============================================== -->
  <!-- iOS-STYLE BOTTOM SHEET DRAWER (TELEPORT TO BODY)-->
  <!-- ============================================== -->
  <teleport to="body">
    <!-- Backdrop Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showMoreDrawer"
        class="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs cursor-pointer"
        @click="showMoreDrawer = false"
      ></div>
    </transition>

    <!-- iOS Bottom Sheet Panel -->
    <transition
      enter-active-class="transition-transform duration-300 cubic-bezier(0.25, 1, 0.5, 1)"
      enter-from-class="translate-y-full"
      enter-to-class="translate-y-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-y-0"
      leave-to-class="translate-y-full"
    >
      <div
        v-if="showMoreDrawer"
        class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-4 sm:p-5 max-w-md mx-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-slate-100 text-left space-y-4"
      >
        <!-- iOS Handle Bar -->
        <div
          class="w-12 h-1.5 rounded-full bg-slate-300 mx-auto cursor-pointer"
          @click="showMoreDrawer = false"
        ></div>

        <!-- Section Title -->
        <div class="px-1 flex items-center justify-between">
          <span
            class="text-xs font-black uppercase text-slate-400 tracking-wider"
            >Danh mục quản trị khác</span
          >
        </div>

        <!-- Menu Items Grid (App Cards format like image) -->
        <div class="grid grid-cols-4 gap-2 sm:gap-3 py-1">
          <button
            v-for="item in drawerMenuItems"
            :key="item.key"
            type="button"
            @click="navigate(item.key)"
            :class="[
              'rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer transition-all active:scale-95 border select-none min-h-[92px]',
              isActive(item.key)
                ? 'bg-orange-50/90 border-orange-200 shadow-2xs'
                : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/80',
            ]"
          >
            <!-- Pastel Soft Icon Badge -->
            <div
              :class="[
                'w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 transition-transform',
                isActive(item.key)
                  ? 'bg-[#ee4d2d] text-white shadow-xs'
                  : `${item.bgColor} ${item.textColor}`,
              ]"
            >
              <component :is="item.icon" />
            </div>

            <!-- Centered Label -->
            <span
              :class="[
                'text-[11px] sm:text-xs font-bold leading-tight text-center tracking-tight line-clamp-2',
                isActive(item.key) ? 'text-[#ee4d2d] font-black' : 'text-slate-700',
              ]"
            >
              {{ item.label }}
            </span>
          </button>
        </div>

        <!-- Logout Action Button -->
        <div class="pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="handleLogout"
            class="w-full h-11 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-600 hover:bg-rose-100/70 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <LogoutOutlined class="text-sm" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </transition>
  </teleport>

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
