<script setup lang="ts">
import LinkConverterCard from '../components/LinkConverterCard.vue'
import { LinkOutlined, QuestionCircleOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from '@ant-design/icons-vue'
</script>

<template>
  <div class="space-y-4">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-left space-y-1">
      <div class="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg">
          <div class="w-8 h-8 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
            <LinkOutlined class="text-base" />
          </div>
          <h2 class="text-lg font-black text-slate-900 leading-none m-0">Tạo Link Hoàn Tiền</h2>
        </div>
        <h2>Tạo Link Hoàn Tiền</h2>
      </div>
      <p class="text-xs text-slate-500 leading-relaxed">
        Dán link sản phẩm Shopee bất kỳ để tạo link hoàn tiền tự động có gắn mã tracking của bạn.
      </p>
    </div>

    <!-- Main Converter Component -->
    <LinkConverterCard />

    <!-- Tips Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs text-left space-y-3">
      <div class="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
        <QuestionCircleOutlined class="text-orange-500" />
        <span>Hướng dẫn nhận hoàn tiền</span>
      </div>

      <div class="space-y-2.5 text-xs text-slate-600">
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-black flex items-center justify-center shrink-0 text-[11px]">1</span>
          <p>Copy link sản phẩm Shopee bạn muốn mua.</p>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-black flex items-center justify-center shrink-0 text-[11px]">2</span>
          <p>Dán vào ô trên và bấm <strong>"Chuyển đổi Link"</strong>.</p>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-black flex items-center justify-center shrink-0 text-[11px]">3</span>
          <p>Mở link rút gọn đã tạo, thêm vào giỏ hàng và đặt hàng trên Shopee.</p>
        </div>
        <div class="flex items-start gap-2.5">
          <span class="w-5 h-5 rounded-full bg-orange-100 text-[#ee4d2d] font-black flex items-center justify-center shrink-0 text-[11px]">4</span>
          <p>Sau khi đơn hàng giao thành công, hoa hồng sẽ tự động cộng vào Ví tiền của bạn.</p>
        </div>
      </div>
    </div>
  </div>
</template>
