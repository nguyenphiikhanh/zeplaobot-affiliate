<script setup lang="ts">
import { Sparkles } from "lucide-vue-next";
</script>

<template>
  <div
    class="relative pt-10 sm:pt-14 pb-6 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto"
  >
    <!-- Moderate Ambient Glow Gradient -->
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl h-64 bg-gradient-to-r from-rose-100/60 via-orange-100/50 to-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10"
    ></div>

    <!-- Soft accent blobs -->
    <div
      class="absolute -top-6 -left-12 w-64 h-64 rounded-full bg-rose-200/50 blur-2xl pointer-events-none animate-float -z-10"
    ></div>
    <div
      class="absolute top-4 -right-12 w-64 h-64 rounded-full bg-orange-200/50 blur-2xl pointer-events-none animate-float-delayed -z-10"
    ></div>

    <!-- Content Container elevated above background -->
    <div class="relative z-10">
      <!-- Badge Pill -->
      <div
        class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/85 backdrop-blur-sm border border-orange-200/80 shadow-2xs mb-6 transform hover:scale-105 transition-all duration-200 cursor-pointer"
      >
        <Sparkles class="w-4 h-4 text-[#ff5733]" />
        <span class="text-xs sm:text-sm font-bold text-[#ff5733]"
          >Nền tảng hoàn tiền mua sắm hàng đầu Việt Nam</span
        >
      </div>

      <!-- Main Headline -->
      <h1
        class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-2"
      >
        Mua sắm mỗi ngày
      </h1>
      <h2
        class="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-[#ff5733] via-rose-500 to-[#ff3b14] bg-clip-text text-transparent leading-tight mb-5"
      >
        Hoàn tiền liền tay
      </h2>

      <!-- Subtitle -->
      <p
        class="text-slate-600 text-base sm:text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
      >
        Tự động nhận hoàn tiền khi mua trên Shopee — nhanh chóng, minh bạch
      </p>
    </div>
  </div>
</template>
