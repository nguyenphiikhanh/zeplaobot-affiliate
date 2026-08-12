<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { clearAuthTokens } from "../services/api";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  TeamOutlined,
  HistoryOutlined,
  LinkOutlined,
  ToolOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  HomeOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
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
    key: "/admin",
    title: "Tổng quan",
    icon: DashboardOutlined,
  },
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
        'bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 z-30 shadow-xs relative',
        isCollapsed ? 'w-20' : 'w-64',
      ]"
    >
      <div>
        <!-- Sidebar Brand Header -->
        <div
          class="h-16 px-4 flex items-center justify-between border-b border-slate-200"
        >
          <router-link
            to="/admin"
            class="flex items-center gap-3 overflow-hidden cursor-pointer"
          >
            <div
              class="w-9 h-9 rounded-xl bg-orange-50 p-1 flex items-center justify-center shrink-0 border border-orange-100"
            >
              <img
                src="/logo/shopee.png"
                class="w-full h-full object-contain"
                alt="ZeplaoBot Logo"
              />
            </div>
            <div v-show="!isCollapsed" class="flex flex-col text-left min-w-0">
              <span
                class="font-extrabold text-sm leading-tight text-slate-900 tracking-tight truncate"
              >
                ZeplaoBot Admin
              </span>
              <span
                class="text-[10px] font-bold text-[#ee4d2d] tracking-wider uppercase truncate"
              >
                Workspace Portal
              </span>
            </div>
          </router-link>

          <button
            @click="isCollapsed = !isCollapsed"
            type="button"
            class="text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <component
              :is="isCollapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
              class="text-base"
            />
          </button>
        </div>

        <!-- Sidebar Navigation Menu -->
        <nav class="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div
            v-show="!isCollapsed"
            class="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left"
          >
            Menu Quản trị
          </div>

          <button
            v-for="item in menuItems"
            :key="item.key"
            @click="navigate(item.key)"
            :class="[
              'w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer group',
              currentRouteKey === item.key
                ? 'bg-[#ee4d2d] !text-white shadow-md shadow-orange-500/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
            ]"
          >
            <component
              :is="item.icon"
              :class="[
                'text-base shrink-0 group-hover:scale-110 transition-transform',
                currentRouteKey === item.key
                  ? '!text-white'
                  : 'text-slate-500 group-hover:text-slate-900',
              ]"
            />
            <span
              v-show="!isCollapsed"
              :class="[
                'truncate text-left',
                currentRouteKey === item.key ? '!text-white' : '',
              ]"
            >
              {{ item.title }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Sidebar Bottom Profile / Logout -->
      <div class="p-3 border-t border-slate-200 space-y-1 bg-slate-50/50">
        <button
          @click="handleLogout"
          type="button"
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer',
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
        class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs"
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
