<template>
  <a-modal
    v-model:open="visible"
    :after-close="handleAfterClose"
    :footer="null"
    :centered="true"
    :width="560"
    :closable="false"
    :maskClosable="true"
    wrap-class-name="convert-result-modal"
    @cancel="closeModal"
  >
    <!-- 1. PRODUCT DETAILS CARD -->
    <div v-if="productInfo" class="result-card">
      <!-- Header gradient line -->
      <div class="result-header-line result-header-line--shopee"></div>

      <!-- Header -->
      <div class="result-header">
        <div class="result-header-left">
          <h3 class="result-title">Chi tiết hoàn tiền</h3>
        </div>
        <button @click="closeModal" class="result-close-btn" aria-label="Đóng">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="result-body">
        <!-- Product row -->
        <div class="product-row">
          <!-- Image -->
          <div class="product-image-wrap">
            <img
              :src="productInfo.imageUrl"
              :alt="productInfo.productName"
              class="product-image"
            />
            <div
              v-if="productInfo.isXtra && platformType !== 2"
              class="product-xtra-badge"
            >
              Xtra
            </div>
          </div>

          <!-- Info -->
          <div class="product-info">
            <div class="product-platform-row">
              <span
                class="product-platform-badge product-platform-badge--shopee"
              >
                {{
                  platformType === 1
                    ? "SỘP-PE"
                    : platformType === 2
                    ? "TÓP-TÓP"
                    : "LAZADA"
                }}
              </span>
              <span class="product-shop">{{ productInfo.shopName }}</span>
            </div>
            <h3 class="product-name" :title="productInfo.productName">
              {{ productInfo.productName }}
            </h3>
          </div>
        </div>

        <!-- Cashback cards -->
        <div class="cashback-grid">
          <!-- Partner commission -->
          <div class="cashback-card cashback-card--shopee">
            <div class="cashback-icon cashback-icon--shopee">%</div>
            <div>
              <div class="cashback-label cashback-label--shopee">
                HOA HỒNG ĐỐI TÁC
              </div>
              <div class="cashback-amount cashback-amount--shopee">
                {{ formatPartnerCommission(productInfo.commission)
                }}<span style="text-decoration: underline; margin-left: 2px"
                  >đ</span
                >
              </div>
            </div>
          </div>

          <!-- Saffi cashback -->
          <div class="cashback-card cashback-card--saffi">
            <div class="cashback-icon cashback-icon--saffi">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
              </svg>
            </div>
            <div>
              <div class="cashback-label cashback-label--saffi">
                SAFFI HOÀN TIỀN CHO BẠN
              </div>
              <div class="cashback-range">
                Từ
                <span class="cashback-range-amount"
                  >{{ formatCashbackRange(minCashback)
                  }}<span style="text-decoration: underline; margin-left: 2px"
                    >đ</span
                  ></span
                >
                đến
                <span class="cashback-range-amount"
                  >{{ formatCashbackRange(maxCashback)
                  }}<span style="text-decoration: underline; margin-left: 2px"
                    >đ</span
                  ></span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Affiliate Link display for Tiktok & Lazada -->
        <div
          class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="flex-1 truncate text-xs font-medium text-slate-600 dark:text-slate-400 select-all"
            :title="affiliateLink || link"
          >
            {{ affiliateLink || link }}
          </div>
          <a-button
            type="primary"
            ghost
            size="small"
            @click="copyToClipboard(affiliateLink || link)"
            class="shrink-0 flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path
                d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
              />
            </svg>
            Copy
          </a-button>
        </div>

        <!-- CTA Button -->
        <a-button
          block
          type="primary"
          size="large"
          class="result-cta-btn"
          @click="handleOpenAffiliate"
        >
          <div class="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="-mt-[1px]"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>MỞ ĐỂ MUA HÀNG NGAY</span>
          </div>
        </a-button>

        <!-- Bottom row -->
        <div class="result-footer-row">
          <a-button @click="closeModal" class="result-back-btn">
            <div class="flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M21 3v4h-4" />
              </svg>
              <span>Mua sản phẩm khác</span>
            </div>
          </a-button>
          <span class="result-disclaimer"
            >Hệ thống tự động phát hiện và tối ưu hóa hoa hồng tốt nhất cho
            bạn.</span
          >
        </div>
      </div>
    </div>

    <!-- 2. FALLBACK CONVERTED RESULT CARD -->
    <div v-else class="result-card">
      <div class="result-header-line result-header-line--success"></div>

      <div class="result-header">
        <div class="result-header-icon result-header-icon--success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 class="result-title">Đã chuyển đổi thành công!</h3>
        <button @click="closeModal" class="result-close-btn" aria-label="Đóng">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div class="result-body">
        <!-- Affiliate Link display for Tiktok & Lazada -->
        <div
          class="mb-4 flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="flex-1 truncate text-xs font-medium text-slate-600 dark:text-slate-400 select-all"
            :title="affiliateLink || link"
          >
            {{ affiliateLink || link }}
          </div>
          <a-button
            type="primary"
            ghost
            size="small"
            @click="copyToClipboard(affiliateLink || link)"
            class="shrink-0 flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
              <path
                d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
              />
            </svg>
            Copy
          </a-button>
        </div>

        <div class="fallback-actions">
          <a-button
            block
            @click="handleOpenAffiliate"
            class="fallback-btn-outline"
          >
            <div class="flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
              <span>Mở Link Trực Tiếp</span>
            </div>
          </a-button>
          <a-button
            block
            type="primary"
            @click="closeModal"
            class="fallback-btn-primary"
          >
            <div class="flex items-center justify-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                <path d="M21 3v4h-4" />
              </svg>
              <span>Tiếp Tục Chuyển Đổi</span>
            </div>
          </a-button>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { message } from "ant-design-vue";

const props = defineProps({
  link: { type: String, required: true },
  affiliateLink: { type: String, default: "" },
  productInfo: { type: Object, default: null },
  platformType: { type: Number, default: 1 },
});

const emit = defineEmits(["reset"]);

const visible = ref(false);

onMounted(() => {
  nextTick(() => {
    visible.value = true;
  });
});

const closeModal = () => {
  visible.value = false;
};

const handleAfterClose = () => {
  emit("reset");
};

const minCashback = computed(() => {
  const rate =
    props.productInfo?.commission_min_rate !== undefined
      ? props.productInfo.commission_min_rate
      : 56;
  return (props.productInfo?.commission || 0) * (rate / 100);
});

const maxCashback = computed(() => {
  const rate =
    props.productInfo?.commission_max_rate !== undefined
      ? props.productInfo.commission_max_rate
      : 84;
  return (props.productInfo?.commission || 0) * (rate / 100);
});

const handleOpenAffiliate = () => {
  const targetUrl = props.affiliateLink || props.link;
  window.open(targetUrl, "_blank", "noopener,noreferrer");
};

const formatPartnerCommission = (value) => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
};

const formatCashbackRange = (value) => {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat("vi-VN").format(Math.round(value));
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success("Đã sao chép link!");
  } catch (err) {
    message.error("Lỗi khi sao chép link!");
  }
};
</script>

<style>
/* Global modal wrap styling (not scoped) */
.convert-result-modal .ant-modal-content {
  padding: 0 !important;
  border-radius: 1.5rem !important;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.12) !important;
}

.convert-result-modal .ant-modal-body {
  padding: 0 !important;
}

/* Dark Mode Overrides */
html.dark .convert-result-modal .ant-modal-content {
  background: #0b0f19 !important;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5) !important;
  border: 1px solid #1e293b !important;
}
html.dark .result-header {
  background: #0f172a !important;
  border-color: #1e293b !important;
}
html.dark .result-title {
  color: #f8fafc !important;
}
html.dark .result-close-btn:hover {
  background: #1e293b !important;
  color: #f8fafc !important;
}
html.dark .product-image-wrap {
  background: #0f172a !important;
  border-color: #1e293b !important;
}
html.dark .product-name {
  color: #f8fafc !important;
}
html.dark .product-shop {
  color: #94a3b8 !important;
}
html.dark .cashback-card--tiktok {
  background: rgba(248, 250, 252, 0.05) !important;
  border-color: rgba(248, 250, 252, 0.1) !important;
}
html.dark .cashback-label--tiktok {
  color: #94a3b8 !important;
}
html.dark .cashback-amount--tiktok {
  color: #f8fafc !important;
}
html.dark .cashback-icon--tiktok {
  background: #1e293b !important;
  border: 1px solid #334155 !important;
}
html.dark .product-platform-badge--tiktok {
  background: #1e293b !important;
  border: 1px solid #334155 !important;
  color: #f8fafc !important;
}
html.dark .result-footer-row {
  border-color: #1e293b !important;
}
html.dark .result-back-btn {
  background: #0f172a !important;
  border-color: #1e293b !important;
  color: #f8fafc !important;
}
html.dark .result-back-btn:hover {
  background: #1e293b !important;
}
html.dark .fallback-btn-outline {
  background: transparent !important;
  border-color: #334155 !important;
  color: #f8fafc !important;
}
html.dark .fallback-btn-outline:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}
</style>

<style scoped>
.result-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
}

.result-header-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
}

.result-header-line--shopee {
  background: linear-gradient(to right, #f97316, #ee4d2d, #eab308);
}

.result-header-line--tiktok {
  background: #0f172a;
}

.result-header-line--success {
  background: linear-gradient(to right, #10b981, #14b8a6);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  background: #f8fafc;
  flex-shrink: 0;
}

.result-header-left {
  padding-right: 1.5rem;
}

.result-title {
  font-size: 12px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 0;
}

.result-header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.result-header-icon--success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.result-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.result-close-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.result-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Product row */
.product-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.product-image-wrap {
  position: relative;
  flex-shrink: 0;
  width: 96px;
  height: 96px;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.5);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
}

@media (min-width: 640px) {
  .product-image-wrap {
    width: 112px;
    height: 112px;
  }
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-xtra-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ee4d2d;
  color: white;
  font-size: 9px;
  font-weight: 800;
  text-align: center;
  padding: 2px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  user-select: none;
}

.product-info {
  flex: 1;
  min-width: 0;
  padding-top: 2px;
}

.product-platform-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.product-platform-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  user-select: none;
  color: white;
}

.product-platform-badge--shopee {
  background: #ee4d2d;
}
.product-platform-badge--tiktok {
  background: #0f172a;
}

.product-shop {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
  margin: 0;
}

@media (min-width: 640px) {
  .product-name {
    font-size: 16px;
  }
}

/* Cashback grid */
.cashback-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .cashback-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.cashback-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 1rem;
  padding: 1rem;
  border: 1px solid;
}

.cashback-card--shopee {
  background: rgba(238, 77, 45, 0.03);
  border-color: rgba(238, 77, 45, 0.1);
}

.cashback-card--tiktok {
  background: rgba(15, 23, 42, 0.02);
  border-color: rgba(15, 23, 42, 0.1);
}

.cashback-card--saffi {
  background: rgba(16, 185, 129, 0.03);
  border-color: rgba(16, 185, 129, 0.1);
}

.cashback-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  font-weight: 800;
  font-size: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cashback-icon--shopee {
  background: #ee4d2d;
}
.cashback-icon--tiktok {
  background: #0f172a;
}
.cashback-icon--saffi {
  background: #10b981;
}

.cashback-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.cashback-label--shopee {
  color: #ee4d2d;
}
.cashback-label--tiktok {
  color: #64748b;
}
.cashback-label--saffi {
  color: #059669;
}

.cashback-amount {
  font-size: 18px;
  font-weight: 800;
  margin-top: 2px;
  letter-spacing: -0.025em;
}

@media (min-width: 640px) {
  .cashback-amount {
    font-size: 20px;
  }
}

.cashback-amount--shopee {
  color: #ee4d2d;
}
.cashback-amount--tiktok {
  color: #0f172a;
}

.cashback-range {
  font-size: 12px;
  font-weight: 700;
  color: #059669;
  margin-top: 4px;
}

.cashback-range-amount {
  font-size: 14px;
}

/* CTA */
.result-cta-btn {
  height: 52px !important;
  font-weight: 800 !important;
  font-size: 13px !important;
  letter-spacing: 0.1em !important;
  text-transform: uppercase;
  border-radius: 1rem !important;
  box-shadow: 0 4px 20px rgba(238, 77, 45, 0.25) !important;
}

.result-cta-btn--tiktok {
  background: #0f172a !important;
  border-color: #0f172a !important;
}

/* Footer row */
.result-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 4px;
  border-top: 1px solid #f1f5f9;
}

.result-back-btn {
  font-weight: 700 !important;
  border-radius: 12px !important;
  font-size: 12px !important;
}

.result-disclaimer {
  font-size: 9.5px;
  font-weight: 600;
  color: #94a3b8;
  text-align: right;
  line-height: 1.5;
  max-width: 55%;
}

/* Fallback */
.fallback-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 640px) {
  .fallback-actions {
    flex-direction: row;
  }
}

.fallback-btn-outline {
  flex: 1;
  height: 52px !important;
  font-weight: 700 !important;
  border-radius: 1rem !important;
  font-size: 13px !important;
}

.fallback-btn-primary {
  flex: 1;
  height: 52px !important;
  font-weight: 700 !important;
  border-radius: 1rem !important;
  font-size: 13px !important;
  box-shadow: 0 4px 20px rgba(238, 77, 45, 0.15) !important;
}

/* Modal Open/Close Smooth Transitions */
.convert-result-modal .ant-modal-content {
  padding: 0 !important;
  border-radius: 1.5rem !important;
  overflow: hidden;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.12) !important;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease !important;
}
.convert-result-modal .ant-modal-body {
  padding: 0 !important;
}
</style>
