<script setup lang="ts">
import {
  CodeOutlined,
  MessageOutlined,
  SettingOutlined,
  TeamOutlined,
  RobotOutlined,
} from "@ant-design/icons-vue";
import { useZaloConfig } from "../composables/useZaloConfig";

import ZaloBotStatusHeader from "../components/zalo-config/ZaloBotStatusHeader.vue";
import ZaloGroupIdsCard from "../components/zalo-config/ZaloGroupIdsCard.vue";
import ZaloLinkTemplatesCard from "../components/zalo-config/ZaloLinkTemplatesCard.vue";
import ZaloWelcomeTemplateCard from "../components/zalo-config/ZaloWelcomeTemplateCard.vue";
import ZaloGroupCommandsTab from "../components/zalo-config/ZaloGroupCommandsTab.vue";
import ZaloPrivateCommandsTab from "../components/zalo-config/ZaloPrivateCommandsTab.vue";

const {
  activeSettingsMenu,
  activeCommandTab,
  loadingConfig,
} = useZaloConfig();
</script>

<template>
  <section class="max-w-4xl mx-auto space-y-6 text-left pb-12">
    <!-- Page Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs text-left"
    >
      <div class="space-y-1">
        <div
          class="flex items-center gap-2 text-slate-800 font-extrabold text-base sm:text-xl tracking-tight"
        >
          <RobotOutlined class="text-[#ee4d2d]" />
          <h3 class="text-base sm:text-xl font-bold text-slate-800 tracking-tight m-0">
            Cấu hình Zalo Bot & Lệnh Chat
          </h3>
        </div>
        <p class="text-xs sm:text-sm text-slate-500 m-0">
          Quản lý kết nối Bot Zalo, khai báo ID nhóm và thiết lập các câu lệnh tự động phản hồi.
        </p>
      </div>
    </div>

    <!-- Navigation Menu Cards -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        :class="[
          'flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer',
          activeSettingsMenu === 'bot'
            ? 'border-orange-200 bg-orange-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50/30',
        ]"
        @click="activeSettingsMenu = 'bot'"
      >
        <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activeSettingsMenu === 'bot' ? 'bg-[#ee4d2d] text-white' : 'bg-slate-100 text-slate-500']"><SettingOutlined /></span>
        <span><span class="block text-sm font-black text-slate-900">Thiết lập Bot</span><span class="mt-0.5 block text-[11px] text-slate-500">Trạng thái, nhóm và nội dung tự động</span></span>
      </button>
      <button
        type="button"
        :class="[
          'flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 text-left transition-all cursor-pointer',
          activeSettingsMenu === 'commands'
            ? 'border-orange-200 bg-orange-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50/30',
        ]"
        @click="activeSettingsMenu = 'commands'"
      >
        <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activeSettingsMenu === 'commands' ? 'bg-[#ee4d2d] text-white' : 'bg-slate-100 text-slate-500']"><CodeOutlined /></span>
        <span><span class="block text-sm font-black text-slate-900">Thiết lập lệnh chat</span><span class="mt-0.5 block text-[11px] text-slate-500">Lệnh chat trong nhóm và chat riêng</span></span>
      </button>
    </div>

    <!-- Main Content Area -->
    <a-spin :spinning="loadingConfig" tip="Đang tải cấu hình Bot Zalo...">
      <!-- Tab 1: Bot Settings -->
      <div v-show="activeSettingsMenu === 'bot'" class="flex flex-col gap-6" :class="{ 'min-h-[360px]': loadingConfig }">
        <ZaloBotStatusHeader />
        <ZaloGroupIdsCard />
        <ZaloLinkTemplatesCard />
        <ZaloWelcomeTemplateCard />
      </div>

      <!-- Tab 2: Command Settings -->
      <div v-show="activeSettingsMenu === 'commands'" class="min-h-[360px] rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div class="mb-5">
          <h4 class="m-0 flex items-center gap-2 text-sm font-black text-slate-900"><CodeOutlined class="text-[#ee4d2d]"/> Thiết lập lệnh chat</h4>
          <p class="mb-0 mt-1 text-xs text-slate-500">Quản lý lệnh Bot phản hồi theo từng loại hội thoại Zalo.</p>
        </div>
        <a-alert type="info" show-icon class="!mb-5 !rounded-xl">
          <template #message>Định dạng chữ in đậm</template>
          <template #description>
            <span class="text-xs leading-5">
              Bao quanh nội dung bằng <code class="rounded bg-blue-100/70 px-1 py-0.5">&lt;b&gt;nội dung&lt;/b&gt;</code>.
              Có thể xuống dòng bên trong thẻ để in đậm cả một khối nội dung. Hệ thống cũng nhận dạng dạng đóng thẻ
              <code class="rounded bg-blue-100/70 px-1 py-0.5">&lt;b&gt;nội dung&lt;b&gt;</code>.
            </span>
          </template>
        </a-alert>
        <a-tabs v-model:activeKey="activeCommandTab" class="zalo-command-tabs">
          <a-tab-pane key="group">
            <template #tab><span class="inline-flex items-center gap-2"><TeamOutlined/> Lệnh chat nhóm</span></template>
            <ZaloGroupCommandsTab />
          </a-tab-pane>
          <a-tab-pane key="private">
            <template #tab><span class="inline-flex items-center gap-2"><MessageOutlined/> Lệnh chat riêng</span></template>
            <ZaloPrivateCommandsTab />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </section>
</template>
