<script setup lang="ts">
import {
  LinkOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";
import VariableTag from "./VariableTag.vue";

const {
  linkConvertTemplate,
  linkConvertErrorTemplate,
  savingLinkTemplate,
  saveLinkTemplate,
} = useZaloConfig();
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4 shadow-2xs"
  >
    <div>
      <h4
        class="m-0 text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"
      >
        <LinkOutlined class="text-[#ee4d2d]" />
        <span>2. Nội dung chuyển đổi link</span>
      </h4>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        Mẫu tin nhắn bot sẽ tự động gửi vào nhóm Zalo sau khi quy đổi link
        Shopee thường thành link hoàn tiền.
      </p>
    </div>

    <!-- Helper Variable Tags -->
    <div class="space-y-1.5">
      <label
        class="block text-xs font-bold text-slate-700 dark:text-slate-300"
      >
        Bấm để sao chép nhanh biến:
      </label>
      <div class="flex flex-wrap gap-1.5">
        <VariableTag name="{affiliate_link}" />
        <VariableTag name="{product_name}" />
        <VariableTag name="{commission_rate}" />
        <VariableTag name="{commission}" />
        <VariableTag name="{user_commission}" />
      </div>
    </div>

    <!-- Textarea template -->
    <div class="space-y-1.5">
      <textarea
        v-model="linkConvertTemplate"
        rows="5"
        placeholder="Nhập nội dung mẫu chuyển đổi link..."
        class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
      ></textarea>
    </div>

    <div
      class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3"
    >
      <div>
        <h5
          class="m-0 text-xs font-black text-slate-800 dark:text-slate-200"
        >
          Nội dung báo lỗi khi không lấy được dữ liệu sản phẩm
        </h5>
        <p class="mt-1 mb-0 text-[11px] text-slate-500 leading-5">
          Bot gửi nội dung này khi nhận đúng link Shopee nhưng không lấy
          được thông tin sản phẩm hoặc link shopee giả.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-[11px] font-bold text-slate-500"
          >Biến hỗ trợ:</span
        >
        <VariableTag name="{original_link}" variant="rose" />
      </div>
      <textarea
        v-model="linkConvertErrorTemplate"
        rows="4"
        placeholder="Nhập nội dung báo lỗi khi không lấy được dữ liệu sản phẩm..."
        class="w-full bg-rose-50/40 dark:bg-slate-800 border border-rose-200 dark:border-slate-700 rounded-xl p-3 text-xs font-sans text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
      ></textarea>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-1">
      <button
        @click="saveLinkTemplate"
        :disabled="savingLinkTemplate"
        type="button"
        class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-70 w-full sm:w-auto"
      >
        <ReloadOutlined
          :spin="savingLinkTemplate"
          v-if="savingLinkTemplate"
          class="!text-white"
        />
        <SaveOutlined v-else class="!text-white" />
        <span class="!text-white">Lưu mẫu chuyển đổi link</span>
      </button>
    </div>
  </div>
</template>
