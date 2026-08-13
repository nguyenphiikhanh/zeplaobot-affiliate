<script setup lang="ts">
import { ReloadOutlined, SaveOutlined } from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";
import VariableTag from "./VariableTag.vue";

const {
  groupCommands,
  savingGroupCommands,
  commandText,
  saveGroupCommands,
} = useZaloConfig();
</script>

<template>
  <div class="space-y-4">
    <a-alert
      type="info"
      show-icon
      message="Bot chỉ nhận các lệnh này trong nhóm đã khai báo. Dấu # luôn được giữ cố định; tên lệnh không được để trống hoặc trùng nhau."
      class="!rounded-xl"
    />

    <!-- Ví tiền -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="mb-4">
        <h5 class="m-0 text-sm font-black text-slate-800">Ví tiền</h5>
        <p class="mb-0 mt-1 text-xs leading-5 text-slate-500">
          Tạo người dùng và ví nếu chưa tồn tại, sau đó trả về số dư khả dụng cùng UID của người gửi.
        </p>
      </div>
      <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
      <a-input
        :value="groupCommands.wallet.command"
        placeholder="vitien"
        @update:value="groupCommands.wallet.command = commandText($event)"
      >
        <template #addonBefore><b>#</b></template>
      </a-input>
      <div class="mb-1.5 mt-4 flex items-center justify-between">
        <label class="text-xs font-bold text-slate-600">Nội dung phản hồi</label>
        <div class="flex flex-wrap gap-1">
          <VariableTag name="{total_balance}" size="sm" />
          <VariableTag name="{pending_balance}" size="sm" />
          <VariableTag name="{total_paid}" size="sm" />
          <VariableTag name="{uid}" size="sm" />
        </div>
      </div>
      <a-textarea v-model:value="groupCommands.wallet.response" :rows="3" />
    </div>

    <!-- Rút tiền -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="mb-4">
        <h5 class="m-0 text-sm font-black text-slate-800">Rút tiền</h5>
        <p class="mb-0 mt-1 text-xs leading-5 text-slate-500">
          Rút toàn bộ số dư khả dụng. Bot từ chối nếu số dư dưới 10.000đ và tạo yêu cầu rút tiền nếu đủ điều kiện.
        </p>
      </div>
      <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
      <a-input
        :value="groupCommands.withdraw.command"
        placeholder="ruttien"
        @update:value="groupCommands.withdraw.command = commandText($event)"
      >
        <template #addonBefore><b>#</b></template>
      </a-input>

      <div class="mb-1.5 mt-4 flex items-center justify-between">
        <label class="text-xs font-bold text-slate-600">Nội dung rút thành công</label>
        <VariableTag name="{total_balance}" size="sm" />
      </div>
      <a-textarea v-model:value="groupCommands.withdraw.response" :rows="3" />

      <div class="mb-1.5 mt-4 flex items-center justify-between">
        <label class="text-xs font-bold text-slate-600">Nội dung khi chưa đủ 10.000đ</label>
        <VariableTag name="{total_balance}" size="sm" />
      </div>
      <a-textarea v-model:value="groupCommands.withdraw.insufficient_response" :rows="3" />

      <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600">Nội dung khi chưa cấu hình ngân hàng</label>
        <div class="flex gap-1">
          <VariableTag name="{url}" size="sm" />
          <VariableTag name="{total_balance}" size="sm" />
        </div>
      </div>
      <a-textarea v-model:value="groupCommands.withdraw.no_bank_response" :rows="3" />
    </div>

    <!-- Đơn hàng -->
    <div class="rounded-2xl border border-slate-200 p-4">
      <div class="mb-4">
        <h5 class="m-0 text-sm font-black text-slate-800">Đơn hàng</h5>
        <p class="mb-0 mt-1 text-xs leading-5 text-slate-500">
          Gửi đường dẫn tra cứu vào nhóm và nhắn riêng mã tracking để người dùng đăng nhập xem đơn hàng.
        </p>
      </div>
      <label class="mb-1.5 block text-xs font-bold text-slate-600">Lệnh</label>
      <a-input
        :value="groupCommands.orders.command"
        placeholder="donhang"
        @update:value="groupCommands.orders.command = commandText($event)"
      >
        <template #addonBefore><b>#</b></template>
      </a-input>

      <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600">Nội dung phản hồi trong nhóm</label>
        <div class="flex flex-wrap gap-1">
          <VariableTag name="{url}" size="sm" />
          <VariableTag name="{get_tracking_code_command}" size="sm" />
        </div>
      </div>
      <a-textarea v-model:value="groupCommands.orders.response" :rows="3" />

      <div class="mb-1.5 mt-4 flex flex-wrap items-center justify-between gap-2">
        <label class="text-xs font-bold text-slate-600">Nội dung tin nhắn riêng</label>
        <div class="flex gap-1">
          <VariableTag name="{tracking_code}" size="sm" />
          <VariableTag name="{new_tracking_code}" size="sm" />
        </div>
      </div>
      <a-textarea v-model:value="groupCommands.orders.private_response" :rows="3" />
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-1">
      <button
        type="button"
        :disabled="savingGroupCommands"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ee4d2d] px-5 py-2.5 text-xs font-bold !text-white shadow-sm disabled:opacity-60 cursor-pointer"
        @click="saveGroupCommands"
      >
        <ReloadOutlined v-if="savingGroupCommands" spin class="!text-white" />
        <SaveOutlined v-else class="!text-white" />
        <span class="!text-white">Lưu lệnh chat nhóm</span>
      </button>
    </div>
  </div>
</template>
