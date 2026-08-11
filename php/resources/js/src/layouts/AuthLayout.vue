<template>
  <a-layout class="min-h-screen font-sans bg-slate-50 dark:bg-slate-950">
    <a-layout-content class="w-full relative flex items-center justify-center min-h-screen overflow-hidden">
      <!-- Background Decoration -->
      <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none z-0"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none z-0"></div>
      
      <div class="relative z-10 w-full flex justify-center p-4">
        <router-view />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup lang="ts">
// If theme initialization is needed in the future, it can go here
</script>

<style scoped>
:deep(.ant-layout) {
  background: transparent !important;
}
</style>
