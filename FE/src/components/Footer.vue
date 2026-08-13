<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="w-full border-t border-gray-100/80 pt-6 pb-20 md:pb-6 text-center bg-white/50 backdrop-blur-xs">
    <p class="text-xs sm:text-sm text-gray-400 font-medium">
      © {{ year }}. Made & Support by
      <a
        href="https://www.facebook.com/nguyenphiikhanh"
        target="_blank"
        rel="noopener noreferrer"
        class="text-slate-600 hover:text-[#ee4d2d] font-semibold transition-colors"
      >KhanhNT</a>❤️
    </p>
  </footer>
</template>
