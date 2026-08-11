<template>
  <div>
    <!-- Desktop & Tablet Header -->
    <a-layout-header class="app-header">
      <div class="header-container">
        <!-- Logo -->
        <router-link
          :to="{ name: 'home' }"
          class="flex items-center gap-2 mr-8"
        >
          <div class="flex items-center gap-1.5">
            <img
              :src="siteSettings.logo_light"
              class="h-9 w-auto max-w-28 object-contain"
              :alt="siteSettings.site_name"
            />
            <a-tag
              color="orange"
              :bordered="false"
              class="m-0 text-[8px] sm:text-[9px] font-extrabold tracking-widest rounded px-1.5 py-0.5 whitespace-nowrap"
              >SMART SHOPPING</a-tag
            >
          </div>
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden lg:block flex-1 overflow-hidden">
          <a-menu
            v-model:selectedKeys="selectedKeys"
            mode="horizontal"
            class="header-menu"
            :style="{
              lineHeight: '63px',
              borderBottom: 'none',
              background: 'transparent',
            }"
            @click="handleMenuClick"
          >
            <a-menu-item
              key="home"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Trang chủ">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'home'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <HomeOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="route.name !== 'home' ? 'hover:scale-110' : ''"
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              v-if="checkinGiftEnabled"
              key="qua-tang"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Quà tặng">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300 relative',
                    route.name === 'qua-tang'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <GiftOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="route.name !== 'qua-tang' ? 'hover:scale-110' : ''"
                  />
                  <span
                    v-if="showGiftRedDot"
                    class="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"
                  ></span>
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              key="hoan-tien"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Hoàn tiền">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'hoan-tien'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <DollarOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="
                      route.name !== 'hoan-tien'
                        ? 'text-[#ee4d2d] drop-shadow-[0_0_8px_rgba(238,77,45,0.4)] animate-shake-gentle hover:scale-110'
                        : ''
                    "
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              key="don-hang"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Đơn hàng">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'don-hang'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <ShoppingCartOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="route.name !== 'don-hang' ? 'hover:scale-110' : ''"
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              key="tai-chinh"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Rút tiền">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'tai-chinh'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <BankOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="route.name !== 'tai-chinh' ? 'hover:scale-110' : ''"
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              key="gioi-thieu"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip
                placement="bottom"
                color="black"
                title="Giới thiệu nhận thưởng"
              >
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'gioi-thieu'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <ShareAltOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="
                      route.name !== 'gioi-thieu' ? 'hover:scale-110' : ''
                    "
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              key="huong-dan"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Hướng dẫn">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'huong-dan'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <BookOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="route.name !== 'huong-dan' ? 'hover:scale-110' : ''"
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
            <a-menu-item
              key="ho-tro"
              style="padding: 0 12px; display: flex; align-items: center"
            >
              <a-tooltip placement="bottom" color="black" title="Hỗ trợ">
                <div
                  :class="[
                    'flex items-center justify-center w-11 h-11 rounded-full transition-all duration-300',
                    route.name === 'ho-tro'
                      ? 'bg-orange-100 text-[#ee4d2d] dark:bg-orange-950/50'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800',
                  ]"
                >
                  <QuestionCircleOutlined
                    class="text-[20px] transition-transform duration-300"
                    :class="route.name !== 'ho-tro' ? 'hover:scale-110' : ''"
                  />
                </div>
              </a-tooltip>
            </a-menu-item>
          </a-menu>
        </div>

        <!-- Right Side: User Dropdown & Mobile Menu Toggle -->
        <div class="flex items-center gap-3">
          <!-- Rank Badge (Hidden on mobile) -->
          <a-tag
            v-if="user"
            :color="rankColor"
            class="hidden md:inline-flex items-center font-bold px-2 py-1 rounded-full border-0 shadow-sm"
            style="margin-right: 0"
          >
            <template #icon>
              <img
                :src="rankInfo.image"
                class="w-3.5 h-3.5 mr-1 inline-block"
              />
            </template>
            {{ rankInfo.name }}
          </a-tag>

          <!-- User Dropdown -->
          <a-dropdown :trigger="['click']" placement="bottomRight" v-if="user">
            <div
              class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-full transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
            >
              <span
                class="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:block pl-2"
                >{{ userName }}</span
              >
              <a-avatar
                :src="userAvatar"
                :size="32"
                class="bg-indigo-500 font-bold uppercase"
                >{{ firstLetter }}</a-avatar
              >
            </div>
            <template #overlay>
              <a-menu
                class="w-56 mt-2 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 p-1"
              >
                <div
                  class="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1"
                >
                  <div
                    class="font-bold text-slate-800 dark:text-slate-100 text-sm truncate"
                  >
                    {{ userName }}
                  </div>
                  <div class="text-[11px] text-slate-500 truncate">
                    {{ userEmail }}
                  </div>
                </div>

                <a-menu-divider />

                <a-menu-item
                  key="ho-so"
                  @click="router.push({ name: 'ho-so' })"
                >
                  <template #icon><UserOutlined /></template>
                  Hồ sơ cá nhân
                </a-menu-item>
                <a-menu-item
                  key="gioi-thieu"
                  @click="router.push({ name: 'gioi-thieu' })"
                >
                  <template #icon><ShareAltOutlined /></template>
                  Mời bạn nhận thưởng
                </a-menu-item>
                <a-menu-item
                  key="tai-chinh"
                  @click="router.push({ name: 'tai-chinh' })"
                >
                  <template #icon><BankOutlined /></template>
                  Rút tiền
                </a-menu-item>

                <a-menu-divider />
                <a-menu-item key="logout" danger @click="handleLogout">
                  <template #icon><LogoutOutlined /></template>
                  Đăng xuất
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <!-- Login Button -->
          <a-button
            v-else
            type="primary"
            @click="router.push({ name: 'login' })"
            class="font-bold shadow-sm rounded-lg"
            size="middle"
          >
            Đăng nhập
          </a-button>
        </div>
      </div>
    </a-layout-header>

    <!-- Mobile Bottom Navigation (5-Item Layout with Center FAB) -->
    <div
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 z-40 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]"
    >
      <div class="flex items-center justify-around h-[60px] px-1 relative">
        <!-- Nút 1: Trang Chủ -->
        <div
          @click="router.push({ name: 'home' })"
          class="flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors"
          :class="
            route.name === 'home'
              ? 'text-[#ee4d2d]'
              : 'text-slate-400 dark:text-slate-500'
          "
        >
          <HomeOutlined
            class="text-[20px]"
            :class="route.name === 'home' ? 'scale-110 font-bold' : ''"
          />
          <span class="text-[9.5px] font-extrabold mt-1">Trang chủ</span>
        </div>

        <!-- Nút 2: Quà Tặng hoặc Ví -->
        <div
          @click="router.push({ name: checkinGiftEnabled ? 'qua-tang' : 'tai-chinh' })"
          class="flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors relative"
          :class="
            route.name === (checkinGiftEnabled ? 'qua-tang' : 'tai-chinh')
              ? 'text-[#ee4d2d]'
              : 'text-slate-400 dark:text-slate-500'
          "
        >
          <div class="relative">
            <GiftOutlined
              v-if="checkinGiftEnabled"
              class="text-[20px]"
              :class="route.name === 'qua-tang' ? 'scale-110 font-bold' : ''"
            />
            <WalletOutlined
              v-else
              class="text-[20px]"
              :class="route.name === 'tai-chinh' ? 'scale-110 font-bold' : ''"
            />
            <span
              v-if="checkinGiftEnabled && showGiftRedDot"
              class="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"
            ></span>
          </div>
          <span class="text-[9.5px] font-extrabold mt-1">
            {{ checkinGiftEnabled ? "Quà tặng" : "Ví" }}
          </span>
        </div>

        <!-- Nút 3: Hoàn tiền (Center Floating FAB Button) -->
        <div
          @click="router.push({ name: 'hoan-tien' })"
          class="flex-1 flex flex-col items-center justify-center h-full cursor-pointer relative"
        >
          <div
            class="absolute -top-3 w-12 h-12 rounded-full bg-gradient-to-tr from-[#ee4d2d] via-orange-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/35 border-2 border-white dark:border-slate-900 active:scale-95 transition-transform"
          >
            <DollarOutlined class="text-xl font-black drop-shadow-sm" />
          </div>
          <span
            class="text-[9.5px] font-extrabold mt-6 transition-colors"
            :class="
              route.name === 'hoan-tien'
                ? 'text-[#ee4d2d]'
                : 'text-slate-400 dark:text-slate-500'
            "
          >
            Hoàn tiền
          </span>
        </div>

        <!-- Nút 4: Đơn Hàng -->
        <div
          @click="router.push({ name: 'don-hang' })"
          class="flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors"
          :class="
            route.name === 'don-hang'
              ? 'text-[#ee4d2d]'
              : 'text-slate-400 dark:text-slate-500'
          "
        >
          <ShoppingCartOutlined
            class="text-[20px]"
            :class="route.name === 'don-hang' ? 'scale-110 font-bold' : ''"
          />
          <span class="text-[9.5px] font-extrabold mt-1">Đơn hàng</span>
        </div>

        <!-- Nút 5: Thêm (Mở Drawer) -->
        <div
          @click="moreDrawerOpen = true"
          class="flex flex-col items-center justify-center flex-1 h-full cursor-pointer transition-colors relative"
          :class="
            isMoreActive
              ? 'text-[#ee4d2d]'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
          "
        >
          <div class="relative">
            <AppstoreOutlined
              class="text-[20px]"
              :class="isMoreActive ? 'scale-110 font-bold' : ''"
            />
            <span
              v-if="isMoreActive"
              class="absolute -top-0.5 -right-1 w-2 h-2 bg-[#ee4d2d] rounded-full"
            ></span>
          </div>
          <span class="text-[9.5px] font-extrabold mt-1">Thêm</span>
        </div>
      </div>
    </div>

    <!-- Mobile "Thêm" Bottom Drawer -->
    <a-drawer
      v-model:open="moreDrawerOpen"
      placement="bottom"
      :closable="false"
      height="auto"
      root-class-name="mobile-more-drawer"
    >
      <div
        class="p-4 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800"
      >
        <!-- Drawer Header with Title & Smooth Close Button -->
        <div
          class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5"
        >
          <div class="flex items-center gap-2">
            <AppstoreOutlined class="text-[#ee4d2d] text-lg" />
            <h3
              class="text-base font-black text-slate-800 dark:text-slate-100 m-0"
            >
              Danh Mục Mở Rộng
            </h3>
          </div>
          <button
            type="button"
            @click="moreDrawerOpen = false"
            class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <CloseOutlined class="text-sm font-bold" />
          </button>
        </div>

        <!-- Grid Menu Items -->
        <div class="grid grid-cols-4 gap-4 py-2">
          <!-- Giới thiệu nhận thưởng -->
          <div
            @click="navigateToMore('gioi-thieu')"
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer group text-center border"
            :class="
              route.name === 'gioi-thieu'
                ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/40'
                : 'border-transparent bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            "
          >
            <div
              class="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
            >
              <ShareAltOutlined />
            </div>
            <span
              class="text-xs font-bold"
              :class="
                route.name === 'gioi-thieu'
                  ? 'text-[#ee4d2d]'
                  : 'text-slate-700 dark:text-slate-200'
              "
              >Giới thiệu</span
            >
          </div>

          <!-- Ví & Rút tiền -->
          <div
            v-if="checkinGiftEnabled"
            @click="navigateToMore('tai-chinh')"
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer group text-center border"
            :class="
              route.name === 'tai-chinh'
                ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/40'
                : 'border-transparent bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            "
          >
            <div
              class="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
            >
              <BankOutlined />
            </div>
            <span
              class="text-xs font-bold"
              :class="
                route.name === 'tai-chinh'
                  ? 'text-[#ee4d2d]'
                  : 'text-slate-700 dark:text-slate-200'
              "
              >Ví & Rút tiền</span
            >
          </div>

          <!-- Hồ sơ cá nhân -->
          <div
            @click="navigateToMore('ho-so')"
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer group text-center border"
            :class="
              route.name === 'ho-so'
                ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/40'
                : 'border-transparent bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            "
          >
            <div
              class="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-indigo-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
            >
              <UserOutlined />
            </div>
            <span
              class="text-xs font-bold"
              :class="
                route.name === 'ho-so'
                  ? 'text-[#ee4d2d]'
                  : 'text-slate-700 dark:text-slate-200'
              "
              >Hồ sơ</span
            >
          </div>

          <!-- Hướng dẫn -->
          <div
            @click="navigateToMore('huong-dan')"
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer group text-center border"
            :class="
              route.name === 'huong-dan'
                ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/40'
                : 'border-transparent bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            "
          >
            <div
              class="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
            >
              <BookOutlined />
            </div>
            <span
              class="text-xs font-bold"
              :class="
                route.name === 'huong-dan'
                  ? 'text-[#ee4d2d]'
                  : 'text-slate-700 dark:text-slate-200'
              "
              >Hướng dẫn</span
            >
          </div>

          <!-- Hỗ trợ -->
          <div
            @click="navigateToMore('ho-tro')"
            class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer group text-center border"
            :class="
              route.name === 'ho-tro'
                ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/40'
                : 'border-transparent bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50 dark:hover:bg-orange-950/30'
            "
          >
            <div
              class="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"
            >
              <QuestionCircleOutlined />
            </div>
            <span
              class="text-xs font-bold"
              :class="
                route.name === 'ho-tro'
                  ? 'text-[#ee4d2d]'
                  : 'text-slate-700 dark:text-slate-200'
              "
              >Hỗ trợ</span
            >
          </div>
        </div>
      </div>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";
import axios from "@/api/axios";
import { useSiteSettings } from "@/composables/useSiteSettings";
import {
  HomeOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
  BankOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  GiftOutlined,
  DollarOutlined,
  AppstoreOutlined,
  CloseOutlined,
  ShareAltOutlined,
} from "@ant-design/icons-vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { siteSettings } = useSiteSettings();

const selectedKeys = ref([route.name as string]);
const moreDrawerOpen = ref(false);

const checkedInToday = ref(true);
const checkinGiftEnabled = computed(
  () => user.value?.checkin_gift?.enabled !== false
);

const fetchCheckinStatus = async () => {
  if (!user.value || !checkinGiftEnabled.value) return;
  try {
    const res = await axios.get("/spoint/status");
    if (res.data?.data) {
      checkedInToday.value = !!res.data.data.checked_in_today;
    }
  } catch (err) {
    // Ignore error
  }
};

const showGiftRedDot = computed(() => {
  if (!user.value || !checkinGiftEnabled.value) return false;
  if (route.name === "qua-tang") return false;
  return !checkedInToday.value;
});

onMounted(() => {
  fetchCheckinStatus();
});

const moreRoutes = computed(() => [
  ...(checkinGiftEnabled.value ? ["tai-chinh"] : []),
  "ho-so",
  "gioi-thieu",
  "huong-dan",
  "ho-tro",
]);
const isMoreActive = computed(() => {
  return typeof route.name === "string" && moreRoutes.value.includes(route.name);
});

const navigateToMore = (nameRoute: string) => {
  moreDrawerOpen.value = false;
  router.push({ name: nameRoute });
};

watch(
  () => route.name,
  (newRouteName) => {
    if (newRouteName) selectedKeys.value = [newRouteName as string];
    if (user.value) {
      fetchCheckinStatus();
    }
  }
);

watch(
  () => user.value,
  (newUser) => {
    if (newUser) {
      fetchCheckinStatus();
    }
  }
);

const handleMenuClick = ({ key }: { key: string }) => {
  router.push({ name: key });
};

const handleMobileMenuClick = ({ key }: { key: string }) => {
  mobileMenuOpen.value = false;
  router.push({ name: key });
};

const userName = computed(() => user.value?.name || "User");
const userAvatar = computed(
  () => user.value?.image || user.value?.avatar || ""
);
const firstLetter = computed(
  () => userName.value?.charAt(0).toUpperCase() || "U"
);
const userEmail = computed(() => user.value?.email || "");

const rankInfo = computed(() => {
  const rank = user.value?.rank || "silver";
  if (rank === "obsidian")
    return { name: "Tinh Hoa", image: "/saffi_obsidian.webp" };
  if (rank === "gold") return { name: "Vàng", image: "/saffi_gold.webp" };
  return { name: "Bạc", image: "/saffi_silver.webp" };
});

const rankColor = computed(() => {
  const rank = user.value?.rank || "silver";
  if (rank === "obsidian") return "purple";
  if (rank === "gold") return "gold";
  return "default";
});

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push({ name: "login" });
  } catch (error) {
    console.error("Logout failed:", error);
  }
};
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  height: 64px;
  line-height: 64px;
  padding: 0;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

html.dark .app-header {
  background: rgba(15, 23, 42, 0.85);
  border-bottom-color: rgba(30, 41, 59, 0.6);
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.header-menu) {
  font-weight: 600;
  color: #64748b;
}

html.dark :deep(.header-menu) {
  color: #94a3b8;
}

:deep(.ant-menu-horizontal > .ant-menu-item-selected) {
  color: #ee4d2d !important;
  background-color: transparent !important;
}

:deep(.ant-menu-horizontal > .ant-menu-item-selected::after) {
  display: none !important;
}

:deep(.ant-menu-horizontal > .ant-menu-item:hover) {
  color: #ee4d2d !important;
  background-color: transparent !important;
}

:deep(.ant-menu-horizontal > .ant-menu-item:hover::after) {
  display: none !important;
}

@keyframes shake-gentle {
  0%,
  10% {
    transform: rotate(0deg);
  }
  15% {
    transform: rotate(-10deg) scale(1.05);
  }
  20% {
    transform: rotate(10deg) scale(1.05);
  }
  25% {
    transform: rotate(-10deg) scale(1.05);
  }
  30% {
    transform: rotate(0deg) scale(1);
  }
  100% {
    transform: rotate(0deg);
  }
}

.animate-shake-gentle {
  animation: shake-gentle 2.5s ease-in-out infinite;
  display: inline-block;
  transform-origin: center center;
}

.mobile-bottom-nav {
  position: fixed;
  bottom: -1px;
  left: 0;
  right: 0;
  background-color: #ffffff !important;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

html.dark .mobile-bottom-nav {
  background-color: #0f172a !important;
}

.mobile-bottom-nav::after {
  content: "";
  position: absolute;
  top: 30%;
  left: -20px;
  right: -20px;
  bottom: -200px;
  background-color: #ffffff !important;
  z-index: -1;
  pointer-events: none;
}

html.dark .mobile-bottom-nav::after {
  background-color: #0f172a !important;
}
</style>
