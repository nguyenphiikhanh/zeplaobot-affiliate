<script setup lang="ts">
import { ref } from 'vue'
import { 
  HomeOutlined, 
  SearchOutlined, 
  WalletOutlined, 
  ClockCircleOutlined,
  GiftOutlined
} from '@ant-design/icons-vue'

const activeTab = ref('home')

const navItems = [
  { id: 'home', label: 'Trang chủ', icon: HomeOutlined },
  { id: 'search', label: 'Tra cứu đơn hàng', icon: SearchOutlined },
  { id: 'wallet', label: 'Ví của bạn', icon: WalletOutlined },
  { id: 'guide', label: 'Hướng dẫn', icon: ClockCircleOutlined },
]
</script>

<template>
  <header class="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 border-b border-gray-100/80 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      
      <!-- Brand Logo -->
      <div class="flex items-center gap-3 cursor-pointer group">
        <div class="relative w-11 h-11 flex items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-50 to-orange-50 border border-orange-100/80 shadow-xs group-hover:scale-105 transition-transform duration-300">
          <!-- Gift icon with dual color appearance like screenshot -->
          <div class="relative flex items-center justify-center">
            <GiftOutlined class="text-2xl text-[#ff5733] transform group-hover:rotate-6 transition-transform" />
          </div>
        </div>
      </div>

      <!-- Navigation Pills -->
      <nav class="hidden md:flex items-center gap-1.5 bg-gray-50/90 p-1.5 rounded-full border border-gray-100 shadow-2xs">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer',
            activeTab === item.id 
              ? 'bg-[#fff2ee] text-[#ff5733] border border-orange-200/60 shadow-2xs font-semibold' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70 border border-transparent'
          ]"
        >
          <component :is="item.icon" class="text-base" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Right Action Button -->
      <div class="flex items-center gap-3">
        <a-button 
          type="primary"
          shape="round"
          size="large"
          class="!bg-gradient-to-r !from-[#ff6b4a] !to-[#ff4520] hover:!from-[#ff5733] hover:!to-[#e03816] !border-none !shadow-md hover:!shadow-lg !flex !items-center !gap-2 !px-5 !py-2.5 !h-auto !font-semibold !text-white transform hover:-translate-y-0.5 transition-all duration-200"
        >
          <GiftOutlined class="text-lg animate-bounce" />
          <div class="flex flex-col text-left leading-tight">
            <span class="text-xs font-normal opacity-90">Bắt đầu ngay</span>
            <span class="text-sm font-bold">Bắt đầu ngay</span>
          </div>
        </a-button>
      </div>

    </div>
  </header>
</template>
