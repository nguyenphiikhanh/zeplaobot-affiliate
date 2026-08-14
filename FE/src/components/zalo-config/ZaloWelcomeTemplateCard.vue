<script setup lang="ts">
import {
  ReloadOutlined,
  SaveOutlined,
  SmileOutlined,
} from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";
import VariableTag from "./VariableTag.vue";

const {
  enableWelcomeMessage,
  welcomeMessageTemplate,
  savingWelcomeTemplate,
  saveWelcomeTemplate,
} = useZaloConfig();
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
  >
    <div class="flex items-center justify-between gap-4">
      <div>
        <h4
          class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
        >
          <SmileOutlined class="text-[#ee4d2d]" />
          <span>3. Nội dung chào mừng member mới</span>
        </h4>
        <p class="mt-1 mb-0 text-xs text-slate-500">
          Tự động gửi tin nhắn chào mừng khi có thành viên mới gia nhập nhóm
          Zalo.
        </p>
      </div>

      <!-- Enable/Disable Switch -->
      <a-switch
        v-model:checked="enableWelcomeMessage"
        :loading="savingWelcomeTemplate"
        @change="saveWelcomeTemplate"
      />
    </div>

    <!-- Conditional Welcome Textarea -->
    <div
      v-if="enableWelcomeMessage"
      class="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3 text-left animate-fade-in"
    >
      <!-- Helper Variable Tags -->
      <div class="space-y-1.5">
        <label
          class="block text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          Bấm để sao chép nhanh biến:
        </label>
        <div class="flex flex-wrap gap-1.5">
          <VariableTag name="{user_name}" />
          <VariableTag name="{group_name}" />
        </div>
      </div>

      <textarea
        v-model="welcomeMessageTemplate"
        rows="4"
        placeholder="Nhập nội dung chào mừng..."
        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
      ></textarea>

      <!-- Save Button -->
      <div class="flex justify-end pt-1">
        <button
          @click="saveWelcomeTemplate"
          :disabled="savingWelcomeTemplate"
          type="button"
          class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-70 w-full sm:w-auto"
        >
          <ReloadOutlined
            :spin="savingWelcomeTemplate"
            v-if="savingWelcomeTemplate"
            class="!text-white"
          />
          <SaveOutlined v-else class="!text-white" />
          <span class="!text-white">Lưu mẫu chào mừng</span>
        </button>
      </div>
    </div>
  </div>
</template>
