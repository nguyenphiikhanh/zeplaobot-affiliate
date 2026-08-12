<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { clearAuthTokens } from "../services/api";
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
  currentRouteKey.value === path || currentRouteKey.value.startsWith(`${path}/`);

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
        <nav class="p-3 pt-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-150px)]">
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
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200"
          >
            <span
              class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
            ></span>
            <span>Shopee Live API</span>
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
      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-100">
        <router-view />
      </main>
    </div>
  </div>
</template>
