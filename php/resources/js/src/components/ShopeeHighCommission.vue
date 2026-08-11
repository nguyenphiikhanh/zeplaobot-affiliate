<template>
  <div class="mt-6 border-t border-slate-100 dark:border-slate-800 pt-6" ref="componentRoot">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3
          class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"
        >
          <span class="text-[#ee4d2d]">🔥</span> Sản phẩm hoa hồng cao
        </h3>
        <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Có thể chứa sản phẩm bạn cần, tìm kiếm sản phẩm với hoa hồng hoàn cao
          nhất
        </p>
      </div>
    </div>

    <!-- Toolbar: Search -->
    <div class="mb-3">
      <a-input
        v-model:value="searchQuery"
        placeholder="Tìm kiếm sản phẩm..."
        allow-clear
        class="w-full rounded-xl"
        size="large"
        @pressEnter="handleSearch"
      >
        <template #prefix>
          <SearchOutlined class="text-slate-400 mr-1" />
        </template>
        <template #suffix>
          <a-button
            type="primary"
            class="!bg-[#ee4d2d] hover:!bg-[#d73f1f] !border-none !rounded-lg px-3.5 h-7 font-bold text-xs flex items-center justify-center shadow-sm transition-colors"
            @click="handleSearch"
          >
            Tìm
          </a-button>
        </template>
      </a-input>
    </div>

    <!-- Product List (Scrollable) -->
    <div
      ref="scrollContainerRef"
      class="max-h-[480px] overflow-y-auto pr-1 -mr-1 custom-scrollbar"
    >
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 pb-3"
      >
        <template v-if="isLoading">
          <div
            v-for="i in 12"
            :key="`skel-${i}`"
            class="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col"
          >
            <div class="relative aspect-square bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
            <div class="p-1.5 sm:p-2.5 flex flex-col flex-1 gap-1.5">
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full"></div>
              <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4 mb-auto"></div>
              <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2 mt-1"></div>
              <div class="h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-full mt-1"></div>
            </div>
          </div>
        </template>
        <template v-else>
          <div
            v-for="product in products"
            :key="product.productLink"
            class="bg-white dark:bg-slate-800 rounded-lg sm:rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-[#ee4d2d]/40 dark:hover:border-[#ee4d2d]/60 transition-all group flex flex-col"
          >
            <!-- Image Section -->
            <div
              class="relative aspect-square bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0"
            >
              <img
                :src="product.imageUrl"
                :alt="product.productName"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <!-- Rating Star Overlay -->
              <div
                v-if="parseFloat(product.ratingStar) > 4"
                class="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-1 py-0.2 flex items-center gap-0.5 leading-tight rounded-bl shadow-sm"
              >
                <span>{{ parseFloat(product.ratingStar).toFixed(1) }}</span>
                <StarFilled class="text-[8px]" />
              </div>
            </div>

            <!-- Content Section -->
            <div class="p-1.5 sm:p-2.5 flex flex-col flex-1">
              <h4
                class="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 leading-tight mb-1 min-h-[28px] sm:min-h-[32px]"
              >
                {{ product.productName }}
              </h4>

              <div class="mt-auto">
                <!-- Price -->
                <div class="text-[#ee4d2d] font-bold text-xs sm:text-sm">
                  <span class="text-[9px] underline align-top mr-0.5">đ</span>{{ formatPrice(product.price) }}
                </div>

                <!-- Commission Rate -->
                <div class="text-[#ee4d2d] text-[9px] sm:text-[10px] font-medium mb-1.5">
                  Hoa hồng {{ (parseFloat(product.commissionRate) * 100).toFixed(0) }}%
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 mt-auto">
                  <!-- Get Link Button -->
                  <a-button
                    size="small"
                    class="flex-1 !h-5 sm:!h-6 !text-[10px] sm:!text-[11px] !border-[#ee4d2d] !text-[#ee4d2d] !rounded font-bold hover:!bg-[#ee4d2d]/10 flex items-center justify-center transition-colors px-1"
                    @click="$emit('get-link', product)"
                  >
                    Lấy link
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div
          v-if="!isLoading && products.length === 0"
          class="col-span-full py-8 text-center text-slate-500"
        >
          Không tìm thấy sản phẩm nào phù hợp.
        </div>
      </div>

      <!-- Load More / End Indicator -->
      <div class="py-4 text-center text-slate-500 text-sm" ref="loadMoreRef">
        <template v-if="products.length > 0">
          <div
            v-if="isFetchingMore || isLoading"
            class="flex items-center justify-center gap-2"
          >
            <LoadingOutlined /> Đang tải thêm sản phẩm...
          </div>
          <div v-else-if="!hasNextPage">Đã hiển thị hết sản phẩm</div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import {
  SearchOutlined,
  LoadingOutlined,
  StarFilled,
} from "@ant-design/icons-vue";
import axios from "@/api/axios";

// Emits
const emit = defineEmits(["get-link"]);

// State
const searchQuery = ref("");
const products = ref([]);
const page = ref(1);
const hasNextPage = ref(true);
const isLoading = ref(false);
const isFetchingMore = ref(false);
const loadMoreRef = ref(null);
const scrollContainerRef = ref(null);
const componentRoot = ref(null);
const hasInitiallyFetched = ref(false);

let observer = null;

const fetchProducts = async (isLoadMore = false) => {
  if (isLoadMore && (!hasNextPage.value || isFetchingMore.value)) return;
  if (!isLoadMore && isLoading.value) return;

  if (isLoadMore) {
    isFetchingMore.value = true;
  } else {
    isLoading.value = true;
  }

  try {
    const res = await axios.get("/link/product/list", {
      params: {
        page: page.value,
        keyword: searchQuery.value || undefined,
      },
    });

    const data = res.data?.data || res.data || {};
    const nodes = data.nodes || [];

    if (isLoadMore) {
      products.value = [...products.value, ...nodes];
    } else {
      products.value = nodes;
    }

    hasNextPage.value = !!data.pageInfo?.hasNextPage;
  } catch (err) {
    console.error("Failed to fetch products", err);
  } finally {
    if (isLoadMore) {
      isFetchingMore.value = false;
    } else {
      isLoading.value = false;
    }
  }
};

const handleSearch = () => {
  page.value = 1;
  fetchProducts();
};

watch(searchQuery, (newVal) => {
  if (!newVal) {
    handleSearch();
  }
});

const setupObserver = () => {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver(
    (entries) => {
      if (
        entries[0].isIntersecting &&
        hasNextPage.value &&
        !isLoading.value &&
        !isFetchingMore.value
      ) {
        page.value++;
        fetchProducts(true);
      }
    },
    { root: scrollContainerRef.value, threshold: 0.1, rootMargin: "100px" }
  );

  if (loadMoreRef.value) {
    observer.observe(loadMoreRef.value);
  }
};

onMounted(() => {
  fetchProducts();
  setupObserver();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

// Methods
const formatPrice = (price) => {
  return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "0";
};
</script>

<style scoped>
/* Fix lỗi iOS tự động zoom khi focus input (yêu cầu font-size >= 16px) */
:deep(.ant-input) {
  font-size: 16px !important;
}

/* Tùy chỉnh thanh cuộn cho khu vực danh sách sản phẩm */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}
:deep(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
