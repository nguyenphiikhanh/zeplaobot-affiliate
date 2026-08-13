<script setup lang="ts">
import { QrcodeOutlined } from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";

const { showQrModal, botStatus, startQrLogin } = useZaloConfig();
</script>

<template>
  <a-modal
    v-model:open="showQrModal"
    title="Đăng nhập Bot Zalo"
    :footer="null"
    :mask-closable="false"
    width="420px"
  >
    <div class="py-3 flex flex-col items-center text-center">
      <template v-if="botStatus.qrImage">
        <div
          class="p-3 bg-white border border-slate-200 rounded-2xl shadow-sm"
        >
          <img
            :src="botStatus.qrImage"
            alt="QR đăng nhập Zalo"
            class="w-64 h-64 object-contain"
          />
        </div>
        <h4 class="mt-4 mb-1 text-sm font-black text-slate-900">
          {{
            botStatus.qrState === "scanned"
              ? "Đã quét mã QR"
              : "Quét mã bằng ứng dụng Zalo"
          }}
        </h4>
        <p class="m-0 text-xs text-slate-500 leading-5">
          {{
            botStatus.qrState === "scanned"
              ? "Vui lòng xác nhận đăng nhập trên điện thoại."
              : "Mở Zalo → biểu tượng QR → quét mã và xác nhận đăng nhập."
          }}
        </p>
        <div
          v-if="botStatus.scannedAccount"
          class="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2"
        >
          <img
            v-if="botStatus.scannedAccount.avatar"
            :src="botStatus.scannedAccount.avatar"
            class="w-7 h-7 rounded-full object-cover"
            alt="Zalo avatar"
          />
          <span class="text-xs font-bold text-emerald-700">{{
            botStatus.scannedAccount.displayName
          }}</span>
        </div>
      </template>
      <template
        v-else-if="
          botStatus.qrState === 'expired' ||
          botStatus.qrState === 'declined' ||
          botStatus.qrState === 'error'
        "
      >
        <QrcodeOutlined class="text-5xl text-slate-300" />
        <h4 class="mt-4 mb-1 text-sm font-black text-slate-900">
          Mã QR không còn hiệu lực
        </h4>
        <p class="m-0 text-xs text-slate-500">
          {{ botStatus.error || "Vui lòng tạo mã QR mới để tiếp tục." }}
        </p>
        <button
          type="button"
          class="mt-4 h-9 px-4 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white text-xs font-bold cursor-pointer"
          @click="startQrLogin"
        >
          Tạo mã QR mới
        </button>
      </template>
      <template v-else>
        <a-spin size="large" />
        <p class="mt-4 mb-0 text-xs font-semibold text-slate-500">
          Đang tạo mã QR đăng nhập...
        </p>
      </template>
    </div>
  </a-modal>
</template>
