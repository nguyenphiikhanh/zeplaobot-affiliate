<template>
  <a-layout class="min-h-screen font-sans" style="background: var(--bg-color)">
    <!-- Header -->
    <AppHeader />

    <!-- Main Content Area -->
    <a-layout-content class="w-full max-w-[1280px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 pb-2 sm:pb-6 relative z-10 flex flex-col">
      <!-- Dynamic Breadcrumb Navigation -->
      <!-- <Breadcrumb class="mb-4" /> -->

      <!-- Inner page contents container -->
      <div class="flex-1 w-full flex flex-col">
        <router-view />
      </div>
    </a-layout-content>

    <!-- Footer -->
    <AppFooter />

    <!-- Global Referral Promotion Modal -->
    <ReferralPromoteModal />
  </a-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import AppHeader from "@/components/AppHeader.vue";
import AppFooter from "@/components/AppFooter.vue";
import ReferralPromoteModal from "@/components/referral/ReferralPromoteModal.vue";
// import Breadcrumb from "@/components/Breadcrumb.vue";

onMounted(() => {
});
</script>

<style scoped>
/* CSS Variables for Dark Mode */
html {
  --bg-color: #f8fafc; /* slate-50 */
}

html.dark {
  --bg-color: #020617; /* slate-950 */
}

:deep(.ant-layout) {
  background: transparent !important;
}
</style>
