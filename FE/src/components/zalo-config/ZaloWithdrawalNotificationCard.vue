<script setup lang="ts">
import {
  BellOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";
import VariableTag from "./VariableTag.vue";

const {
  withdrawalNotification,
  savingWithdrawalNotification,
  saveWithdrawalNotification,
} = useZaloConfig();
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <h4
          class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
        >
          <BellOutlined class="text-[#ee4d2d]" />
          <span>4. Thông báo thanh toán rút tiền</span>
        </h4>
        <p class="mt-1 mb-0 text-xs text-slate-500">
          Tự động gửi thông báo Zalo sau khi quản trị viên duyệt thanh toán.
        </p>
      </div>
      <a-switch
        v-model:checked="withdrawalNotification.enabled"
        :loading="savingWithdrawalNotification"
        @change="saveWithdrawalNotification"
      />
    </div>

    <div
      v-if="withdrawalNotification.enabled"
      class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4 text-left animate-fade-in"
    >
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Nơi nhận thông báo:
        </label>
        <a-radio-group v-model:value="withdrawalNotification.target">
          <a-radio value="private">Gửi riêng</a-radio>
          <a-radio value="group">Gửi vào nhóm</a-radio>
        </a-radio-group>
        <p
          v-if="withdrawalNotification.target === 'group'"
          class="m-0 text-[11px] leading-5 text-slate-500"
        >
          Thông báo được gửi tới các nhóm Zalo đã cấu hình và tag tên người nhận tiền.
        </p>
      </div>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Bấm để sao chép nhanh biến:
        </label>
        <div class="flex flex-wrap gap-1.5">
          <VariableTag name="{user_name}" />
          <VariableTag name="{amount}" />
        </div>
      </div>

      <textarea
        v-model="withdrawalNotification.template"
        rows="4"
        placeholder="Nhập nội dung thông báo thanh toán..."
        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
      ></textarea>

      <div class="pt-2">
        <div
          class="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800"
        >
          <span class="mt-px text-[11px]">⚠️</span>
          <p class="m-0 text-[11px] leading-4">
            <span class="font-bold">Lưu ý:</span>
            Chức năng này không hoạt động đối với tài khoản đăng nhập bằng Google.
          </p>
        </div>
      </div>

      <div class="flex justify-end pt-1">
        <button
          type="button"
          :disabled="savingWithdrawalNotification"
          class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-70 w-full sm:w-auto"
          @click="saveWithdrawalNotification"
        >
          <ReloadOutlined
            v-if="savingWithdrawalNotification"
            spin
            class="!text-white"
          />
          <SaveOutlined v-else class="!text-white" />
          <span class="!text-white">Lưu thông báo rút tiền</span>
        </button>
      </div>
    </div>
  </div>
</template>
