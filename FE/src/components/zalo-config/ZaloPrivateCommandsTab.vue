<script setup lang="ts">
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";
import VariableTag from "./VariableTag.vue";

const {
  privateCommands,
  privateCommandNote,
  savingPrivateCommands,
  commandText,
  savePrivateCommands,
} = useZaloConfig();
</script>

<template>
  <div class="space-y-4">
    <a-alert
      type="info"
      show-icon
      message="Khi người dùng gửi lệnh riêng, Bot sẽ tự tạo tài khoản và ví nếu chưa tồn tại."
      class="!mb-5 !rounded-xl"
    />

    <!-- Mã theo dõi -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="mb-4">
        <h5 class="m-0 text-sm font-black text-slate-800">Mã theo dõi</h5>
        <p class="mb-0 mt-1 text-xs leading-5 text-slate-500">
          Lấy tracking code của người dùng từ hệ thống để đăng nhập tại trang /login.
        </p>
      </div>
      <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
      <a-input
        :value="privateCommands.tracking.command"
        placeholder="tracking-code"
        @update:value="privateCommands.tracking.command = commandText($event)"
      >
        <template #addonBefore><b>#</b></template>
      </a-input>
      <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600">Nội dung phản hồi</label>
        <div class="flex gap-1">
          <VariableTag name="{tracking_code}" size="sm" />
        </div>
      </div>
      <a-textarea v-model:value="privateCommands.tracking.response" :rows="3" />
    </div>

    <!-- Quên mã theo dõi -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="mb-4">
        <h5 class="m-0 text-sm font-black text-slate-800">Quên mã theo dõi</h5>
        <p class="mb-0 mt-1 text-xs leading-5 text-slate-500">
          Sinh mã tracking mới, cập nhật người dùng tương ứng trong DB và vô hiệu mã cũ.
        </p>
      </div>
      <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
      <a-input
        :value="privateCommands.reset_tracking.command"
        placeholder="new-tracking-code"
        @update:value="privateCommands.reset_tracking.command = commandText($event)"
      >
        <template #addonBefore><b>#</b></template>
      </a-input>
      <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600">Nội dung phản hồi</label>
        <div class="flex gap-1">
          <VariableTag name="{tracking_code}" size="sm" />
        </div>
      </div>
      <a-textarea v-model:value="privateCommands.reset_tracking.response" :rows="3" />
    </div>

    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h5 class="m-0 text-sm font-black text-slate-800">Gửi thêm chú thích</h5>
          <p class="mb-0 mt-1 text-xs leading-5 text-slate-500">
            Gửi thêm một tin nhắn chú thích sau khi Bot gửi mã theo dõi.
          </p>
        </div>
        <a-switch v-model:checked="privateCommandNote.enabled" />
      </div>
      <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600">Nội dung chú thích</label>
        <VariableTag name="{new_tracking_code}" size="sm" />
      </div>
      <a-textarea
        v-model:value="privateCommandNote.response"
        :rows="3"
        :disabled="!privateCommandNote.enabled"
      />
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-1">
      <button
        type="button"
        :disabled="savingPrivateCommands"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-xs font-bold !text-white shadow-sm disabled:opacity-60 cursor-pointer w-full sm:w-auto"
        @click="savePrivateCommands"
      >
        <ReloadOutlined v-if="savingPrivateCommands" spin class="!text-white" />
        <SaveOutlined v-else class="!text-white" />
        <span class="!text-white">Lưu lệnh chat riêng</span>
      </button>
    </div>
  </div>
</template>
