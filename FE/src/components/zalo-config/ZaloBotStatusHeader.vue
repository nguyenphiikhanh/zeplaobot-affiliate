<script setup lang="ts">
import {
  CheckCircleOutlined,
  QrcodeOutlined,
  ReloadOutlined,
} from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";
import ZaloQrModal from "./ZaloQrModal.vue";

const {
  botStatus,
  checkingBotStatus,
  startingQrLogin,
  startQrLogin,
  checkBotStatus,
} = useZaloConfig();
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs"
  >
    <div
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border',
            botStatus.connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-orange-50 border-orange-200 text-[#ee4d2d]',
          ]"
        >
          <CheckCircleOutlined v-if="botStatus.connected" class="text-xl" />
          <QrcodeOutlined v-else class="text-xl" />
        </div>
        <div>
          <h4 class="m-0 text-sm font-black text-slate-900 dark:text-white">
            Trạng thái Bot
          </h4>
          <div
            v-if="botStatus.connected"
            class="mt-1 flex items-center gap-2"
          >
            <span class="relative flex h-2.5 w-2.5">
              <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"
              ></span>
              <span
                class="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"
              ></span>
            </span>
            <span class="text-xs font-bold text-emerald-600"
              >Bot đang hoạt động</span
            >
            <span
              v-if="botStatus.botId"
              class="text-[11px] text-slate-400 font-mono"
              >ID: {{ botStatus.botId }}</span
            >
          </div>
          <p v-else class="mt-1 mb-0 text-xs font-semibold text-slate-500">
            Bạn chưa đăng nhập bot
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <button
          v-if="!botStatus.connected"
          type="button"
          :disabled="startingQrLogin"
          class="h-9 px-4 rounded-xl bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white text-xs font-bold inline-flex items-center justify-center gap-2 shadow-sm shadow-orange-500/20 cursor-pointer disabled:opacity-60"
          @click="startQrLogin"
        >
          <ReloadOutlined v-if="startingQrLogin" spin class="!text-white" />
          <QrcodeOutlined v-else class="!text-white" />
          <span class="!text-white">Đăng nhập ngay</span>
        </button>
        <button
          type="button"
          :disabled="checkingBotStatus"
          class="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:text-[#ee4d2d] hover:border-orange-200 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
          @click="checkBotStatus()"
        >
          <ReloadOutlined :spin="checkingBotStatus" />
          <span>Kiểm tra</span>
        </button>
      </div>
    </div>

    <!-- QR Modal -->
    <ZaloQrModal />
  </div>
</template>
