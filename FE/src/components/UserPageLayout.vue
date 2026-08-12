<script setup lang="ts">import Navbar from './Navbar.vue';import Footer from './Footer.vue'</script>
<template><div class="min-h-screen bg-[#fafafd] flex flex-col"><Navbar/><main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8"><slot/></main><Footer/></div></template>
