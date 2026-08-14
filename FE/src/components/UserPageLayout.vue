<script setup lang="ts">
import { useSlots } from 'vue'
import Navbar from './Navbar.vue'

const slots = useSlots()
</script>

<template>
  <main v-if="slots.default" class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
    <slot />
  </main>
  <div v-else class="flex min-h-screen flex-col bg-[#fafafd] selection:bg-orange-100 selection:text-orange-600">
    <Navbar />
    <div class="flex flex-1 flex-col"><RouterView /></div>
  </div>
</template>
