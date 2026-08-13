<script setup lang="ts">
import {
  LinkOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons-vue";

const features = [
  {
    id: 1,
    title: "Chuyển link tự động",
    subtitle: "Dán link mua sắm và tạo link hoàn tiền",
    icon: LinkOutlined,
    bgColor: "bg-rose-50",
    borderColor: "border-rose-100",
    iconColor: "text-rose-500",
  },
  {
    id: 3,
    title: "Cam kết của chúng tôi",
    subtitle: "Hoàn tiền nhanh chóng, minh bạch",
    icon: SafetyCertificateOutlined,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-100",
    iconColor: "text-emerald-500",
  },
];
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-20 pb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 justify-center">
      <div
        v-for="item in features"
        :key="item.id"
        class="bg-white/90 backdrop-blur-sm rounded-2xl p-5 border border-gray-100/80 shadow-xs hover:shadow-md hover:border-gray-200 transition-all duration-300 flex items-start gap-4 text-left group hover:-translate-y-1"
      >
        <!-- Icon Badge -->
        <div
          :class="[
            'w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110',
            item.bgColor,
          ]"
        >
          <component :is="item.icon" :class="['text-xl', item.iconColor]" />
        </div>

        <!-- Content -->
        <div class="flex-grow">
          <h3
            class="text-sm sm:text-base font-bold text-gray-900 leading-snug group-hover:text-[#ff5733] transition-colors"
          >
            {{ item.title }}
          </h3>
          <p class="text-xs text-gray-400 mt-1 leading-relaxed">
            {{ item.subtitle }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
