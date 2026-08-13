<script setup lang="ts">
import {
  DeleteOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
  TeamOutlined,
} from "@ant-design/icons-vue";
import { useZaloConfig } from "../../composables/useZaloConfig";

const {
  groupIds,
  savingGroups,
  addGroupInput,
  removeGroupInput,
  saveGroupIds,
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
        <TeamOutlined class="text-blue-600" />
        <span>1. ID Nhóm Zalo bot hoạt động</span>
      </h4>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        Khai báo danh sách ID nhóm Zalo để bot thực hiện chuyển đổi link và
        phản hồi tin nhắn.
      </p>
    </div>

    <!-- Warning Callout Box -->
    <div
      class="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5"
    >
      <InfoCircleOutlined class="text-amber-600 text-sm shrink-0 mt-0.5" />
      <p class="m-0 leading-relaxed font-medium">
        <strong>*Note:</strong> Vui lòng thêm tài khoản Bot vào nhóm Zalo
        trước khi nhập ID nhóm bên dưới để đảm bảo bot có đủ quyền đọc và
        phản hồi tin nhắn.
      </p>
    </div>

    <!-- Dynamic Group ID Inputs List -->
    <div class="space-y-3 pt-1">
      <div class="flex items-center justify-between">
        <label
          class="block text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          Danh sách ID nhóm Zalo ({{ groupIds.length }} nhóm):
        </label>
        <button
          @click="addGroupInput"
          type="button"
          class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <PlusOutlined class="!text-white" />
          <span class="!text-white">Thêm nhóm</span>
        </button>
      </div>

      <!-- Input Rows List -->
      <div v-if="groupIds.length > 0" class="space-y-2">
        <div
          v-for="(_, idx) in groupIds"
          :key="idx"
          class="flex items-center gap-2 animate-fade-in"
        >
          <span
            class="text-xs font-bold text-slate-400 font-mono w-6 text-right shrink-0"
          >
            #{{ idx + 1 }}
          </span>
          <input
            v-model="groupIds[idx]"
            type="text"
            placeholder="Nhập ID nhóm Zalo..."
            class="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:border-[#ee4d2d] focus:ring-2 focus:ring-orange-100"
          />
          <button
            @click="removeGroupInput(idx)"
            type="button"
            class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors cursor-pointer shrink-0"
            title="Xóa ô nhập này"
          >
            <DeleteOutlined class="text-sm" />
          </button>
        </div>
      </div>

      <div
        v-else
        class="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 text-center"
      >
        Chưa có ID nhóm nào. Vui lòng bấm nút "Thêm nhóm" để tạo ô nhập mới.
      </div>
    </div>

    <!-- Save Button -->
    <div class="flex justify-end pt-2">
      <button
        @click="saveGroupIds"
        :disabled="savingGroups"
        type="button"
        class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
      >
        <ReloadOutlined
          :spin="savingGroups"
          v-if="savingGroups"
          class="!text-white"
        />
        <SaveOutlined v-else class="!text-white" />
        <span class="!text-white">Lưu danh sách ID nhóm</span>
      </button>
    </div>
  </div>
</template>
