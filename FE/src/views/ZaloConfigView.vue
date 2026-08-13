<script setup lang="ts">
import {
  CodeOutlined,
  MessageOutlined,
  SettingOutlined,
  TeamOutlined,
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
  <section class="max-w-4xl mx-auto space-y-6 text-left">
    <!-- Page Header -->
    <div class="border-b border-slate-200 dark:border-slate-800 pb-5 text-left">
      <h3
        class="m-0 text-lg font-black text-slate-900 dark:text-white flex items-center gap-2"
      >
        <SettingOutlined class="text-[#ee4d2d]" />
        <span>Cấu hình Zalo Bot & Lệnh Chat</span>
      </h3>
      <p class="mt-1 mb-0 text-xs text-slate-500">
        Quản lý kết nối Bot Zalo, khai báo ID nhóm và thiết lập các câu lệnh tự động phản hồi.
      </p>
    </div>

    <!-- Navigation Menu Cards -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        :class="[
          'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer',
          activeSettingsMenu === 'bot'
            ? 'border-orange-200 bg-orange-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50/30',
        ]"
        @click="activeSettingsMenu = 'bot'"
      >
        <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activeSettingsMenu === 'bot' ? 'bg-[#ee4d2d] text-white' : 'bg-slate-100 text-slate-500']"><SettingOutlined /></span>
        <span><span class="block text-sm font-black text-slate-900">Thiết lập Bot</span><span class="mt-1 block text-[11px] text-slate-500">Trạng thái, nhóm và nội dung tự động</span></span>
      </button>
      <button
        type="button"
        :class="[
          'flex items-center gap-3 rounded-2xl border p-4 text-left transition-all cursor-pointer',
          activeSettingsMenu === 'commands'
            ? 'border-orange-200 bg-orange-50/70 shadow-sm'
            : 'border-slate-200 bg-white hover:border-orange-100 hover:bg-orange-50/30',
        ]"
        @click="activeSettingsMenu = 'commands'"
      >
        <span :class="['flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', activeSettingsMenu === 'commands' ? 'bg-[#ee4d2d] text-white' : 'bg-slate-100 text-slate-500']"><CodeOutlined /></span>
        <span><span class="block text-sm font-black text-slate-900">Thiết lập lệnh chat</span><span class="mt-1 block text-[11px] text-slate-500">Lệnh chat trong nhóm và chat riêng</span></span>
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
