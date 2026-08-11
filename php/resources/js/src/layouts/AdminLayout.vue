<template>
  <a-layout class="h-screen overflow-hidden relative">
    <!-- Backdrop for Mobile when Sidebar is open -->
    <div
      v-if="isMobile && !collapsed"
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-[95] transition-opacity"
      @click="collapsed = true"
    ></div>

    <!-- Sidebar -->
    <a-layout-sider
      v-model:collapsed="collapsed"
      :collapsed-width="isMobile ? 0 : 80"
      :width="240"
      class="border-r border-slate-200 dark:border-slate-800 overflow-y-auto"
      theme="light"
      :style="{
        background: 'var(--bg-color)',
        zIndex: 100,
        position: isMobile && !collapsed ? 'fixed' : 'relative',
        height: '100%'
      }"
    >
      <!-- Logo -->
      <div
        class="h-16 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4"
      >
        <router-link
          to="/admin"
          class="flex items-center gap-2 cursor-pointer overflow-hidden"
          :class="collapsed ? 'justify-center w-full' : 'justify-start'"
        >
          <div
            class="w-9 h-9 rounded-full bg-slate-900/5 dark:bg-slate-100/10 flex items-center justify-center shrink-0 p-1 overflow-hidden"
          >
            <img :src="siteSettings.favicon" class="w-full h-full object-contain rounded-full" :alt="siteSettings.site_name" />
          </div>
          <div class="flex flex-col min-w-0" v-show="!collapsed">
            <span
              class="font-bold text-[15px] leading-tight tracking-tight text-slate-800 dark:text-slate-100 truncate"
              >{{ siteSettings.site_name }}</span
            >
            <span
              class="text-[9px] font-bold text-slate-500 tracking-widest uppercase truncate"
              >Workspace</span
            >
          </div>
        </router-link>

        <!-- Mobile Close Button -->
        <a-button
          v-if="isMobile && !collapsed"
          type="text"
          shape="circle"
          @click="collapsed = true"
          class="flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white"
          title="Đóng Menu"
        >
          <template #icon><CloseOutlined class="text-base" /></template>
        </a-button>
      </div>

      <!-- Navigation Menu -->
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        mode="inline"
        class="border-r-0 py-4"
        style="background: transparent"
        @click="handleMenuClick"
      >
        <a-menu-item key="/admin">
          <template #icon><DashboardOutlined /></template>
          Tổng quan
        </a-menu-item>

        <a-menu-item key="/admin/analytics">
          <template #icon><LineChartOutlined /></template>
          Thống kê
        </a-menu-item>

        <a-menu-item key="/admin/orders">
          <template #icon><ShoppingCartOutlined /></template>
          Đơn hàng
        </a-menu-item>

        <a-menu-item key="/admin/withdrawals">
          <template #icon><WalletOutlined /></template>
          Rút tiền
        </a-menu-item>

        <a-sub-menu key="users-sub">
          <template #icon><TeamOutlined /></template>
          <template #title>Người dùng</template>
          <a-menu-item key="/admin/users">
            <template #icon><UserOutlined /></template>
            Tất cả
          </a-menu-item>
          <a-menu-item key="/admin/blacklist">
            <template #icon><PushpinOutlined /></template>
            Danh sách ghim
          </a-menu-item>
        </a-sub-menu>

        <a-menu-item key="/admin/transaction-history">
          <template #icon><HistoryOutlined /></template>
          Lịch sử giao dịch
        </a-menu-item>

        <a-menu-item key="/admin/link-history">
          <template #icon><LinkOutlined /></template>
          Lịch sử tạo Link
        </a-menu-item>

        <a-menu-item key="/admin/tools">
          <template #icon><ToolOutlined /></template>
          Công cụ
        </a-menu-item>

        <a-menu-item key="/admin/settings">
          <template #icon><SettingOutlined /></template>
          Cấu hình hệ thống
        </a-menu-item>

        <a-divider style="margin: 8px 0" />

        <a-menu-item key="logout" danger @click="handleSignOut">
          <template #icon><LogoutOutlined /></template>
          Đăng xuất
        </a-menu-item>
      </a-menu>
    </a-layout-sider>

    <!-- Main Layout -->
    <a-layout>
      <!-- Header -->
      <a-layout-header
        class="h-16 px-4 lg:px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800"
        style="background: var(--bg-color); padding: 0 24px"
      >
        <div class="flex items-center gap-4">
          <a-button
            type="text"
            class="flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            @click="collapsed = !collapsed"
            title="Thu gọn / Mở rộng Sidebar"
          >
            <MenuUnfoldOutlined v-if="collapsed" class="text-lg" />
            <MenuFoldOutlined v-else class="text-lg" />
          </a-button>
          <h1
            class="text-sm font-bold text-slate-800 dark:text-slate-100 hidden sm:block tracking-tight mb-0"
          >
            Admin Console
          </h1>
        </div>

        <div class="flex items-center gap-3 select-none leading-normal">
          <a-button
            type="text"
            shape="circle"
            @click="toggleTheme"
            class="flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Chuyển đổi giao diện Sáng/Tối"
          >
            <template #icon>
              <span class="text-[16px] leading-none">{{
                isDark ? "🌞" : "🌙"
              }}</span>
            </template>
          </a-button>

          <!-- High-Tech Admin Avatar & Badge Container (No Name) -->
          <div class="relative group cursor-pointer" title="Tài khoản Quản Trị Viên (Admin)">
            <div class="relative w-10 h-10 rounded-xl p-[2px] bg-gradient-to-tr from-amber-500 via-red-500 to-rose-600 shadow-md shadow-red-500/20 group-hover:scale-105 transition-all duration-300">
              <div class="w-full h-full rounded-[10px] overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  v-if="userAvatar"
                  :src="userAvatar"
                  class="w-full h-full object-cover"
                  alt="Admin Avatar"
                />
                <div
                  v-else
                  class="h-full w-full bg-slate-900 dark:bg-slate-100 text-amber-400 dark:text-slate-900 font-black text-sm flex items-center justify-center uppercase"
                >
                  {{ firstLetter }}
                </div>
              </div>
            </div>
            <!-- ADM Crown Badge -->
            <div class="absolute -bottom-1 -right-1 px-1 py-0.2 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[8px] font-black uppercase rounded-md shadow-sm border border-white dark:border-slate-900 leading-tight">
              ADM
            </div>
          </div>
        </div>
      </a-layout-header>

      <!-- Content -->
      <a-layout-content
        class="overflow-y-auto p-4 sm:p-6 lg:p-8"
        style="background: var(--bg-content)"
      >
        <div
          class="mx-auto w-full"
          :class="route.path.startsWith('/admin/settings') ? 'max-w-[1700px]' : 'max-w-[1400px]'"
        >
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSiteSettings } from "@/composables/useSiteSettings";
import {
  DashboardOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  TeamOutlined,
  UserOutlined,
  PushpinOutlined,
  LinkOutlined,
  ToolOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HistoryOutlined,
  CrownOutlined,
  CloseOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { siteSettings } = useSiteSettings();

// Theme state Mock
const isDark = ref(false);
const toggleTheme = () => {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const collapsed = ref(false);
const selectedKeys = ref([route.path]);
const openKeys = ref([]);

// Sync active menu item and submenu expansion with route changes
watch(
  () => route.path,
  (newPath) => {
    const pathParts = newPath.split("/");
    if (pathParts.length > 3) {
      selectedKeys.value = [`/${pathParts[1]}/${pathParts[2]}`];
    } else {
      selectedKeys.value = [newPath];
    }
    if (newPath.startsWith("/admin/users") || newPath.startsWith("/admin/blacklist")) {
      if (!openKeys.value.includes("users-sub")) {
        openKeys.value = ["users-sub"];
      }
    } else {
      openKeys.value = openKeys.value.filter((k) => k !== "users-sub");
    }
  },
  { immediate: true }
);

const handleMenuClick = ({ key }) => {
  if (key === "logout") return;
  router.push(key);
  
  // Dismiss sticky tooltips on touch/mobile devices by blurring focus
  if (document.activeElement && typeof document.activeElement.blur === "function") {
    document.activeElement.blur();
  }
  document.querySelectorAll(".ant-tooltip").forEach((el) => {
    el.style.display = "none";
  });

  // Auto collapse on mobile after navigation
  if (window.innerWidth < 992) {
    collapsed.value = true;
  }
};

const userName = computed(() => authStore.user?.name || "Admin");
const userAvatar = computed(() => authStore.user?.image || "");
const firstLetter = computed(() => userName.value.charAt(0).toUpperCase());

const handleSignOut = async () => {
  try {
    await authStore.logout();
    router.push("/dang-nhap");
  } catch (err) {
    console.error("Lỗi khi đăng xuất:", err);
  }
};

const windowWidth = ref(typeof window !== "undefined" ? window.innerWidth : 1200);
const isMobile = computed(() => windowWidth.value < 768);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value < 992) {
    collapsed.value = true;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
:deep(.ant-layout-sider) {
  background: var(--bg-color) !important;
}

:deep(.ant-menu) {
  background: transparent !important;
}

:deep(.ant-layout-header) {
  background: var(--bg-color) !important;
}

:deep(.ant-layout-content) {
  background: var(--bg-content) !important;
}

:deep(.ant-menu-item-selected) {
  background-color: var(--ant-primary-color-deprecated-bg) !important;
  font-weight: bold;
}
</style>

<style>
/* Add custom CSS variables to match your Tailwind setup dynamically based on dark mode class if needed */
html {
  --bg-color: #ffffff;
  --bg-content: #f8fafc; /* slate-50 */
}

html.dark {
  --bg-color: #020617; /* slate-950 */
  --bg-content: #0b0f19; /* dark theme content bg */
}

/* Fix sticky tooltips on touch devices (iPad/Tablet/Mobile) */
@media (hover: none), (pointer: coarse) {
  .ant-tooltip,
  .ant-tooltip-inner {
    display: none !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }
}
</style>
