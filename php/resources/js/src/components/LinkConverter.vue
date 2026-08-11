<template>
  <div class="w-full">
    <!-- Main Converter Card -->
    <a-card
      :bordered="false"
      class="rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 relative overflow-hidden"
      :bodyStyle="{ padding: '12px' }"
    >
      <!-- Glow Decor -->
      <div
        class="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-[40px] pointer-events-none"
      ></div>

      <!-- Platform Selection -->
      <div
        class="mb-3 sm:mb-8 p-2.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50"
      >
        <div class="flex items-center gap-2 mb-2 sm:mb-4">
          <div class="w-1.5 h-3.5 sm:h-4 bg-[#ee4d2d] rounded-full"></div>
          <h3
            class="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider sm:tracking-widest m-0"
          >
            Chọn Kênh Quy Đổi
          </h3>
        </div>

        <a-row :gutter="[8, 8]" justify="center">
          <!-- Shopee Card -->
          <a-col :xs="12" :sm="6" v-if="platforms.shopee">
            <div
              @click="selectType(AFFILIATE_TYPES.SHOPEE)"
              class="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer w-full"
              :class="
                currentType === AFFILIATE_TYPES.SHOPEE
                  ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/30 shadow-sm shadow-orange-500/10 scale-[1.01]'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
              "
            >
              <div
                class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden"
              >
                <img
                  :src="'/icon/shopee.webp'"
                  class="w-4 h-4 sm:w-[22px] sm:h-[22px] object-contain"
                  alt="Shopee Logo"
                />
              </div>
              <div class="flex flex-col">
                <div
                  class="hidden sm:block text-[9px] font-bold tracking-widest uppercase"
                  :class="
                    currentType === AFFILIATE_TYPES.SHOPEE
                      ? 'text-[#ee4d2d]'
                      : 'text-slate-400'
                  "
                >
                  Hoàn tiền
                </div>
                <div
                  class="text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5"
                  :class="
                    currentType === AFFILIATE_TYPES.SHOPEE
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-500'
                  "
                >
                  Shopee
                </div>
              </div>
            </div>
          </a-col>

          <!-- TikTok Card -->
          <a-col :xs="12" :sm="6" v-if="platforms.tiktok">
            <div
              @click="selectType(AFFILIATE_TYPES.TIKTOK)"
              class="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer w-full"
              :class="
                currentType === AFFILIATE_TYPES.TIKTOK
                  ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/30 shadow-sm shadow-orange-500/10 scale-[1.01]'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
              "
            >
              <div
                class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden"
              >
                <img
                  :src="'/icon/tiktok.webp'"
                  class="w-4 h-4 sm:w-[22px] sm:h-[22px] object-contain"
                  alt="TikTok Logo"
                />
              </div>
              <div class="flex flex-col">
                <div
                  class="hidden sm:block text-[9px] font-bold tracking-widest uppercase"
                  :class="
                    currentType === AFFILIATE_TYPES.TIKTOK
                      ? 'text-[#ee4d2d]'
                      : 'text-slate-400'
                  "
                >
                  Hoàn tiền
                </div>
                <div
                  class="text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5"
                  :class="
                    currentType === AFFILIATE_TYPES.TIKTOK
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-500'
                  "
                >
                  TikTok
                </div>
              </div>
            </div>
          </a-col>

          <!-- Lazada Card -->
          <a-col :xs="12" :sm="6" v-if="platforms.lazada">
            <div
              @click="selectType(AFFILIATE_TYPES.LAZADA)"
              class="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer w-full"
              :class="
                currentType === AFFILIATE_TYPES.LAZADA
                  ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/30 shadow-sm shadow-orange-500/10 scale-[1.01]'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
              "
            >
              <div
                class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden"
              >
                <img
                  :src="'/icon/lazada.webp'"
                  class="w-4 h-4 sm:w-[22px] sm:h-[22px] object-contain"
                  alt="Lazada Logo"
                />
              </div>
              <div class="flex flex-col">
                <div
                  class="hidden sm:block text-[9px] font-bold tracking-widest uppercase"
                  :class="
                    currentType === AFFILIATE_TYPES.LAZADA
                      ? 'text-[#ee4d2d]'
                      : 'text-slate-400'
                  "
                >
                  Hoàn tiền
                </div>
                <div
                  class="text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5"
                  :class="
                    currentType === AFFILIATE_TYPES.LAZADA
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-500'
                  "
                >
                  Lazada
                </div>
              </div>
            </div>
          </a-col>

          <!-- ShopeeFood Card -->
          <a-col
            :xs="12"
            :sm="6"
            v-if="platforms.shopeefood"
          >
            <div
              @click="selectType(AFFILIATE_TYPES.SHOPEEFOOD)"
              class="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-3 p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer w-full"
              :class="
                currentType === AFFILIATE_TYPES.SHOPEEFOOD
                  ? 'border-[#ee4d2d] bg-orange-50 dark:bg-orange-950/30 shadow-sm shadow-orange-500/10 scale-[1.01]'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
              "
            >
              <div
                class="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 overflow-hidden"
              >
                <img
                  :src="'/icon/shopeefood.webp'"
                  class="w-4 h-4 sm:w-[22px] sm:h-[22px] object-contain"
                  alt="ShopeeFood Logo"
                  @error="$event.target.src = '/icon/shopee.webp'"
                />
              </div>
              <div class="flex flex-col">
                <div
                  class="hidden sm:block text-[9px] font-bold tracking-widest uppercase"
                  :class="
                    currentType === AFFILIATE_TYPES.SHOPEEFOOD
                      ? 'text-[#ee4d2d]'
                      : 'text-slate-400'
                  "
                >
                  Hoàn tiền
                </div>
                <div
                  class="text-xs sm:text-sm font-bold flex items-center gap-1 sm:gap-1.5"
                  :class="
                    currentType === AFFILIATE_TYPES.SHOPEEFOOD
                      ? 'text-slate-800 dark:text-slate-100'
                      : 'text-slate-500'
                  "
                >
                  S.P Food
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- Mascot -->
      <div class="flex justify-center mb-2 sm:mb-4 select-none">
        <img
          :src="'/saffi_gold.webp'"
          alt="Saffi Bee Mascot"
          class="h-10 w-10 sm:h-20 sm:w-20 object-contain hover:scale-110 hover:-rotate-6 transition-transform duration-500 cursor-pointer"
        />
      </div>

      <!-- Title -->
      <div class="text-center mb-3 sm:mb-8">
        <h2
          class="text-base sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1 sm:mb-2"
        >
          Chuyển Đổi và Xem Thông Tin Hoàn Tiền
        </h2>
        <p class="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-0">
          <template v-if="currentType === AFFILIATE_TYPES.SHOPEEFOOD">
            Dán link quán hoặc món <strong>ShopeeFood</strong>
          </template>
          <template v-else>
            Dán link sản phẩm
            <strong>{{
              currentType === AFFILIATE_TYPES.SHOPEE
                ? "Shopee"
                : currentType === AFFILIATE_TYPES.TIKTOK
                ? "TikTok"
                : "Lazada"
            }}</strong>
          </template>
          vào bên dưới để nhận hoàn tiền.
        </p>
      </div>

      <!-- Input Form -->
      <div class="flex flex-col gap-4">
        <a-input
          ref="urlInput"
          v-model:value="rawUrl"
          placeholder="Dán link Sản phẩm tại đây"
          size="large"
          :disabled="isLoading"
          allow-clear
          class="rounded-xl font-semibold"
          @change="checkUrlInput"
          @pressEnter="handleConvert"
        >
          <template #prefix>
            <LinkOutlined class="text-slate-400" />
          </template>
          <template v-if="!rawUrl" #suffix>
            <a-button
              size="small"
              type="primary"
              ghost
              class="font-bold text-[10px] rounded-lg"
              @click="handlePaste"
              :disabled="isLoading"
            >
              Dán nhanh
            </a-button>
          </template>
        </a-input>

        <!-- Inline validation warning -->
        <transition name="slide-fade">
          <div
            v-if="isValidating && !isUrlValid && rawUrl.length > 0"
            class="flex items-center gap-2 text-amber-600 text-xs font-semibold px-2"
          >
            <WarningOutlined />
            <span
              >Không nhận dạng được định dạng link. Vui lòng kiểm tra lại.</span
            >
          </div>
        </transition>

        <!-- Auto-detect hint -->
        <transition name="slide-fade">
          <div
            v-if="autoDetectedTypeName && isUrlValid && rawUrl.length > 0"
            class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold px-2"
          >
            <span class="text-sm">✨</span>
            <span
              >Đã tự động nhận diện link
              <strong>{{ autoDetectedTypeName }}</strong></span
            >
          </div>
        </transition>

        <!-- Convert Button -->
        <a-button
          type="primary"
          block
          size="large"
          :loading="isLoading"
          :disabled="isLoading || !rawUrl"
          class="h-[52px] font-bold text-sm tracking-widest uppercase rounded-xl shadow-lg shadow-orange-500/20"
          @click="handleConvert"
        >
          Hoàn tiền
        </a-button>
      </div>

      <!-- Error Alert -->
      <transition name="slide-fade">
        <a-alert
          v-if="error"
          type="error"
          :message="error"
          show-icon
          closable
          banner
          class="mt-4 rounded-xl"
        />
      </transition>

      <!-- Shopee High Commission Products -->
      <ShopeeHighCommission
        v-show="currentType === AFFILIATE_TYPES.SHOPEE"
        @get-link="handleGetProductLink"
      />
    </a-card>

    <!-- Result Card Component -->
    <ConvertLinkResult
      v-if="resultLink && !isLoading"
      :link="resultLink"
      :affiliate-link="affiliateLink"
      :product-info="productInfo"
      :platform-type="currentType"
      @reset="handleCloseModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted } from "vue";
import { LinkOutlined, WarningOutlined } from "@ant-design/icons-vue";
import { useShopeeApi } from "@/composables/useShopeeApi";
import { AFFILIATE_TYPES, detectPlatformFromUrl } from "@/utils/constants";
import { useAuthStore } from "@/stores/auth";
import ConvertLinkResult from "./ConvertLinkResult.vue";
import ShopeeHighCommission from "./ShopeeHighCommission.vue";

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const platforms = computed(() => {
  return (
    user.value?.platforms || {
      shopee: true,
      tiktok: true,
      lazada: false,
      shopeefood: true,
    }
  );
});

const currentType = ref(AFFILIATE_TYPES.SHOPEE);
const rawUrl = ref("");
const isValidating = ref(false);
const urlInput = ref(null);
const autoDetectedTypeName = ref("");

const {
  resultLink,
  affiliateLink,
  productInfo,
  isLoading,
  error,
  convertUrl,
  clearStates,
  validateShopeeUrl,
  validateShopeeFoodUrl,
  validateTiktokUrl,
  validateLazadaUrl,
} = useShopeeApi();

const initDefaultTab = () => {
  if (platforms.value) {
    if (!platforms.value.shopee && platforms.value.tiktok) {
      currentType.value = AFFILIATE_TYPES.TIKTOK;
    } else if (
      !platforms.value.shopee &&
      !platforms.value.tiktok &&
      platforms.value.lazada
    ) {
      currentType.value = AFFILIATE_TYPES.LAZADA;
    } else if (
      !platforms.value.shopee &&
      !platforms.value.tiktok &&
      !platforms.value.lazada &&
      platforms.value.shopeefood
    ) {
      currentType.value = AFFILIATE_TYPES.SHOPEEFOOD;
    } else {
      currentType.value = AFFILIATE_TYPES.SHOPEE;
    }
  }
};

onMounted(() => {
  initDefaultTab();
});
watch(
  platforms,
  () => {
    initDefaultTab();
  },
  { deep: true }
);

const getPlatformName = (type) => {
  switch (type) {
    case AFFILIATE_TYPES.SHOPEE:
      return "Shopee";
    case AFFILIATE_TYPES.TIKTOK:
      return "TikTok";
    case AFFILIATE_TYPES.LAZADA:
      return "Lazada";
    case AFFILIATE_TYPES.SHOPEEFOOD:
      return "ShopeeFood";
    default:
      return "";
  }
};

watch(rawUrl, (newUrl) => {
  if (newUrl) {
    const detectedType = detectPlatformFromUrl(newUrl);
    if (detectedType) {
      if (currentType.value !== detectedType) {
        currentType.value = detectedType;
        autoDetectedTypeName.value = getPlatformName(detectedType);
      } else {
        autoDetectedTypeName.value = "";
      }
    } else {
      autoDetectedTypeName.value = "";
    }
  } else {
    autoDetectedTypeName.value = "";
  }
});

const isUrlValid = computed(() => {
  if (currentType.value === AFFILIATE_TYPES.TIKTOK)
    return validateTiktokUrl(rawUrl.value);
  if (currentType.value === AFFILIATE_TYPES.LAZADA)
    return validateLazadaUrl(rawUrl.value);
  if (currentType.value === AFFILIATE_TYPES.SHOPEEFOOD)
    return validateShopeeFoodUrl(rawUrl.value);
  return validateShopeeUrl(rawUrl.value);
});

const checkUrlInput = () => {
  isValidating.value = true;
};

const handleGetProductLink = (product) => {
  rawUrl.value = product.productLink;

  nextTick(() => {
    // Cuộn mượt mà đến đúng vị trí ô input
    if (urlInput.value && urlInput.value.$el) {
      urlInput.value.$el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    urlInput.value?.focus();
  });

  checkUrlInput();
};

const handleConvert = async () => {
  if (!rawUrl.value || isLoading.value) return;
  isValidating.value = true;
  await convertUrl(rawUrl.value, currentType.value);
};

const handleCloseModal = () => {
  clearStates();
};

const handleClear = () => {
  rawUrl.value = "";
  isValidating.value = false;
  autoDetectedTypeName.value = "";
  clearStates();
};

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      rawUrl.value = text.trim();
      isValidating.value = true;
    }
  } catch (err) {
    console.error("Không thể đọc bộ nhớ tạm:", err);
  }
};

const selectType = (type) => {
  currentType.value = type;
  autoDetectedTypeName.value = "";
  handleClear();
  nextTick(() => {
    if (urlInput.value && urlInput.value.$el) {
      urlInput.value.$el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    urlInput.value?.focus();
  });
};
</script>

<style scoped>
:deep(.ant-input-affix-wrapper) {
  border-radius: 12px;
  padding: 10px 14px;
}

:deep(.ant-input) {
  border-radius: 12px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
