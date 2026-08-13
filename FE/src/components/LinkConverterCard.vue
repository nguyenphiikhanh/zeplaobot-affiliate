<script setup lang="ts">
import { computed, ref } from "vue";
import { message } from "ant-design-vue";
import {
  CheckOutlined,
  CopyOutlined,
  ShoppingCartOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons-vue";
import { api, type ApiResponse } from "../services/api";

type ProductInfo = {
  productName?: string;
  productLink?: string;
  imageUrl?: string;
  commission?: number;
  user_commission?: number;
  userCommission?: number;
  rating?: number | string;
  sold?: number | string;
  sales?: number | string;
};
type ConvertResult = {
  originalLink: string;
  affiliateLink: string;
  productInfo: ProductInfo | null;
  subId: string;
};

const inputLink = ref("");
const errorMessage = ref("");
const isConverting = ref(false);
const copied = ref(false);
const result = ref<ConvertResult | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const SHOPEE_LINK_REGEX =
  /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(shopee\.vn|shp\.ee)\/[^\s]+/i;

function clearInput() {
  inputLink.value = "";
  errorMessage.value = "";
  inputRef.value?.focus();
}

const product = computed(() => result.value?.productInfo);
const commission = computed(() => {
  const value = Number(product.value?.commission);
  return Number.isFinite(value) && value > 0
    ? `${new Intl.NumberFormat("vi-VN").format(value)}đ`
    : "Chưa xác định";
});
const commissionRate = computed(() => {
  const value = String(product.value?.rating ?? "")
    .replace("%", "")
    .trim();
  return value && Number.isFinite(Number(value))
    ? `${Number(value).toLocaleString("vi-VN")}%`
    : "3-10%";
});
const userCommission = computed(() => {
  const userCommVal = Number(
    product.value?.user_commission ?? product.value?.userCommission
  );
  if (Number.isFinite(userCommVal) && userCommVal > 0) {
    return `${new Intl.NumberFormat("vi-VN").format(userCommVal)}đ`;
  }
  const commVal = Number(product.value?.commission);
  if (Number.isFinite(commVal) && commVal > 0) {
    const calculated = Math.round(commVal * 0.712);
    return `${new Intl.NumberFormat("vi-VN").format(calculated)}đ`;
  }
  return "Chưa xác định";
});
const sold = computed(() => product.value?.sold ?? product.value?.sales ?? 0);

async function handlePaste() {
  try {
    inputLink.value = (await navigator.clipboard.readText()).trim();
    errorMessage.value = "";
    inputRef.value?.focus();
  } catch {
    message.warning("Vui lòng cấp quyền bộ nhớ tạm hoặc dán thủ công!");
  }
}

function validateLink(link: string) {
  if (!link) return "Vui lòng dán link sản phẩm Shopee!";
  if (!SHOPEE_LINK_REGEX.test(link))
    return "Link không hợp lệ. Vui lòng nhập link sản phẩm Shopee.";
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
      { link }
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
</script>

<template>
  <div class="relative z-20 mx-auto max-w-3xl px-4 sm:px-6">
    <div
      class="relative z-10 rounded-3xl border border-gray-100 bg-white/95 p-6 shadow-xl shadow-gray-200/60 backdrop-blur-xl sm:p-8"
    >
      <div class="mb-6 flex items-center justify-center">
        <img
          src="/logo/shopee.png"
          alt="Shopee"
          class="h-8 w-auto object-contain"
        />
      </div>

      <div
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
              placeholder="🔗 Dán link sản phẩm Shopee..."
              class="converter-link-input min-w-0 flex-1 border-0 bg-transparent py-2.5 pr-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none sm:text-base"
              @input="errorMessage = ''"
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
            <span class="text-white">Chuyển đổi link</span>
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
              <ShoppingCartOutlined class="!text-[#ee4d2d]" /><span
                >Shopee</span
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
              /><img
                v-else
                src="/logo/shopee.png"
                alt="Shopee"
                class="h-9 w-9 object-contain opacity-60"
              />
            </div>
            <div class="min-w-0 flex-1">
              <div
                class="line-clamp-2 text-sm font-bold leading-5 text-slate-800"
              >
                {{ product?.productName || "Sản phẩm Shopee" }}
              </div>
              <div class="mt-1.5 text-xs text-slate-400">
                · {{ sold }} đã bán
              </div>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
            <div
              class="rounded-xl border border-slate-200 px-3 py-4 text-center"
            >
              <div class="text-lg font-black text-[#e85a43]">
                {{ commission }}
              </div>
              <div class="mt-1 text-[10px] text-slate-400">Hoa hồng</div>
            </div>
            <div
              class="rounded-xl border border-slate-200 px-3 py-4 text-center"
            >
              <div class="text-lg font-black text-[#e85a43]">
                {{ userCommission }}
              </div>
              <div class="mt-1 text-[10px] text-slate-400">
                Bạn dự kiến nhận
              </div>
            </div>
          </div>

          <!-- Note disclaimer above action buttons -->
          <p
            class="mt-3 text-[11px] sm:text-xs text-slate-400 text-center leading-relaxed font-medium"
          >
            * Thông tin hoa hồng ước tính(đã trừ thuế trước khi hoàn cho bạn),
            hoa hồng thực tế do sàn ghi nhận.
          </p>

          <div class="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              class="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              @click="copyLink"
            >
              <component :is="copied ? CheckOutlined : CopyOutlined" /><span>{{
                copied ? "Đã sao chép" : "Copy link"
              }}</span>
            </button>
            <button
              type="button"
              class="buy-now-button flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold transition"
              @click="openAffiliateLink"
            >
              <ShoppingCartOutlined /><span>Mua ngay</span>
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
  background: #e85a4f;
  color: #fff;
  box-shadow: 0 6px 14px rgb(232 90 79 / 20%);
}

.buy-now-button:hover {
  background: #d94a40;
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgb(232 90 79 / 28%);
}

.buy-now-button :deep(.anticon),
.buy-now-button span {
  color: #fff;
}
</style>
