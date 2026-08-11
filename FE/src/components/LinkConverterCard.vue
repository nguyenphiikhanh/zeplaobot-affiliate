<script setup lang="ts">
import { ref } from "vue";
import { message } from "ant-design-vue";
import {
  CopyOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  WarningOutlined,
} from "@ant-design/icons-vue";
import { Rocket } from "lucide-vue-next";

interface ConvertedLink {
  id: number;
  original: string;
  platform: string;
  affiliateUrl: string;
  cashbackRate: string;
  copied: boolean;
}

const inputLink = ref("");
const errorMessage = ref("");
const isConverting = ref(false);
const convertedLinks = ref<ConvertedLink[]>([]);
const inputRef = ref<HTMLInputElement | null>(null);

// Helper Regex matching all Shopee link formats (shopee.vn/..., s.shopee.vn/..., vn.shp.ee/...)
const SHOPEE_LINK_REGEX =
  /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(shopee\.vn|shp\.ee)\/[^\s]+/i;

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      inputLink.value = text.trim();
      errorMessage.value = "";
      message.success("Đã dán link từ bộ nhớ tạm!");
      if (inputRef.value) inputRef.value.focus();
    }
  } catch (err) {
    message.warning("Vui lòng cấp quyền bộ nhớ tạm hoặc dán thủ công!");
  }
};

const handleInput = () => {
  errorMessage.value = "";
};

const validateLink = (trimmed: string): RegExpMatchArray | null => {
  if (!trimmed) {
    errorMessage.value = "Vui lòng dán link sản phẩm Shopee!";
    return null;
  }

  const match = trimmed.match(SHOPEE_LINK_REGEX);
  if (!match) {
    errorMessage.value =
      "Link không hợp lệ! Vui lòng dán link Shopee (dạng shopee.vn/..., s.shopee.vn/... hoặc vn.shp.ee/...)";
    return null;
  }

  errorMessage.value = "";
  return match;
};

const handleConvert = () => {
  const trimmed = inputLink.value.trim();
  const match = validateLink(trimmed);

  if (!match) {
    if (inputRef.value) inputRef.value.focus();
    return;
  }

  isConverting.value = true;

  setTimeout(() => {
    const matchedUrl = match[0].startsWith("http")
      ? match[0]
      : `https://${match[0]}`;
    const subId = Math.random().toString(36).substring(2, 9);
    const affiliateUrl = `https://hoantien24h.vn/s/${subId}`;

    convertedLinks.value = [
      {
        id: Date.now(),
        original: matchedUrl,
        platform: "Shopee",
        affiliateUrl,
        cashbackRate: "5.5% - 12%",
        copied: false,
      },
    ];

    isConverting.value = false;
    message.success("Đã chuyển đổi link Shopee thành công!");
  }, 600);
};

const copyLink = (item: ConvertedLink) => {
  navigator.clipboard.writeText(item.affiliateUrl);
  item.copied = true;
  message.success("Đã sao chép link hoàn tiền!");
  setTimeout(() => {
    item.copied = false;
  }, 2000);
};
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 relative z-20">
    <!-- Main Glass Card Container -->
    <div
      class="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/60 border border-gray-100 transition-all hover:shadow-2xl hover:shadow-orange-500/5 relative z-10"
    >
      <!-- Platform Logos Header -->
      <div
        class="flex items-center justify-center gap-6 sm:gap-10 mb-6 flex-wrap"
      >
        <!-- Shopee Logo -->
        <img
          src="/logo/shopee.png"
          alt="Shopee"
          class="h-7 sm:h-8 w-auto object-contain"
        />
      </div>

      <!-- Input Bar Container -->
      <div
        :class="[
          'bg-gray-50/90 rounded-2xl p-2 border transition-all duration-200 shadow-2xs',
          errorMessage
            ? 'border-rose-400 ring-4 ring-rose-100'
            : 'border-gray-200/80 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100',
        ]"
      >
        <div
          class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
        >
          <!-- Paste Button -->
          <button
            @click="handlePaste"
            type="button"
            class="bg-[#fff2ee] hover:bg-[#ffe6df] text-[#ff5733] font-semibold text-sm px-4 py-3 rounded-xl border border-orange-200/80 flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-150 flex-shrink-0"
          >
            <span>📋</span>
            <span>Dán</span>
          </button>

          <!-- Input Field (Single Line with ref) -->
          <div class="flex-grow relative">
            <input
              ref="inputRef"
              v-model="inputLink"
              @input="handleInput"
              type="text"
              placeholder="🔗 Dán link sản phẩm..."
              class="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 placeholder-gray-400 text-sm sm:text-base py-2.5 px-2"
              @keydown.enter.prevent="handleConvert"
            />
          </div>

          <!-- Convert CTA Button with ArrowRightOutlined icon -->
          <button
            @click="handleConvert"
            :disabled="isConverting"
            type="button"
            class="bg-[#ff5733] hover:bg-[#e04725] active:scale-95 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-md shadow-orange-500/20 inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 flex-shrink-0 disabled:opacity-70 leading-none"
          >
            <span class="text-white font-bold leading-none"
              >Chuyển đổi link</span
            >
            <ArrowRightOutlined
              :spin="isConverting"
              class="!text-white text-base leading-none inline-flex items-center justify-center transform group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      </div>

      <!-- Inline Error Message Display -->
      <div v-if="errorMessage" class="mt-2.5 text-left animate-fade-in">
        <p
          class="text-xs text-rose-600 font-semibold flex items-center gap-1.5 bg-rose-50 px-3 py-2 rounded-xl border border-rose-200/80 shadow-2xs"
        >
          <WarningOutlined class="text-rose-500 text-sm" />
          <span>{{ errorMessage }}</span>
        </p>
      </div>

      <!-- Converted Results Display Box -->
      <div
        v-if="convertedLinks.length > 0"
        class="mt-6 pt-6 border-t border-gray-100 space-y-3 animate-fade-in"
      >
        <div
          v-for="item in convertedLinks"
          :key="item.id"
          class="bg-orange-50/50 border border-orange-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left"
        >
          <div class="overflow-hidden max-w-full">
            <div class="flex items-center gap-2 mb-1">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-orange-200 text-[#ff5733]"
              >
                {{ item.platform }}
              </span>
              <span
                class="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md"
              >
                Hoàn tiền {{ item.cashbackRate }}
              </span>
            </div>
            <p class="text-xs text-gray-500 truncate max-w-md">
              {{ item.original }}
            </p>
            <p
              class="text-sm font-bold text-gray-800 mt-1 flex items-center gap-1"
            >
              <span>Link ngắn:</span>
              <a
                :href="item.affiliateUrl"
                target="_blank"
                class="text-[#ff5733] hover:underline"
                >{{ item.affiliateUrl }}</a
              >
            </p>
          </div>

          <button
            @click="copyLink(item)"
            type="button"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-200 self-end sm:self-center flex-shrink-0',
              item.copied
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-[#ff5733] hover:bg-[#e04725] text-white shadow-sm',
            ]"
          >
            <component :is="item.copied ? CheckOutlined : CopyOutlined" />
            <span>{{ item.copied ? "Đã sao chép" : "Sao chép link" }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
