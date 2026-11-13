<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { message } from "ant-design-vue";
import {
  CheckOutlined,
  CopyOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

type ProductInfo = {
  productName?: string;
  productLink?: string;
  imageUrl?: string;
  commission?: number;
  user_commission?: number;
  userCommission?: number;
  userSharePercentage?: number;
  serviceFeeRate?: number;
  taxRate?: number;
  totalRatePercent?: number | string;
};
type ConvertResult = {
  originalLink: string;
  affiliateLink: string;
  productInfo: ProductInfo | null;
  subId: string;
  type: 1 | 2;
};

const inputLink = ref("");
const errorMessage = ref("");
const isConverting = ref(false);
const copied = ref(false);
const result = ref<ConvertResult | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const selectedPlatform = ref<1 | 2>(1);
const platforms = reactive({ shopee: true, tiktok: false });
const SHOPEE_LINK_REGEX =
  /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(shopee\.vn|shp\.ee)\/[^\s]+/i;
const TIKTOK_LINK_REGEX =
  /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?tiktok\.com\/[^\s]+/i;

function clearInput() {
  inputLink.value = "";
  errorMessage.value = "";
  inputRef.value?.focus();
}

const product = computed(() => result.value?.productInfo);
const isTikTokResult = computed(() => result.value?.type === 2);
const platformName = computed(() => isTikTokResult.value ? "TikTok" : "Shopee");

function selectPlatform(platform: 1 | 2) {
  selectedPlatform.value = platform;
  inputLink.value = "";
  errorMessage.value = "";
  result.value = null;
  inputRef.value?.focus();
}

function detectPlatform(link: string) {
  if (platforms.tiktok && TIKTOK_LINK_REGEX.test(link)) selectedPlatform.value = 2;
  else if (platforms.shopee && SHOPEE_LINK_REGEX.test(link)) selectedPlatform.value = 1;
}

function handleInput() {
  errorMessage.value = "";
  result.value = null;
  detectPlatform(inputLink.value);
}

const grossCommissionText = computed(() => {
  const value = Number(product.value?.commission);
  return Number.isFinite(value) && value > 0
    ? `${new Intl.NumberFormat("vi-VN").format(Math.round(value))}đ`
    : "Chưa xác định";
});

const afterTaxText = computed(() => {
  const value = Number(product.value?.commission);
  const serviceFeeRate = Number(product.value?.serviceFeeRate ?? 1);
  const taxRate = Number(product.value?.taxRate ?? 10);
  return Number.isFinite(value) && value > 0
    ? `${new Intl.NumberFormat("vi-VN").format(
        Math.round(value * (1 - (serviceFeeRate + taxRate) / 100))
      )}đ`
    : "Chưa xác định";
});

const shareRateText = computed(() => {
  const rate = Number(product.value?.userSharePercentage ?? 80);
  if (Number.isFinite(rate) && rate > 0 && product.value?.commission) {
    return `${rate}%`;
  }
  return "Chưa xác định";
});

const userNetText = computed(() => {
  const userCommVal = Number(
    product.value?.user_commission ?? product.value?.userCommission
  );
  if (Number.isFinite(userCommVal) && userCommVal > 0) {
    return `${new Intl.NumberFormat("vi-VN").format(Math.round(userCommVal))}đ`;
  }
  if (isTikTokResult.value) return "Chưa xác định";
  const commVal = Number(product.value?.commission);
  if (Number.isFinite(commVal) && commVal > 0) {
    const calculated = Math.round(commVal * 0.89 * 0.8);
    return `${new Intl.NumberFormat("vi-VN").format(calculated)}đ`;
  }
  return "Chưa xác định";
});

async function handlePaste() {
  try {
    inputLink.value = (await navigator.clipboard.readText()).trim();
    detectPlatform(inputLink.value);
    errorMessage.value = "";
    inputRef.value?.focus();
  } catch {
    message.warning("Vui lòng cấp quyền bộ nhớ tạm hoặc dán thủ công!");
  }
}

function validateLink(link: string) {
  const name = selectedPlatform.value === 2 ? "TikTok" : "Shopee";
  if (!link) return `Vui lòng dán link sản phẩm ${name}!`;
  const valid = selectedPlatform.value === 2
    ? TIKTOK_LINK_REGEX.test(link)
    : SHOPEE_LINK_REGEX.test(link);
  if (!valid) return `Link không hợp lệ. Vui lòng nhập link sản phẩm ${name}.`;
  return "";
}

async function handleConvert() {
  const link = inputLink.value.trim();
  errorMessage.value = validateLink(link);
  if (errorMessage.value) return inputRef.value?.focus();
  isConverting.value = true;
  result.value = null;
  try {
    const response = await api.post<ApiResponse<ConvertResult>>(
      "/api/user/convert-link",
      { link, type: selectedPlatform.value }
    );
    if (!response.data.data) throw new Error(response.data.message);
    result.value = response.data.data;
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message ||
      error.message ||
      "Không thể chuyển đổi link. Vui lòng thử lại.";
  } finally {
    isConverting.value = false;
  }
}

async function copyLink() {
  if (!result.value) return;
  await navigator.clipboard.writeText(result.value.affiliateLink);
  copied.value = true;
  message.success("Đã sao chép link hoàn tiền!");
  setTimeout(() => {
    copied.value = false;
  }, 1800);
}

function openAffiliateLink() {
  if (result.value?.affiliateLink)
    window.open(result.value.affiliateLink, "_blank", "noopener,noreferrer");
}

onMounted(async () => {
  try {
    const response = await api.get<ApiResponse<{ shopee: boolean; tiktok: boolean }>>(
      "/api/user/platform-status"
    );
    if (response.data.data) Object.assign(platforms, response.data.data);
    if (!platforms.shopee && platforms.tiktok) selectedPlatform.value = 2;
    else if (platforms.shopee && !platforms.tiktok) selectedPlatform.value = 1;
  } catch {
    // Giữ Shopee là lựa chọn mặc định nếu chưa tải được cấu hình nền tảng.
  }
});
</script>

<template>
  <div class="w-full">
    <div
      class="w-full rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-7 shadow-xs"
    >
      <div
        v-if="platforms.shopee || platforms.tiktok"
        :class="[
          'mb-5 grid gap-2 rounded-2xl bg-slate-100 p-1.5 sm:mx-auto sm:max-w-sm',
          platforms.shopee && platforms.tiktok ? 'grid-cols-2' : 'grid-cols-1',
        ]"
      >
        <button
          v-if="platforms.shopee"
          type="button"
          :class="[
            'flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black transition cursor-pointer',
            selectedPlatform === 1
              ? 'bg-white text-[#ee4d2d] shadow-sm'
              : 'text-slate-500 hover:text-slate-800',
          ]"
          @click="selectPlatform(1)"
        >
          <img src="/logo/shopee.png" alt="Shopee" class="h-5 w-5 object-contain" />
          Shopee
        </button>
        <button
          v-if="platforms.tiktok"
          type="button"
          :class="[
            'flex h-10 items-center justify-center gap-2 rounded-xl text-xs font-black transition cursor-pointer',
            selectedPlatform === 2
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800',
          ]"
          @click="selectPlatform(2)"
        >
          <img src="/logo/TikTok.svg" alt="TikTok" class="h-4 w-auto object-contain" />
          TikTok
        </button>
      </div>

      <div
        v-if="!platforms.shopee && !platforms.tiktok"
        class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold text-amber-700"
      >
        Tính năng tạo link hoàn tiền đang tạm tắt.
      </div>

      <div
        v-else
        :class="[
          'rounded-2xl border bg-white p-2 transition shadow-xs',
          errorMessage
            ? 'border-rose-400 ring-4 ring-rose-100'
            : 'border-gray-200/90 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100/60',
        ]"
      >
        <div
          class="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center"
        >
          <div
            class="relative flex min-w-0 flex-1 items-center rounded-xl bg-gray-50/90 px-3 py-0.5 border border-gray-100/90"
          >
            <input
              ref="inputRef"
              v-model="inputLink"
              type="text"
              :placeholder="`🔗 Dán link sản phẩm ${selectedPlatform === 2 ? 'TikTok' : 'Shopee'}...`"
              class="converter-link-input min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-1 text-xs sm:text-base text-gray-800 placeholder:text-[12.5px] sm:placeholder:text-base focus:outline-none"
              @input="handleInput"
              @keydown.enter.prevent="handleConvert"
            />
            <button
              v-if="inputLink"
              type="button"
              class="flex shrink-0 items-center justify-center p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer mr-1.5"
              title="Xóa link"
              @click="clearInput"
            >
              <CloseCircleOutlined
                class="text-base text-slate-400 hover:text-slate-600"
              />
            </button>
            <button
              type="button"
              class="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-orange-200/80 bg-[#fff2ee] px-3.5 py-1.5 text-xs font-bold text-[#ff5733] transition hover:bg-[#ffe6df] active:scale-95 cursor-pointer shadow-2xs sm:text-sm"
              @click="handlePaste"
            >
              📋 <span>Dán</span>
            </button>
          </div>
          <button
            type="button"
            :disabled="isConverting"
            class="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ff5733] px-6 py-3.5 text-base font-bold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#e04725] active:scale-98 disabled:cursor-wait disabled:opacity-70 cursor-pointer"
            @click="handleConvert"
          >
            <span class="text-white">Tạo link hoàn tiền</span>
          </button>
        </div>
      </div>

      <div
        v-if="isConverting"
        class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
      >
        <div class="mb-5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="h-4 w-4 animate-pulse rounded bg-orange-100"></span
            ><span class="h-3 w-20 animate-pulse rounded bg-slate-200"></span>
          </div>
          <span
            class="h-6 w-16 animate-pulse rounded-full bg-emerald-50"
          ></span>
        </div>
        <div class="flex gap-3">
          <span
            class="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-slate-200"
          ></span>
          <div class="flex-1 space-y-2.5 pt-1">
            <span
              class="block h-3.5 w-full animate-pulse rounded bg-slate-200"
            ></span
            ><span
              class="block h-3.5 w-3/4 animate-pulse rounded bg-slate-200"
            ></span
            ><span
              class="block h-2.5 w-20 animate-pulse rounded bg-slate-100"
            ></span>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-3">
          <span class="h-[70px] animate-pulse rounded-xl bg-slate-100"></span
          ><span class="h-[70px] animate-pulse rounded-xl bg-slate-100"></span>
        </div>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <span class="h-11 animate-pulse rounded-xl bg-slate-100"></span
          ><span class="h-11 animate-pulse rounded-xl bg-orange-100"></span>
        </div>
        <div
          class="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400"
        >
          <span
            class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-orange-100 border-t-[#ee4d2d]"
          ></span
          >Đang chuyển đổi link...
        </div>
      </div>

      <div
        v-else-if="errorMessage"
        class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600"
      >
        <div class="flex items-start gap-2">
          <WarningOutlined class="mt-0.5 shrink-0 text-sm" /><span>{{
            errorMessage
          }}</span>
        </div>
      </div>

      <div
        v-else-if="result"
        class="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white text-left"
      >
        <div class="p-4 sm:p-5">
          <div class="mb-4 flex items-center justify-between">
            <div
              class="flex items-center gap-2 text-sm font-black text-slate-800"
            >
              <component
                :is="isTikTokResult ? VideoCameraOutlined : ShoppingCartOutlined"
                :class="isTikTokResult ? '!text-black' : '!text-[#ee4d2d]'"
              /><span
                >{{ platformName }}</span
              >
            </div>
            <span
              class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600"
              >✓ Hỗ trợ</span
            >
          </div>
          <div class="flex items-start gap-3">
            <div
              class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <img
                v-if="product?.imageUrl"
                :src="product.imageUrl"
                :alt="product.productName"
                class="h-full w-full object-cover"
              />
              <div
                v-else-if="isTikTokResult"
                class="flex h-10 w-12 items-center justify-center rounded-xl bg-black p-1.5"
              >
                <img src="/logo/TikTok.svg" alt="TikTok" class="w-full object-contain" />
              </div>
              <img
                v-else
                src="/logo/shopee.png"
                alt="Shopee"
                class="h-9 w-9 object-contain opacity-60"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="line-clamp-2 text-base sm:text-lg font-black leading-snug text-slate-950 tracking-tight"
                style="font-weight: 900"
              >
                {{ product?.productName || `Sản phẩm ${isTikTokResult ? 'TikTok Shop' : 'Shopee'}` }}
              </div>
            </div>
          </div>
          <!-- Financial Metric Grid (2 cols on mobile, 4 cols on sm+) -->
          <div
            class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-0 bg-[#f8fbfb] border border-slate-200/80 rounded-2xl sm:divide-x sm:divide-slate-200/80 text-center p-2 sm:py-3 sm:px-1"
          >
            <!-- Col 1: HH ĐƠN -->
            <div
              class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
            >
              <div
                class="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                HH ĐƠN
              </div>
              <div
                class="text-sm sm:text-base font-extrabold text-slate-900 truncate w-full"
              >
                {{ grossCommissionText }}
              </div>
            </div>

            <!-- Col 2: SAU THUẾ -->
            <div
              class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
            >
              <div
                class="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                SAU THUẾ
              </div>
              <div
                class="text-sm sm:text-base font-extrabold text-slate-900 truncate w-full"
              >
                {{ afterTaxText }}
              </div>
            </div>

            <!-- Col 3: % NHẬN -->
            <div
              class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
            >
              <div
                class="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                % NHẬN
              </div>
              <div
                class="text-sm sm:text-base font-extrabold text-slate-900 truncate w-full"
              >
                {{ shareRateText }}
              </div>
            </div>

            <!-- Col 4: NHẬN VỀ -->
            <div
              class="flex flex-col justify-between items-center rounded-xl bg-white sm:bg-transparent p-2 sm:p-0 border border-slate-100 sm:border-0 space-y-0.5"
            >
              <div
                class="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                NHẬN VỀ
              </div>
              <div
                class="text-sm sm:text-base font-black text-[#00b087] truncate w-full"
              >
                {{ userNetText }}
              </div>
            </div>
          </div>

          <!-- Note disclaimer above action buttons -->
          <p
            class="mt-3 text-xs sm:text-sm text-slate-500 text-center leading-relaxed font-semibold"
          >
            * Thông tin hoa hồng chỉ là ước tính (đã trừ thuế trước khi hoàn cho
            bạn), hoa hồng thực tế do sàn ghi nhận.
          </p>

          <div class="mt-3.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="flex h-10 sm:h-11 items-center justify-center gap-1 px-1.5 sm:px-3 rounded-xl bg-slate-100 text-[11px] sm:text-xs font-extrabold text-slate-700 transition hover:bg-slate-200 cursor-pointer whitespace-nowrap overflow-hidden"
              @click="copyLink"
            >
              <component :is="copied ? CheckOutlined : CopyOutlined" class="text-xs shrink-0" />
              <span class="whitespace-nowrap truncate">{{
                copied ? "Đã sao chép" : "Sao chép link"
              }}</span>
            </button>
            <button
              type="button"
              :class="[
                'buy-now-button flex h-10 sm:h-11 items-center justify-center gap-1 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs font-extrabold transition cursor-pointer whitespace-nowrap overflow-hidden',
                { 'buy-now-button--tiktok': isTikTokResult },
              ]"
              @click="openAffiliateLink"
            >
              <ShoppingCartOutlined class="text-xs shrink-0" />
              <span class="whitespace-nowrap truncate">Mua với {{ platformName }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.converter-link-input,
.converter-link-input:hover,
.converter-link-input:focus,
.converter-link-input:focus-visible {
  border: 0;
  outline: none !important;
  box-shadow: none !important;
  -webkit-appearance: none;
}

.buy-now-button {
  border: 0;
  background: linear-gradient(135deg, #ee4d2d 0%, #ff5722 100%);
  color: #ffffff !important;
  box-shadow: 0 6px 16px rgba(238, 77, 45, 0.25);
}

.buy-now-button:hover {
  background: linear-gradient(135deg, #d83d1e 0%, #f04814 100%);
  color: #ffffff !important;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(238, 77, 45, 0.35);
}

.buy-now-button--tiktok,
.buy-now-button--tiktok:hover {
  background: #000000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
}

.buy-now-button :deep(.anticon),
.buy-now-button span {
  color: #ffffff !important;
}
</style>
