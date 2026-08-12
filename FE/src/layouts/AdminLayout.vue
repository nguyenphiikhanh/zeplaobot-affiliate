<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
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
  ShoppingCartOutlined,
  WalletOutlined,
  TeamOutlined,
  HistoryOutlined,
  LinkOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  ShoppingOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const isCollapsed = ref(false);
const botStatus = ref(readZaloBotStatus());
const apiLoading = ref(false);
const year = new Date().getFullYear();

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

onMounted(async () => {
  window.addEventListener(ZALO_BOT_STATUS_EVENT, handleBotStatusEvent);
  window.addEventListener(API_ACTIVITY_EVENT, handleApiActivity);
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
];

const currentRouteKey = computed(() => route.path);

const isActive = (path: string) =>
  currentRouteKey.value === path ||
  currentRouteKey.value.startsWith(`${path}/`);

const navigate = (path: string) => {
  router.push(path);
};
</script>

<template>
  <div
    class="h-screen flex overflow-hidden bg-slate-100 text-slate-800 font-sans"
  >
    <!-- Clean White Sidebar -->
    <aside
      :class="[
        'bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 z-30 shadow-[4px_0_24px_rgba(15,23,42,0.035)] relative',
        isCollapsed ? 'w-[76px]' : 'w-[272px]',
      ]"
    >
      <div>
        <!-- Sidebar Brand Header -->
        <div
          :class="[
            'h-[72px] flex items-center border-b border-slate-100',
            isCollapsed ? 'px-3 justify-center' : 'px-4 justify-between',
          ]"
        >
          <router-link
            to="/admin/orders"
            class="flex items-center gap-3 overflow-hidden cursor-pointer"
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

          <button
            v-if="!isCollapsed"
            @click="isCollapsed = !isCollapsed"
            type="button"
            class="w-8 h-8 inline-flex items-center justify-center text-slate-400 hover:text-[#ee4d2d] rounded-xl hover:bg-orange-50 transition-colors cursor-pointer"
          >
            <component
              :is="isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
              class="text-base"
            />
          </button>
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
      <div class="p-3 border-t border-slate-100 space-y-2 bg-slate-50/60">
        <button
          v-if="isCollapsed"
          type="button"
          class="w-full h-10 inline-flex items-center justify-center rounded-xl text-slate-400 hover:text-[#ee4d2d] hover:bg-orange-50 transition-colors cursor-pointer"
          title="Mở rộng sidebar"
          @click="isCollapsed = false"
        >
          <MenuUnfoldOutlined class="text-base" />
        </button>
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
        class="h-[72px] bg-white/95 backdrop-blur border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20"
      >
        <div class="flex items-center gap-3">
          <h2 class="text-base font-extrabold text-slate-900 tracking-tight">
            ZeplaoBot Admin
          </h2>
        </div>

        <div class="flex items-center gap-4">
          <div
            :class="[
              'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border',
              botStatusClasses,
            ]"
          >
            <span :class="['w-2 h-2 rounded-full', botStatusDotClass]"></span>
            <span>{{ botStatusLabel }}</span>
          </div>

          <button
            type="button"
            class="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <BellOutlined class="text-base" />
          </button>
        </div>
      </header>

      <!-- Main Page Router View -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-100 flex flex-col justify-between">
        <div>
          <router-view />
        </div>

        <footer class="mt-8 border-t border-slate-200/80 pt-6 pb-2 text-center">
          <p class="text-xs text-slate-400 font-medium">
            © {{ year }}. Made & Support by
            <a
              href="https://www.facebook.com/nguyenphiikhanh"
              target="_blank"
              rel="noopener noreferrer"
              class="text-slate-600 hover:text-[#ee4d2d] font-semibold transition-colors"
            >KhanhNT</a>❤️
          </p>
        </footer>
      </main>
    </div>
  </div>
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
