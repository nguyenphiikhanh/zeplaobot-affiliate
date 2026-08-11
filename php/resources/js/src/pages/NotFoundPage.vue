<template>
  <div
    class="min-h-[80vh] w-full flex items-center justify-center p-6 relative overflow-hidden"
  >
    <!-- Background Decor -->
    <div
      class="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none -z-10"
    ></div>
    <div
      class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none -z-10"
    ></div>

    <div class="max-w-md w-full text-center flex flex-col items-center">
      <!-- Error Number -->
      <div class="relative">
        <h1
          class="text-[120px] sm:text-[150px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-400 dark:from-slate-100 dark:to-slate-600 leading-none select-none drop-shadow-sm"
        >
          404
        </h1>

        <!-- Saffi Mascot bouncing on the text -->
        <div
          class="absolute -top-4 -right-8 animate-bounce z-10 hidden sm:block"
          style="animation-duration: 3s"
        >
          <img
            :src="'/saffi_gold.webp'"
            alt="Saffi Mascot"
            class="w-24 h-24 object-contain drop-shadow-xl"
          />
        </div>
      </div>

      <!-- Content -->
      <div class="mt-4 mb-10 z-10 relative">
        <h2
          class="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mb-3 tracking-tight"
        >
          Ôi không! Lạc đường rồi 🍯
        </h2>
        <p
          class="text-sm sm:text-base font-medium text-slate-500 dark:text-slate-400 leading-relaxed px-4"
        >
          Trang bạn đang cố gắng truy cập không tồn tại.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
        <router-link :to="{ name: 'home' }">
          <a-button
            type="primary"
            size="large"
            class="h-12 px-8 rounded-xl font-bold tracking-wide shadow-lg shadow-orange-500/20 w-full sm:w-auto"
          >
            VỀ TRANG CHỦ
          </a-button>
        </router-link>
      </div>
    </div>
  </div>
</template>
