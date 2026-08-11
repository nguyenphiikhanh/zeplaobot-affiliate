<template>
  <a-config-provider :theme="computedTheme">
    <div
      v-if="!isMounted"
      style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: #f8fafc;
      "
    >
      <img class="saffi-bounce" :src="siteSettings.loading_image" :alt="siteSettings.site_name" style="width: 56px; height: 56px; object-fit: contain; margin-bottom: 16px; z-index: 20;" />
      <div style="position: relative; width: 84px; height: 84px; display: flex; align-items: center; justify-content: center;">
        <div
          class="saffi-spinner"
          style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 4px solid #e2e8f0;
            border-top-color: #ee4d2d;
          "
        ></div>
        <img class="saffi-pulse" :src="siteSettings.favicon" alt="Loading" style="width: 64px; height: 64px; object-fit: cover; border-radius: 50%; z-index: 10;" />
      </div>
      <p
        style="
          margin-top: 24px;
          font-size: 15px;
          font-weight: 700;
          color: #64748b;
          font-family: sans-serif;
        "
      >
        Đang tải...
      </p>
    </div>

    <div
      :style="{
        opacity: isMounted ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }"
    >
      <component :is="layout">
        <router-view v-slot="{ Component, route }">
          <keep-alive>
            <component :is="Component" v-if="route.meta.keepAlive" :key="route.path" />
          </keep-alive>
          <component :is="Component" v-if="!route.meta.keepAlive" :key="route.path" />
        </router-view>
      </component>
    </div>
  </a-config-provider>
</template>

<script setup>
import { computed, ref, onMounted, defineAsyncComponent } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { theme } from 'ant-design-vue';
import { useSiteSettings } from '@/composables/useSiteSettings';

const PublicLayout = defineAsyncComponent(() => import('@/layouts/PublicLayout.vue'));
const AuthLayout = defineAsyncComponent(() => import('@/layouts/AuthLayout.vue'));
const AppLayout = defineAsyncComponent(() => import('@/layouts/AppLayout.vue'));
const AdminLayout = defineAsyncComponent(() => import('@/layouts/AdminLayout.vue'));
const EmptyLayout = defineAsyncComponent(() => import('@/layouts/EmptyLayout.vue'));

const route = useRoute();
const router = useRouter();
const isMounted = ref(false);
const { siteSettings } = useSiteSettings();

onMounted(async () => {
  // Đợi router hoàn tất điều hướng ban đầu (bao gồm tự động fetch user profile & redirect Admin)
  await router.isReady();
  setTimeout(() => {
    isMounted.value = true;
  }, 50);
});

const computedTheme = computed(() => {
  return {
    algorithm: theme.defaultAlgorithm, // You can add dark mode detection later if needed
    token: {
      colorPrimary: "#EE4D2D",
      colorPrimaryHover: "#F05D40",
      colorPrimaryActive: "#D94429",
      fontFamily: "'Roboto', system-ui, -apple-system, sans-serif",
      borderRadius: 8,
      borderRadiusLG: 12,
      borderRadiusSM: 6,
    },
    components: {
      Button: {
        primaryShadow: "0 4px 20px rgba(238, 77, 45, 0.25)",
      },
      Input: {
        activeBorderColor: "#EE4D2D",
        hoverBorderColor: "#F05D40",
      },
    },
  };
});

const layout = computed(() => {
  // Lấy layout từ matched route gần nhất có định nghĩa layout meta
  const matchedLayout = route.matched.slice().reverse().find(r => r.meta?.layout)?.meta?.layout;
  const currentLayout = matchedLayout || route.meta.layout;

  if (currentLayout === 'AuthLayout') return AuthLayout;
  if (currentLayout === 'AdminLayout') return AdminLayout;
  if (currentLayout === 'AppLayout') return AppLayout;
  if (currentLayout === 'EmptyLayout') return EmptyLayout;
  return PublicLayout; // Default layout
});
</script>

<style>
.saffi-spinner {
  animation: saffi-spin 1s linear infinite;
}
@keyframes saffi-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.saffi-pulse {
  animation: saffi-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes saffi-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.saffi-bounce {
  animation: saffi-bounce 0.5s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
}
@keyframes saffi-bounce {
  0% { transform: translateY(0) scale(0.95); }
  100% { transform: translateY(-20px) scale(1.05); }
}
</style>
