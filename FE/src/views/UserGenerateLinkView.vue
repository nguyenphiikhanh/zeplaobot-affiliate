<script setup lang="ts">
import { LinkOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import LinkConverterCard from '../components/LinkConverterCard.vue'
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4 text-left">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-0.5">
      <div class="flex items-center gap-2.5 text-slate-900 font-extrabold text-base sm:text-lg">
        <div class="w-8 h-8 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
          <LinkOutlined class="text-base" />
        </div>
        <h2 class="text-base sm:text-lg font-black text-slate-900 leading-none m-0">Tạo Link Hoàn Tiền</h2>
      </div>
      <p class="text-xs text-slate-500 leading-relaxed">
        Dán link sản phẩm Shopee bất kỳ để tạo link hoàn tiền tự động có gắn mã tracking của bạn.
      </p>
    </div>

    <!-- Main Converter Component -->
    <LinkConverterCard />

    <!-- Tips Card -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
      <div class="flex items-center gap-2 text-slate-900 font-bold text-sm">
        <QuestionCircleOutlined class="text-base text-[#ee4d2d] shrink-0" />
        <span class="leading-normal">Hướng dẫn tạo link & nhận hoa hồng</span>
      </div>

      <div class="space-y-2 text-xs text-slate-600 leading-relaxed pl-1">
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
          <span>Sao chép link sản phẩm từ ứng dụng Shopee hoặc trang web shopee.vn.</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
          <span>Dán link vào ô phía trên và bấm <strong>"Chuyển đổi link"</strong>.</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
          <span>Bấm <strong>"Copy link"</strong> hoặc <strong>"Mua ngay"</strong> để mở Shopee và hoàn tất đặt hàng.</span>
        </div>
        <div class="flex items-start gap-2">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">4</span>
          <span>Hoa hồng sẽ tự động ghi nhận vào mục <strong>"Đơn hàng"</strong> sau khi đặt mua thành công.</span>
        </div>
      </div>
    </div>
  </div>
</template>
