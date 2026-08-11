<script setup>
import { ref } from "vue";
import { message } from "ant-design-vue";
import {
  TeamOutlined,
  LinkOutlined,
  SmileOutlined,
  SaveOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons-vue";

// State 1: Zalo Group IDs Management
const groupIds = ref(["183749204817", "92817402918", "30491827461"]);
const savingGroups = ref(false);

// State 2: Link Conversion Message Template
const linkConvertTemplate = ref(
  `🛒 Link hoàn tiền của bạn:\n{affiliate_link}\n\n📦 Sản phẩm: {product_name}\n💰 Hoa hồng: {commission}đ ({commission_rate}%)\n\nTiết kiệm ngay khi mua sắm qua Zalo Bot!`
);
const savingLinkTemplate = ref(false);

// State 3: New Member Welcome Template
const enableWelcomeMessage = ref(true);
const welcomeMessageTemplate = ref(
  `👋 Chào mừng {user_name} đã tham gia nhóm {group_name}!\n\n🤖 Mình là Bot Hoàn Tiền. Hãy dán link Shopee vào nhóm để nhận ngay hoàn tiền tự động nhé! 💸`
);
const savingWelcomeTemplate = ref(false);

// Group ID operations (dynamic input rows)
const addGroupInput = () => {
  groupIds.value.push("");
};

const removeGroupInput = (index) => {
  groupIds.value.splice(index, 1);
};

const saveGroupIds = () => {
  savingGroups.value = true;
  setTimeout(() => {
    savingGroups.value = false;
    message.success("Lưu danh sách ID nhóm Zalo thành công!");
  }, 500);
};

// Variable copy helper
const copyVariable = (varName) => {
  navigator.clipboard.writeText(varName);
  message.success(`Đã sao chép biến ${varName}!`);
};

const saveLinkTemplate = () => {
  if (!linkConvertTemplate.value.trim()) {
    message.warning("Nội dung chuyển đổi link không được để trống!");
    return;
  }
  savingLinkTemplate.value = true;
  setTimeout(() => {
    savingLinkTemplate.value = false;
    message.success("Cập nhật mẫu tin nhắn chuyển đổi link thành công!");
  }, 500);
};

const saveWelcomeTemplate = () => {
  savingWelcomeTemplate.value = true;
  setTimeout(() => {
    savingWelcomeTemplate.value = false;
    message.success("Cập nhật cấu hình tin chào mừng thành công!");
  }, 500);
};
</script>

<template>
  <section class="max-w-4xl mx-auto space-y-6 text-left">
    <!-- Page Header -->
    <div class="border-b border-slate-200 dark:border-slate-800 pb-5 text-left">
      <h3
        class="m-0 text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"
      >
        <MessageOutlined class="text-blue-500" />
        <span>Cấu hình Bot Zalo</span>
      </h3>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        Quản lý nhóm Zalo hoạt động và mẫu nội dung phản hồi tự động của Bot.
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <!-- Card 1: Quản lý ID Nhóm Zalo -->
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
              v-for="(id, idx) in groupIds"
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
            <span class="!text-white">Lưu danh sách nhóm</span>
          </button>
        </div>
      </div>

      <!-- Card 2: Nội dung chuyển đổi link -->
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
            <button
              @click="copyVariable('{affiliate_link}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {affiliate_link}
            </button>
            <button
              @click="copyVariable('{product_name}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {product_name}
            </button>
            <button
              @click="copyVariable('{commission_rate}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {commission_rate}
            </button>
            <button
              @click="copyVariable('{commission}')"
              type="button"
              class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
            >
              {commission}
            </button>
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

        <!-- Save Button -->
        <div class="flex justify-end pt-1">
          <button
            @click="saveLinkTemplate"
            :disabled="savingLinkTemplate"
            type="button"
            class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
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

      <!-- Card 3: Nội dung chào mừng member mới -->
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
          <a-switch v-model:checked="enableWelcomeMessage" />
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
              <button
                @click="copyVariable('{user_name}')"
                type="button"
                class="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-[11px] font-mono font-bold transition-all cursor-pointer"
              >
                {user_name}
              </button>
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
              class="bg-[#ee4d2d] hover:bg-[#d63d1e] !text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-70"
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
    </div>
  </section>
</template>
