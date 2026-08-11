<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
</script>

<template>
  <div
    class="relative pt-12 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto"
  >
    <!-- Background Soft Ambient Glow Blobs -->
    <div
      class="absolute -top-12 -left-20 w-80 h-80 rounded-full bg-[#fce8e6] opacity-70 blur-3xl pointer-events-none animate-float"
    ></div>
    <div
      class="absolute top-4 -right-20 w-80 h-80 rounded-full bg-[#e3f6f3] opacity-70 blur-3xl pointer-events-none animate-float-delayed"
    ></div>

    <!-- Badge Pill -->
    <div
      class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff2ee] border border-orange-200/60 shadow-2xs mb-6 transform hover:scale-105 transition-transform duration-200 cursor-pointer"
    >
      <Sparkles class="w-3.5 h-3.5 text-[#ff5733]" />
      <span class="text-xs sm:text-sm font-semibold text-[#ff5733]"
        >Nền tảng hoàn tiền mua sắm hàng đầu Việt Nam</span
      >
    </div>

    <!-- Main Headline -->
    <h1
      class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#1c2434] leading-tight mb-2"
    >
      Mua sắm mỗi ngày
    </h1>
    <h2
      class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#ff5733] leading-tight mb-6"
    >
      Hoàn tiền liền tay
    </h2>

    <!-- Subtitle -->
    <p
      class="text-gray-500 text-base sm:text-lg md:text-xl italic font-normal max-w-2xl mx-auto leading-relaxed"
    >
      Tự động nhận hoàn tiền khi mua trên Shopee — nhanh chóng, minh bạch
    </p>
  </div>
</template>
