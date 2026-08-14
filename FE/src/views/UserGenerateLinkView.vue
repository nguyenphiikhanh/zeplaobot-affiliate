<script setup lang="ts">
import {
  LinkOutlined,
  WarningOutlined,
  DeleteOutlined,
  DisconnectOutlined,
  DesktopOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  SwapOutlined,
  ShoppingOutlined,
} from '@ant-design/icons-vue'
import LinkConverterCard from '../components/LinkConverterCard.vue'
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4 text-left">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-1">
      <div class="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg sm:text-xl">
        <div class="w-8.5 h-8.5 rounded-xl bg-orange-50 text-[#ee4d2d] flex items-center justify-center shrink-0">
          <LinkOutlined class="text-lg" />
        </div>
        <h2
          class="text-lg sm:text-xl font-black text-slate-950 leading-none m-0 tracking-tight translate-y-[1.5px]"
          style="-webkit-text-stroke: 0.2px currentColor; font-weight: 900;"
        >
          Tạo Link Hoàn Tiền
        </h2>
      </div>
      <p class="text-sm sm:text-base text-slate-600 font-bold leading-relaxed pt-0.5">
        Dán link sản phẩm Shopee bất kỳ để tạo link hoàn tiền tự động có gắn mã tracking của bạn.
      </p>
    </div>

    <!-- Main Converter Component -->
    <LinkConverterCard />

    <!-- Important Notes Card (Lưu ý quan trọng) -->
    <div class="bg-[#fef8e7] border border-[#f7e5b3] rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div class="flex items-center gap-2.5 text-[#cb7e19] font-black text-base sm:text-lg">
        <WarningOutlined class="text-xl shrink-0" />
        <h3 class="text-base sm:text-lg font-black text-[#cb7e19] leading-none m-0">Lưu ý quan trọng</h3>
      </div>

      <div class="space-y-4 text-xs sm:text-sm text-[#735328] font-medium leading-relaxed">
        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#f9ecbe] text-[#cb7e19] flex items-center justify-center shrink-0 mt-0.5">
            <DeleteOutlined class="text-sm" />
          </div>
          <span class="pt-0.5">
            Hãy xóa các sản phẩm cùng loại đã có sẵn trong giỏ hàng trước khi đặt mua qua link hoàn tiền.
          </span>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#f9ecbe] text-[#cb7e19] flex items-center justify-center shrink-0 mt-0.5">
            <DisconnectOutlined class="text-sm" />
          </div>
          <span class="pt-0.5">
            Trong lúc mua hàng, tránh nhảy sang các link khác như live, video hoặc quảng cáo để không bị mất ghi nhận.
          </span>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#f9ecbe] text-[#cb7e19] flex items-center justify-center shrink-0 mt-0.5">
            <DesktopOutlined class="text-sm" />
          </div>
          <span class="pt-0.5">
            Nên hoàn tất quá trình đặt hàng trong cùng một phiên trình duyệt và hạn chế đóng tab giữa chừng.
          </span>
        </div>

        <div class="flex items-start gap-3">
          <div class="w-6 h-6 rounded-lg bg-[#f9ecbe] text-[#cb7e19] flex items-center justify-center shrink-0 mt-0.5">
            <InfoCircleOutlined class="text-sm" />
          </div>
          <span class="pt-0.5">
            Đơn hàng có được ghi nhận hợp lệ hay không là do sàn TMĐT quyết định. Chúng tôi không thể can thiệp.
          </span>
        </div>
      </div>
    </div>

    <!-- Execution Steps Card (Cách thực hiện) -->
    <div class="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
      <h3 class="text-base sm:text-lg font-black text-slate-900 leading-none m-0">
        Cách thực hiện
      </h3>

      <div class="relative space-y-6 pl-1">
        <!-- Connecting Vertical Line -->
        <div class="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200/70 z-0"></div>

        <!-- Step 1 -->
        <div class="relative z-10 flex items-start gap-4">
          <div class="w-8 h-8 rounded-full bg-[#ee4d2d] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
            1
          </div>
          <div class="space-y-1 pt-0.5">
            <div class="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <CopyOutlined class="text-base text-slate-700" />
              <span>Sao chép link sản phẩm</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed m-0">
              Mở Shopee, tìm sản phẩm bạn muốn mua. Nhấn nút chia sẻ hoặc sao chép đường dẫn của sản phẩm đó.
            </p>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="relative z-10 flex items-start gap-4">
          <div class="w-8 h-8 rounded-full bg-[#ee4d2d] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
            2
          </div>
          <div class="space-y-1 pt-0.5">
            <div class="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <SwapOutlined class="text-base text-slate-700" />
              <span>Chuyển đổi link</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed m-0">
              Dán link sản phẩm vào ô trên và nhấn tạo link. Hệ thống sẽ tạo link hoàn tiền chỉ trong vài giây.
            </p>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="relative z-10 flex items-start gap-4">
          <div class="w-8 h-8 rounded-full bg-[#ee4d2d] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
            3
          </div>
          <div class="space-y-1 pt-0.5">
            <div class="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
              <ShoppingOutlined class="text-base text-slate-700" />
              <span>Mua hàng qua link hoàn tiền</span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed m-0">
              Bấm vào link đã chuyển đổi để mở sản phẩm.
              <span class="text-[#ee4d2d] font-bold">Đơn hàng sẽ được ghi nhận trong vòng 24h!</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
